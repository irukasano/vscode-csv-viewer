import * as vscode from "vscode";
import { parseCsv, getCsvColumnIndex } from "../utils/parseCsv";

export function getRelativeLine(editor: vscode.TextEditor, useTitle: boolean): number {
  const visibleStartLine = editor.visibleRanges[0].start.line;
  const cursorLine = editor.selection.active.line;
  return cursorLine - visibleStartLine;
}

export async function updatePreview(
    editor: vscode.TextEditor,
    panel: vscode.WebviewPanel,
    titleRow: string,
    useTitle: boolean
  ): Promise<void> {
    const visibleRange = editor.visibleRanges[0];
    const startLine = useTitle ? Math.max(visibleRange.start.line, 1) : visibleRange.start.line;
    const endLine = visibleRange.end.line;
    const relativeLine = getRelativeLine(editor, useTitle);

    const visibleLines = [];
    for (let i = startLine; i <= endLine; i++) {
      visibleLines.push(parseCsv(editor.document.lineAt(i).text));
    }

    const cursorLine = editor.selection.active.line;
    const col = getCsvColumnIndex(
      editor.document.lineAt(cursorLine).text,
      editor.selection.active.character
    );

    panel.webview.postMessage({
      type: "update",
      title: titleRow,
      rows: visibleLines,
      currentRow: relativeLine,
      highlight: {
        row: relativeLine,
        col: col,
        doUpdate: false,
      },
    });
}

export async function highlightCurrentPosition(
  editor: vscode.TextEditor,
  panel: vscode.WebviewPanel,
  useTitle: boolean,
  doUpdate: boolean
): Promise<void> {
  const cursorLine = editor.selection.active.line;
  const relativeLine = getRelativeLine(editor, useTitle);
  const col = getCsvColumnIndex(
    editor.document.lineAt(cursorLine).text,
    editor.selection.active.character
  );

  panel.webview.postMessage({
    type: "highlight",
    row: relativeLine,
    col: col,
    doUpdate: doUpdate,
  });
}
