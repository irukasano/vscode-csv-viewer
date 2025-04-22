import * as vscode from "vscode";
import { getWebviewContent } from "../webview/webviewContent";
import { spreadsheetEvents } from "../event/spreadsheetEvents";

export async function showSpreadsheet(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document.fileName.endsWith(".csv")) {
    vscode.window.showErrorMessage("Please open a CSV file to preview.");
    return;
  }

  const useTitleRow = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Do you want to use the first row as the title?",
  });

  if (!useTitleRow) return;
  const useTitle = useTitleRow === "Yes";

  const panel = vscode.window.createWebviewPanel(
    "spreadsheetView",
    "Spreadsheet",
    vscode.ViewColumn.Beside,
    { enableScripts: true },
  );

  panel.webview.html = getWebviewContent();

  const handler = new spreadsheetEvents(editor, panel, useTitle);
  await handler.initialize();
}
