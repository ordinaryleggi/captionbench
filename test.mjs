import assert from 'node:assert/strict';
import { parseSrt, validateCues, shiftCue, toSrt } from './app.mjs';
const source = '1\n00:00:01,000 --> 00:00:03,000\n开始\n\n2\n00:00:02,800 --> 00:00:04,000\n下一条';
const cues = parseSrt(source);
assert.ok(validateCues(cues).some(issue => issue.code === 'overlap'));
assert.equal(parseSrt(toSrt(cues))[1].text, '下一条');
assert.throws(() => shiftCue(cues, 0, 100, new Set([1])), /锁定/);
console.log('captionbench: ok');
