// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as path from "path";
// import * as fs from "fs";
// import * as readline from "readline";
import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";

export function activate(context: vscode.ExtensionContext): void {
  console.log("CSV-Viewer extension is now active!");
  registerCommands(context);
}

export function deactivate(): void {}
