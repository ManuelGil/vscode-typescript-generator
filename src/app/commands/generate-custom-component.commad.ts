import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateCustomComponentCommand class.
 *
 * @class
 * @classdesc The class that represents the generate custom component command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateCustomComponentCommand(config);
 */
export class GenerateCustomComponentCommand extends BaseCommand {
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
   * @memberof GenerateCustomComponentCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateCustomComponent(folderPath);
  }
}
