import * as vscode from "vscode";
import { updatePreview, highlightCurrentPosition } from "./spreadsheetUtils";

export class spreadsheetEvents {
  private titleRow: string;
  private previousCursorLine: number;
  private previousCursorColumn: number;

  constructor(
    private editor: vscode.TextEditor,
    private panel: vscode.WebviewPanel,
    private useTitle: boolean,
  ) {
    this.titleRow = useTitle ? editor.document.lineAt(0).text : "";
    this.editor = editor;
    this.panel = panel;
    this.previousCursorLine = editor.selection.active.line;
    this.previousCursorColumn = editor.selection.active.character;
  }

  public async initialize(): Promise<void> {
    await updatePreview(this.editor, this.panel, this.titleRow, this.useTitle);
    await highlightCurrentPosition(
      this.editor,
      this.panel,
      this.useTitle,
      this.titleRow,
      false,
    );
    this.register();
  }

  public register(): void {
    this.watchWebviewFocus();
    this.watchDocumentChanges();
    this.watchVisibleRangeChanges();
    this.watchCursorSelection();
  }

  private watchWebviewFocus(): void {
    this.panel.onDidChangeViewState((e) => {
      if (e.webviewPanel.active) {
        vscode.commands.executeCommand("workbench.action.focusPreviousGroup");
      }
    });
  }

  private watchDocumentChanges(): void {
    vscode.workspace.onDidChangeTextDocument(async (event) => {
      if (event.document === this.editor.document) {
        this.titleRow = this.useTitle
          ? this.editor.document.lineAt(0).text
          : "";
        await updatePreview(
          this.editor,
          this.panel,
          this.titleRow,
          this.useTitle,
        );
        // await highlightCurrentPosition(
        //   this.editor,
        //   this.panel,
        //   this.useTitle,
        //   false,
        // );
      }
    });
  }

  private watchVisibleRangeChanges() {
    vscode.window.onDidChangeTextEditorVisibleRanges(async (event) => {
      if (event.textEditor === this.editor) {
        await updatePreview(
          this.editor,
          this.panel,
          this.titleRow,
          this.useTitle,
        );
        // await highlightCurrentPosition(
        //   this.editor,
        //   this.panel,
        //   this.useTitle,
        //   false,
        // );
      }
    });
  }

  private watchCursorSelection() {
    vscode.window.onDidChangeTextEditorSelection(async (event) => {
      if (event.textEditor === this.editor) {
        const currentLine = this.editor.selection.active.line;
        const currentColumn = this.editor.selection.active.character;
        if (
          currentLine !== this.previousCursorLine ||
          currentColumn !== this.previousCursorColumn
        ) {
          await highlightCurrentPosition(
            this.editor,
            this.panel,
            this.useTitle,
            this.titleRow,
            true,
          );
          this.previousCursorLine = currentLine;
          this.previousCursorColumn = currentColumn;
        }
      }
    });
  }
}
