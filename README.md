# Captionbench

Small SRT timing workbench. It parses cues, reports invalid durations, overlaps, and reading-load issues, and keeps edits explicit and reversible.

This is a synthetic public evaluation project for testing developer indexing. It does not transcribe, translate, identify speakers, edit video, claim Electric Capital acceptance, or contain licensed media. The account owner must review changes before any external submission.

## Run

```sh
npm test
npm start
```

Open `http://localhost:3000`. Exported SRT keeps cue text unchanged. Locked cues cannot be shifted.
