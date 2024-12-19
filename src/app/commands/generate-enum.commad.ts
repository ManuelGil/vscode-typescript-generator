import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateEnumCommad class.
 *
 * @class
 * @classdesc The class that represents the generate enum command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateEnumCommad(config);
 */
export class GenerateEnumCommad extends BaseCommand {
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
    this.service.generateEnum(folderPath);
  }
}
