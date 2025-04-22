import * as vscode from "vscode";
import { parseCsv, getCsvColumnIndex } from "../utils/parseCsv";

export function getRelativeLine(
  editor: vscode.TextEditor,
  useTitle: boolean,
  titleRow: string,
): number {
  const visibleStartLine = editor.visibleRanges[0].start.line;
  const visibleStartLineRow = editor.document.lineAt(visibleStartLine).text;
  const cursorLine = editor.selection.active.line;
  let titleRowAdjust = 0;
  if (useTitle && visibleStartLineRow == titleRow) {
    titleRowAdjust = 1;
  }

  return cursorLine - visibleStartLine - titleRowAdjust;
}

export async function updatePreview(
  editor: vscode.TextEditor,
  panel: vscode.WebviewPanel,
  titleRow: string,
  useTitle: boolean,
): Promise<void> {
  const visibleRange = editor.visibleRanges[0];
  const startLine = useTitle
    ? Math.max(visibleRange.start.line, 1)
    : visibleRange.start.line;
  const endLine = visibleRange.end.line;
  const relativeLine = getRelativeLine(editor, useTitle, titleRow);

  const visibleLines = [];
  for (let i = startLine; i <= endLine; i++) {
    visibleLines.push(parseCsv(editor.document.lineAt(i).text));
  }

  const cursorLine = editor.selection.active.line;
  const col = getCsvColumnIndex(
    editor.document.lineAt(cursorLine).text,
    editor.selection.active.character,
  );

  console.debug(
    `updatePreview: startLine=${startLine}, endLine=${endLine}, relativeLine=${relativeLine}, col=${col}`,
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
  titleRow: string,
  doUpdate: boolean,
): Promise<void> {
  const cursorLine = editor.selection.active.line;
  const relativeLine = getRelativeLine(editor, useTitle, titleRow);
  const col = getCsvColumnIndex(
    editor.document.lineAt(cursorLine).text,
    editor.selection.active.character,
  );

  console.debug(
    `highlightCurrentPosition: relativeLine=${relativeLine}, col=${col}, doUpdate=${doUpdate}`,
  );

  panel.webview.postMessage({
    type: "highlight",
    row: relativeLine,
    col: col,
    doUpdate: doUpdate,
  });
}
