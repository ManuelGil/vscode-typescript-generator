/**
 * Session-scoped context for folder memory.
 *
 * @remarks
 * Tracks the last generation folder used in the current session and provides
 * explicit getter/setter for the FileGeneratorService to use as defaults
 * when prompting for folder paths.
 *
 * This is stateless from the FileGeneratorService perspective; the runtime
 * owns the actual storage and passes this interface to coordinate context.
 *
 * @category Types
 */
export interface FolderContext {
  /**
   * Retrieves the last workspace-relative folder path used during file generation, if any.
   * Returns undefined if no generation has occurred yet in this session.
   * An empty string represents the workspace root.
   */
  getLastUsedFolder(): string | undefined;

  /**
   * Records a workspace-relative folder path that was just used for successful file generation.
   * Subsequent calls will preselect this folder in prompts.
   *
   * @param folder - Workspace-relative folder path to remember.
   */
  setLastUsedFolder(folder: string): void;
}
