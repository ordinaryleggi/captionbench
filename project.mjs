import { field, table, column, view, metric, item, csvArtifact, textArtifact, summary } from './lib/product-kit.mjs';
export const product = {
  category:'Media review',projectNoun:'Subtitle project',runLabel:'Check subtitle revision',
  outcome:'Import subtitles, apply explicit timing edits, track issues across revisions and export a reviewed SRT.',
  fields:[field('srt','Subtitle source','filetext',{accept:'.srt,text/plain',help:'Original dialogue is kept; edit operations shift explicit cue IDs.'}),field('cps','Reading limit (characters / second)','number'),
    table('edits','Timing edits',[column('cue','Cue number','number'),column('delta','Shift (milliseconds)','number')]),field('locked','Locked cue numbers','numberlist')],
  describe(result) {
    return summary([metric('Subtitle cues',result.cues.length),metric('Timing / reading issues',result.issues.length),metric('Edit snapshots',result.history.length)],[
      view('Subtitle timeline',[column('number','Cue'),column('start','Start ms'),column('end','End ms'),column('text','Dialogue')],result.cues),
      view('Issues to resolve',[column('cue','Cue'),column('code','Issue'),column('previous','Previous cue')],result.issues),
    ],[...result.issues.map((issue,i)=>item(`issue:${i}`,`Cue ${issue.cue}: ${issue.code}`,'Fix the source or timing edit, then run a new revision.',true)),item('dialogue','Review subtitle text and timing',`${result.cues.length} cues in the exported SRT`)],{type:'subtitles',cues:result.cues.slice(0,80),issues:result.issues});
  },
  artifacts(result) {
    return [textArtifact('subtitles','Subtitle revision','srt','application/x-subrip',result.exported),csvArtifact('issues','Subtitle issues',[column('cue','Cue'),column('code','Issue'),column('previous','Previous cue')],result.issues)];
  },
};
