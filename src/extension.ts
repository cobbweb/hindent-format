'use strict';

import * as vscode from 'vscode';
import * as child_process from 'child_process';

class HindentFormatEditsProvider implements
    vscode.DocumentFormattingEditProvider,
    vscode.DocumentRangeFormattingEditProvider {
  command: string;
  arguments: Array<string>;

  constructor() {
    const config = vscode.workspace.getConfiguration('hindentFormat');
    const commandline = config.get('command', '/usr/local/bin/hindent');
    const args = commandline.split(' ');

    this.command = args[0];
    this.arguments = args.slice(1);
  }

  formatHindent(text: string) {
    let result =
        child_process.spawnSync(this.command, this.arguments, {'input': text});
    if (!result.status) {
      return result.stdout.toString();
    } else {
      vscode.window.showErrorMessage(result.stderr.toString());
      return text;
    }
  }

  provideDocumentFormattingEdits(
      document: vscode.TextDocument, options: vscode.FormattingOptions,
      token: vscode.CancellationToken):
      vscode.TextEdit[]|Thenable<vscode.TextEdit[]> {
    let formatted = this.formatHindent(document.getText());
    if (formatted != '')
      return [vscode.TextEdit.replace(
          new vscode.Range(0, 0, 10000, 10000), formatted)];
    else
      return [];
  }

  provideDocumentRangeFormattingEdits(
      document: vscode.TextDocument, range: vscode.Range,
      options: vscode.FormattingOptions, token: vscode.CancellationToken):
      vscode.TextEdit[]|Thenable<vscode.TextEdit[]> {
    let formatted = this.formatHindent(document.getText(range));
    if (formatted != '')
      return [vscode.TextEdit.replace(range, formatted)];
    else
      return [];
  }
}

export function activate(context: vscode.ExtensionContext) {
  let hindentFormatProvider = new HindentFormatEditsProvider();
  vscode.languages.registerDocumentFormattingEditProvider(
      'haskell', hindentFormatProvider);
  vscode.languages.registerDocumentRangeFormattingEditProvider(
      'haskell', hindentFormatProvider);
}

export function deactivate() {}