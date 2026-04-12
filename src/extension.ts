import * as vscode from 'vscode';

import { getErrorMessage } from './app/helpers';
import { ExtensionRuntime } from './extension.runtime';

export async function activate(context: vscode.ExtensionContext) {
  try {
    const runtime = new ExtensionRuntime(context);

    // Initialize the runtime environment
    const initialized = await runtime.initialize();

    if (!initialized) {
      return;
    }

    // Start the extension logic
    runtime.start();
  } catch (error) {
    vscode.window.showErrorMessage(
      vscode.l10n.t(
        'Failed to activate extension: {0}',
        getErrorMessage(error),
      ),
    );
  }
}

export function deactivate() {}
