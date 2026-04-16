import { l10n, Uri, window } from 'vscode';

import { EXTENSION_DISPLAY_NAME } from '../configs';
import type { Command } from '../types';

/**
 * Registers and executes commands behind a single enablement gate.
 *
 * @remarks
 * This controller keeps runtime orchestration thin by centralizing enablement
 * checks and command dispatch.
 *
 * This controller does NOT:
 * - Generate files directly
 * - Detect workspace context
 * - Decide command ordering
 * @category Controllers
 */
export class CommandInvoker {
  private commands: Map<string, Command> = new Map();

  /**
   * Creates a command invoker.
   *
   * @param isEnabled Whether the extension is enabled.
   */
  constructor(private readonly isEnabled: boolean) {}

  /**
   * Registers a command handler by name.
   *
   * @param commandName Command identifier.
   * @param command Command implementation.
   */
  register(commandName: string, command: Command) {
    this.commands.set(commandName, command);
  }

  /**
   * Executes a registered command when the extension is enabled.
   *
   * @param commandName Command identifier.
   * @param folderPath Folder context supplied by VS Code.
   */
  async execute(commandName: string, folderPath?: Uri): Promise<void> {
    if (!this.isEnabled) {
      const message = l10n.t(
        '{0} is disabled in settings. Enable it to use its features',
        EXTENSION_DISPLAY_NAME,
      );
      window.showErrorMessage(message);
      return;
    }

    const command = this.commands.get(commandName);
    if (command) {
      await command.execute(folderPath);
    }
  }
}
