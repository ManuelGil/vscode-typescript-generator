import * as vscode from 'vscode';

import { getErrorMessage } from './app/helpers';
import { ExtensionRuntime } from './extension.runtime';

/**
 * Activates the extension runtime and starts command orchestration.
 *
 * @remarks
 * Activation only wires runtime boundaries; command and generation logic stays
 * in runtime, controllers, services, and helpers.
 *
 * This entrypoint does NOT contain generation logic or context detection rules.
 *
 * @example
 * await activate(context);
 * @category Runtime
 * @internal
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    const runtime = new ExtensionRuntime(context);
    const initialized = await runtime.initialize();

    if (!initialized) {
      return;
    }

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

/**
 * Handles extension deactivation lifecycle hook.
 * @category Runtime
 * @internal
 */
export function deactivate() {}
