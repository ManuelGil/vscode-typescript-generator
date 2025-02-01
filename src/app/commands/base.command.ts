import { Uri } from 'vscode';
import { ExtensionConfig } from '../configs';
import { FileGeneratorService } from '../services';
import type { Command } from '../types';

/**
 * The BaseCommand abstract class.
 *
 * @abstract
 * @class
 * @classdesc The class that represents the base command.
 * @implements {Command}
 * @export
 * @public
 * @example
 * class Command extends BaseCommand {
 *   async execute(folderPath?: Uri): Promise<void> {
 *     console.log('Hello, World!');
 *   }
 * }
 */
export abstract class BaseCommand implements Command {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Protected properties

  /**
   * The protected service.
   *
   * @type {FileGeneratorService}
   * @protected
   * @memberof BaseCommand
   */
  protected service: FileGeneratorService;

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * The BaseCommand constructor.
   *
   * @constructor
   * @memberof BaseCommand
   *
   * @param {ExtensionConfig} config - The extension configuration
   */
  constructor(config: ExtensionConfig, extensionUri: Uri) {
    this.service = new FileGeneratorService(config, extensionUri);
  }

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * The execute method.
   *
   * @async
   * @function execute
   * @memberof BaseCommand
   *
   * @param {Uri} folderPath - The folder path
   *
   * @returns {Promise<void>}
   */
  abstract execute(folderPath?: Uri): Promise<void>;
}
