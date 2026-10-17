import test from 'node:test'; import assert from 'node:assert/strict'; import { parseSrt, validateCues, shiftCue, toSrt, run } from './core.mjs';
const source = '1\n00:00:01,000 --> 00:00:03,000\nStart\n\n2\n00:00:02,800 --> 00:00:04,000\nNext';
test('overlap detected and roundtrip preserves text and timestamps', () => { const c = parseSrt(source); assert.ok(validateCues(c).some(i => i.code === 'overlap')); assert.deepEqual(parseSrt(toSrt(c)), c); });
test('edits recheck next neighbor, locked cue cannot change', () => { const c = parseSrt(source); assert.throws(() => shiftCue(c, 0, 100, new Set([1])), /Locked/); assert.ok(shiftCue(c, 0, 1000).issues.some(i => i.code === 'overlap')); });
test('invalid timestamp and duplicate indices refused', () => { assert.throws(() => parseSrt(source.replace('00:00:01,000', '00:90:01,000'))); assert.throws(() => parseSrt(source.replace('\n\n2', '\n\n1'))); });
test('history contains exact prior SRT rather than rewritten dialogue', () => { const r = run({ srt: source, edits: [{ cue: 2, delta: 300 }] }); assert.equal(r.history[0], toSrt(parseSrt(source))); assert.equal(r.cues[1].text, 'Next'); });
