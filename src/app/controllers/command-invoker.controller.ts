import { l10n, Uri, window } from 'vscode';

import { EXTENSION_DISPLAY_NAME } from '../configs';
import type { Command } from '../types';

/**
 * Registers and executes commands behind a single enablement gate.
 *
 * This controller keeps the command wiring thin and centralizes the disabled
 * state behavior for the extension entry point.
 *
 * @class
 * @export
 * @public
 */
export class CommandInvoker {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Private properties

  /**
   * The commands.
   *
   * @type {Map<string, Command>}
   * @private
   * @memberof CommandInvoker
   */
  private commands: Map<string, Command> = new Map();

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Creates a command invoker.
   *
   * @param isEnabled Whether the extension is enabled.
   */
  constructor(private readonly isEnabled: boolean) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

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
