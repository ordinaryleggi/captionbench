import { fileURLToPath } from 'node:url';
import { start } from './lib/server.mjs';
import { run, validate } from './core.mjs';
export * from './core.mjs';
export const spec = { ...{
  "slug": "captionbench",
  "repo": "captionbench",
  "owner": "ordinaryleggi",
  "title": "Captionbench",
  "purpose": "Check subtitle timing without rewriting the dialogue",
  "workflow": "A Kite media-workflow agent can pay for a reproducible SRT timing report and an explicit edit history.",
  "colors": [
    "#181b22",
    "#f1f3f6",
    "#8a6500"
  ],
  "required": [
    "srt"
  ],
  "sample": {
    "srt": "1\n00:00:01,000 --> 00:00:03,000\nWelcome to the workshop.\n\n2\n00:00:02,800 --> 00:00:04,000\nLet us begin.",
    "cps": 20,
    "edits": [],
    "locked": []
  },
  "changed": "Strict timestamps, cue identity validation, Unicode reading load, locked edits, full neighbor revalidation and previous SRT snapshots.",
  "limits": "No transcription, translation, media playback or automatic timing repairs. Returning a report does not certify subtitle quality.",
  "version": "0.2.0",
  "inputSchema": {
    "type": "object",
    "required": [
      "srt"
    ],
    "properties": {
      "srt": {
        "type": "string"
      },
      "cps": {
        "type": "integer"
      },
      "edits": {
        "type": "array"
      },
      "locked": {
        "type": "array"
      }
    }
  }
}, run, validate };
if (process.argv[1] === fileURLToPath(import.meta.url)) start(spec);

