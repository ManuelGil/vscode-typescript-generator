import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateInterfaceCommand class.
 *
 * @class
 * @classdesc The class that represents the generate interface command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateInterfaceCommand(config);
 */
export class GenerateInterfaceCommand extends BaseCommand {
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
   * @memberof GenerateClassCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    await this.service.generateComponent(folderPath, 'interface');
  }
}
