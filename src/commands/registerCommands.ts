import * as vscode from "vscode";
import { showSpreadsheet } from "./showSpreadsheet";

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("csv-viewer.showSpreadSheet", () =>
      showSpreadsheet(),
    ),
  );
}
