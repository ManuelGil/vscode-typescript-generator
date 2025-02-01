import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateFastifyControllerCommand class.
 *
 * @class
 * @classdesc The class that represents the generate fastify controller command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateFastifyControllerCommand(config);
 */
export class GenerateFastifyControllerCommand extends BaseCommand {
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
   * @memberof GenerateFastifyControllerCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'fastify-controller');
  }
}
