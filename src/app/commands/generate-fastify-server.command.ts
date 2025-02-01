import { Uri } from 'vscode';
import { BaseCommand } from './base.command';

/**
 * The GenerateFastifyServerCommand class.
 *
 * @class
 * @classdesc The class that represents the generate fastify server command.
 * @extends {BaseCommand}
 * @export
 * @public
 * @example
 * const command = new GenerateFastifyServerCommand(config);
 */
export class GenerateFastifyServerCommand extends BaseCommand {
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
   * @memberof GenerateFastifyServerCommand
   *
   * @param {Uri} folderPath - The folder path
   */
  async execute(folderPath?: Uri): Promise<void> {
    this.service.generateComponent(folderPath, 'fastify-server');
  }
}
