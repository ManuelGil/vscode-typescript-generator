/**
 * @fileoverview Safely writes generated file content to disk within the workspace.
 * Handles directory creation, secure path validation, duplicate detection,
 * progress/cancellation UI, and post-creation cache invalidation.
 */

import { isAbsolute, normalize } from 'path';
import {
  FileSystemError,
  l10n,
  ProgressLocation,
  Uri,
  window,
  workspace,
} from 'vscode';

import { EXTENSION_DISPLAY_NAME, ExtensionConfig } from '../configs';
import { getErrorMessage } from './error-message.helper';
import { getWorkspaceRoot } from './workspace-root.helper';

/**
 * Safely writes a generated file into the active workspace.
 *
 * @remarks
 * The helper validates workspace boundaries, handles collisions, and keeps
 * user feedback consistent across success and failure paths.
 *
 * Contract:
 * - Path traversal outside the workspace root is rejected.
 * - Existing files are never overwritten silently.
 *
 * This helper does NOT:
 * - Render templates
 * - Choose generation targets
 * - Manage command orchestration
 *
 * @param directoryPath - Absolute or workspace-relative directory path.
 * @param filename - Name of the file to create.
 * @param fileContent - Text content to write.
 * @param config - Active extension configuration.
 * @category Helpers
 */
export const saveFile = async (
  directoryPath: string,
  filename: string,
  fileContent: string,
  config: ExtensionConfig,
): Promise<void> => {
  const normalizedDirPath = normalize(directoryPath || '.');
  const providedDirectoryUri = isAbsolute(normalizedDirPath)
    ? Uri.file(normalizedDirPath)
    : undefined;

  const activeWorkspaceRoot = getWorkspaceRoot(config, providedDirectoryUri);

  if (!activeWorkspaceRoot) {
    const noWorkspaceMessage = l10n.t(
      '{0}: No workspace folders are open. Please open a workspace folder to use this extension',
      EXTENSION_DISPLAY_NAME,
    );
    window.showErrorMessage(noWorkspaceMessage);
    return;
  }

  const workspaceRootUri = Uri.file(activeWorkspaceRoot);

  const resolvedDirectoryUri = isAbsolute(normalizedDirPath)
    ? providedDirectoryUri!
    : Uri.joinPath(workspaceRootUri, normalizedDirPath);

  const relativeCheck = workspace.asRelativePath(resolvedDirectoryUri, false);
  if (relativeCheck.startsWith('..')) {
    window.showErrorMessage(l10n.t('Invalid directory path'));
    return;
  }

  const resolvedFileUri = Uri.joinPath(resolvedDirectoryUri, filename);

  let successfullyCreatedFilePath: string | undefined;

  try {
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: l10n.t('Creating file: {0}', filename),
        cancellable: true,
      },
      async (_progressIndicator, cancellationToken) => {
        try {
          if (cancellationToken.isCancellationRequested) {
            return;
          }

          if (resolvedDirectoryUri.toString() !== workspaceRootUri.toString()) {
            await workspace.fs.createDirectory(resolvedDirectoryUri);
          }

          let doesFileExist = false;
          try {
            await workspace.fs.stat(resolvedFileUri);
            doesFileExist = true;
          } catch (statError: unknown) {
            if (!(statError instanceof FileSystemError)) {
              throw statError;
            }
          }

          if (cancellationToken.isCancellationRequested) {
            return;
          }

          if (doesFileExist) {
            const openFileLabel = l10n.t('Open File');
            const userChoice = await window.showWarningMessage(
              l10n.t('File already exists: {0}', filename),
              openFileLabel,
            );

            if (userChoice === openFileLabel) {
              const existingDocument =
                await workspace.openTextDocument(resolvedFileUri);
              window.showTextDocument(existingDocument);
            }
            return;
          }

          const encodedFileContent = new TextEncoder().encode(fileContent);
          await workspace.fs.writeFile(resolvedFileUri, encodedFileContent);

          if (cancellationToken.isCancellationRequested) {
            return;
          }

          const newTextDocument =
            await workspace.openTextDocument(resolvedFileUri);
          window.showTextDocument(newTextDocument);

          successfullyCreatedFilePath = resolvedFileUri.fsPath;
        } catch (innerError: unknown) {
          window.showErrorMessage(
            l10n.t(
              'Error creating file: {0}. Please check the path and try again',
              getErrorMessage(innerError),
            ),
          );
        }
      },
    );

    if (successfullyCreatedFilePath) {
      window.showInformationMessage(
        l10n.t('File created successfully: {0}', successfullyCreatedFilePath),
      );
    }
  } catch (outerError: unknown) {
    window.showErrorMessage(
      l10n.t(
        'Error creating file: {0}. Please check the path and try again',
        getErrorMessage(outerError),
      ),
    );
  }
};
