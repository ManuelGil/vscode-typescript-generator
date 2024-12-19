import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateInterfaceCommad class.
 *
 * @class
 * @classdesc The class that represents the generate interface command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateInterfaceCommad(config);
 */
export class GenerateInterfaceCommad extends BaseCommand {
  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * The execute method.
   *
   * @async
   * @method execute
   * @public
   * @memberof GenerateClassCommad
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateInterface(folderPath);
  }
}
