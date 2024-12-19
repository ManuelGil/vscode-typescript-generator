import { l10n, Uri, window } from 'vscode';

import { EXTENSION_DISPLAY_NAME } from '../configs';
import type { Command } from '../types';

/**
 * The CommandInvoker class.
 *
 * @class
 * @classdesc The class that represents the example controller.
 * @export
 * @public
 * @example
 * const controller = new CommandInvoker(config);
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
   * The CommandInvoker constructor.
   *
   * @param {boolean} isEnable - The enable the extension
   * @constructor
   * @memberof CommandInvoker
   */
  constructor(private readonly isEnable: boolean) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * The register method.
   *
   * @function register
   * @param {string} commandName - The command name
   * @param {Command} command - The command
   * @public
   * @memberof CommandInvoker
   */
  register(commandName: string, command: Command) {
    this.commands.set(commandName, command);
  }

  /**
   * The execute method.
   *
   * @function execute
   * @returns {Promise<void>}
   * @public
   * @memberof CommandInvoker
   *
   * @param {string} commandName - The command name
   * @param {Uri} folderPath - The folder path
   */
  async execute(commandName: string, folderPath?: Uri): Promise<void> {
    if (!this.isEnable) {
      const message = l10n.t(
        '{0} is disabled in settings. Enable it to use its features',
        [EXTENSION_DISPLAY_NAME],
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
