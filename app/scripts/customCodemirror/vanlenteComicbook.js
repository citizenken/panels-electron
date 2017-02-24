// jscs:disable
/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */
window.CodeMirror.defineSimpleMode("vanlente-comicbook", {
  // The start state contains the rules that are intially used
  start: [
    
    {regex: /[A-Z]+$/, token: "vlc-title", next: "panel"},
    {regex: /[P]anel [0-9]+(?:\\.|:)/, token: "vlc-panel", next: "action"},
    {regex: /[0-9]+\. [A-Z0-9]+(?: \([A-Z]+\))?: /, token: "vlc-character", next: "dialogue"},
    {regex: /[^\n]*/, token: "vlc-action", next: "start"},
  ],
  panel: [
    {regex: /[P]anel [0-9]+(?:\\.|:)/, token: "vlc-panel", next: "action"}
  ],
  action: [
    {regex: /[^\n]*/, token: "vlc-action", next: "start"}
  ],
  dialogue: [
    {regex: /[^\n]*/, token: "vlc-dialogue", next: "start"}
  ],
  // The multi-line comment state.
  comment: [
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
});
