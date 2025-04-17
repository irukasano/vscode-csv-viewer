import * as vscode from "vscode";
import { updatePreview, highlightCurrentPosition } from "./spreadsheetUtils";

export class SpreadsheetEventHandler {
  private titleRow: string;
  private previousCursorLine: number;

  constructor(
    private editor: vscode.TextEditor,
    private panel: vscode.WebviewPanel,
    private useTitle: boolean
  ) {
    this.titleRow = useTitle ? editor.document.lineAt(0).text : "";
    this.previousCursorLine = editor.selection.active.line;
  }

  public async initialize() {
    await updatePreview(this.editor, this.panel, this.titleRow, this.useTitle);
    await highlightCurrentPosition(this.editor, this.panel, this.useTitle, false);
    this.register();
  }

  public register() {
    this.watchWebviewFocus();
    this.watchDocumentChanges();
    this.watchVisibleRangeChanges();
    this.watchCursorSelection();
  }

  private watchWebviewFocus() {
    this.panel.onDidChangeViewState((e) => {
      if (e.webviewPanel.active) {
        vscode.commands.executeCommand("workbench.action.focusPreviousGroup");
      }
    });
  }

  private watchDocumentChanges() {
    vscode.workspace.onDidChangeTextDocument(async (event) => {
      if (event.document === this.editor.document) {
        this.titleRow = this.useTitle ? this.editor.document.lineAt(0).text : "";
        await updatePreview(this.editor, this.panel, this.titleRow, this.useTitle);
        await highlightCurrentPosition(this.editor, this.panel, this.useTitle, false);
      }
    });
  }

  private watchVisibleRangeChanges() {
    vscode.window.onDidChangeTextEditorVisibleRanges(async (event) => {
      if (event.textEditor === this.editor) {
        await updatePreview(this.editor, this.panel, this.titleRow, this.useTitle);
        await highlightCurrentPosition(this.editor, this.panel, this.useTitle, false);
      }
    });
  }

  private watchCursorSelection() {
    vscode.window.onDidChangeTextEditorSelection(async (event) => {
      if (event.textEditor === this.editor) {
        const current = this.editor.selection.active.line;
        if (current !== this.previousCursorLine) {
          await highlightCurrentPosition(this.editor, this.panel, this.useTitle, true);
          this.previousCursorLine = current;
        }
      }
    });
  }
}
