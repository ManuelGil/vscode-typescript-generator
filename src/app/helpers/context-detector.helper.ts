import { RelativePattern, Uri, WorkspaceFolder, workspace } from 'vscode';
import { EMPTY_PROJECT_CONTEXT, ProjectContext } from '../types';
import { readFileContent } from './read-file-content.helper';

type PackageJsonData = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

/**
 * Detects project context using lightweight multi-signal checks.
 *
 * @remarks
 * The implementation is intentionally bounded to avoid expensive workspace scans:
 * - `package.json` is read once when available
 * - `*.ts` / `*.tsx` lookup is capped to 3 results
 *
 * This helper does NOT:
 * - Reorder commands
 * - Execute generation
 * - Persist extension state
 *
 * @example
 * const context = await detectProjectContext({ resource: folderUri });
 * @category Helpers
 * @internal
 */
export const detectProjectContext = async (options: {
  resource?: Uri;
  workspaceSelection?: string;
}): Promise<ProjectContext> => {
  const workspaceFolder = resolveWorkspaceFolder(
    options.resource,
    options.workspaceSelection,
  );

  if (!workspaceFolder) {
    return EMPTY_PROJECT_CONTEXT;
  }

  const packageSignals = await detectPackageJsonSignals(workspaceFolder);
  const tsFilesSignals = await detectTsFiles(workspaceFolder);

  const hasReactDependency =
    packageSignals.dependencyNames.has('react') ||
    packageSignals.dependencyNames.has('react-dom') ||
    packageSignals.dependencyNames.has('next');

  return {
    express: packageSignals.dependencyNames.has('express'),
    fastify: packageSignals.dependencyNames.has('fastify'),
    react:
      hasReactDependency ||
      (tsFilesSignals.hasTsFiles && tsFilesSignals.containsTsxFiles),
  };
};

/**
 * Resolves the workspace folder to inspect for context detection.
 */
const resolveWorkspaceFolder = (
  resource?: Uri,
  workspaceSelection?: string,
): WorkspaceFolder | undefined => {
  if (resource) {
    return workspace.getWorkspaceFolder(resource);
  }

  if (workspaceSelection) {
    return workspace.workspaceFolders?.find(
      (folder) => folder.uri.fsPath === workspaceSelection,
    );
  }

  return workspace.workspaceFolders?.[0];
};

/**
 * Reads `package.json` once and extracts a flattened dependency set.
 */
const detectPackageJsonSignals = async (
  workspaceFolder: WorkspaceFolder,
): Promise<{ dependencyNames: Set<string> }> => {
  try {
    const packageJsonUri = Uri.joinPath(workspaceFolder.uri, 'package.json');
    const packageJsonText = await readFileContent(packageJsonUri);
    const packageJson = JSON.parse(packageJsonText) as PackageJsonData;

    return {
      dependencyNames: new Set<string>([
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
        ...Object.keys(packageJson.optionalDependencies ?? {}),
      ]),
    };
  } catch {
    return {
      dependencyNames: new Set<string>(),
    };
  }
};

/**
 * Detects lightweight TypeScript file signals with bounded file search.
 */
const detectTsFiles = async (
  workspaceFolder: WorkspaceFolder,
): Promise<{ hasTsFiles: boolean; containsTsxFiles: boolean }> => {
  try {
    const results = await workspace.findFiles(
      new RelativePattern(workspaceFolder, '**/*.{ts,tsx}'),
      '**/node_modules/**',
      3,
    );

    return {
      hasTsFiles: results.length > 0,
      containsTsxFiles: results.some((fileUri) =>
        fileUri.path.endsWith('.tsx'),
      ),
    };
  } catch {
    return {
      hasTsFiles: false,
      containsTsxFiles: false,
    };
  }
};
