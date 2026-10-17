import { insist, integer, list } from './lib/validation.mjs';
function parseTime(s) {
  const m = /^(\d{2,}):(\d{2}):(\d{2}),(\d{3})$/.exec(s);
  insist(m && Number(m[2]) < 60 && Number(m[3]) < 60, `Invalid SRT time: ${s}`);
  return Number(m[1]) * 3600000 + Number(m[2]) * 60000 + Number(m[3]) * 1000 + Number(m[4]);
}
function time(ms) { integer(ms, 'time'); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; }
export function parseSrt(source) {
  insist(typeof source === 'string' && source.length <= 1000000, 'SRT text under 1 MB required');
  const blocks = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim().split(/\n[ \t]*\n/);
  list(blocks, 'cues', 5000);
  const seen = new Set();
  return blocks.map(block => {
    const [number, timing, ...lines] = block.split('\n');
    insist(/^\d+$/.test(number) && !seen.has(number), 'Invalid or duplicate cue index'); seen.add(number);
    insist(timing?.includes(' --> ') && lines.length, 'Missing SRT timestamp or text');
    const parts = timing.split(' --> '); insist(parts.length === 2, 'Invalid timestamp');
    return { number: Number(number), start: parseTime(parts[0]), end: parseTime(parts[1]), text: lines.join('\n') };
  });
}
export function validateCues(cues, cps = 20) {
  integer(cps, 'characters per second', 1, 100);
  const issues = [];
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    if (c.start < 0 || c.end <= c.start) issues.push({ cue: c.number, code: 'invalid-duration' });
    if (i && c.start < cues[i - 1].end) issues.push({ cue: c.number, code: 'overlap', previous: cues[i - 1].number });
    const length = [...c.text.replace(/\s/g, '')].length;
    if (c.end > c.start && length / ((c.end - c.start) / 1000) > cps) issues.push({ cue: c.number, code: 'reading-load', length });
  }
  return issues;
}
export function shiftCue(cues, index, delta, locked = new Set()) {
  integer(index, 'cue index', 0, cues.length - 1); insist(Number.isSafeInteger(delta), 'Integer millisecond shift required');
  insist(!locked.has(cues[index].number), 'Locked cue cannot change');
  const next = structuredClone(cues); next[index].start += delta; next[index].end += delta;
  insist(next[index].start >= 0, 'Cannot shift before start of media');
  return { cues: next, issues: validateCues(next), previous: structuredClone(cues) };
}
export function toSrt(cues) { return cues.map(c => `${c.number}\n${time(c.start)} --> ${time(c.end)}\n${c.text}`).join('\n\n') + '\n'; }
export function run({ srt, cps = 20, edits = [], locked = [] }) {
  let cues = parseSrt(srt); const history = [];
  for (const e of list(edits, 'edits', 100)) { const index = cues.findIndex(c => c.number === e.cue); insist(index >= 0, 'Unknown edited cue'); history.push(toSrt(cues)); cues = shiftCue(cues, index, e.delta, new Set(locked)).cues; }
  return { cues, issues: validateCues(cues, cps), exported: toSrt(cues), history };
}
export function validate(x) { run(x); }
