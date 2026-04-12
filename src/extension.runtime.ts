import {
  commands,
  ExtensionContext,
  env,
  l10n,
  MessageItem,
  QuickPickItem,
  QuickPickItemKind,
  Uri,
  WorkspaceFolder,
  window,
  workspace,
} from 'vscode';
import { VSCodeMarketplaceClient } from 'vscode-marketplace-client';

import {
  GenerateClassCommand,
  GenerateCustomComponentCommand,
  GenerateEnumCommand,
  GenerateExpressControllerCommand,
  GenerateExpressMiddlewareCommand,
  GenerateExpressRouteCommand,
  GenerateExpressServerCommand,
  GenerateFastifyControllerCommand,
  GenerateFastifyMiddlewareCommand,
  GenerateFastifyRouteCommand,
  GenerateFastifyServerCommand,
  GenerateFunctionCommand,
  GenerateInterfaceCommand,
  GenerateNodeModuleCommand,
  GenerateNodeServerCommand,
  GenerateReactComponentCommand,
  GenerateTypeCommand,
  GenerateVariableCommand,
} from './app/commands';
import {
  CommandIds,
  ContextKeys,
  EXTENSION_DISPLAY_NAME,
  EXTENSION_ID,
  EXTENSION_NAME,
  ExtensionConfig,
  REPOSITORY_URL,
  USER_PUBLISHER,
} from './app/configs';
import { CommandInvoker } from './app/controllers';
import {
  detectProjectContext,
  getErrorMessage,
  resolveFolderResource,
} from './app/helpers';
import { ProjectContext } from './app/types';

type GenerateOption = QuickPickItem & {
  commandId: CommandIds;
  score: number;
  signals: string[];
  confidence: 'low' | 'medium' | 'high';
  isSuggested?: boolean;
};

type GenerateQuickPickItem =
  | GenerateOption
  | {
      label: string;
      kind: QuickPickItemKind.Separator;
    };

type ProjectContextKey =
  | ContextKeys.IsTypeScript
  | ContextKeys.IsNode
  | ContextKeys.HasExpress
  | ContextKeys.HasFastify
  | ContextKeys.IsReact;

type ProjectContexts = Record<ProjectContextKey, boolean>;

/**
 * Manages the lifecycle and core state of the extension.
 *
 * This class is responsible for initializing the extension environment,
 * tracking the active workspace folder, managing configuration changes,
 * performing version checks, and registering commands.
 */
export class ExtensionRuntime {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Public properties

  /**
   * Tracks whether the user has already been warned about the extension being disabled,
   * preventing redundant popup messages.
   *
   * @type {boolean}
   * @private
   * @memberof ExtensionRuntime
   * @example
   * if (!extensionRuntime.isExtensionEnabled()) {
   *   // Warning will only be shown the first time this condition is met
   * }
   */
  private hasDisabledWarningBeenShown = false;

  /**
   * The current configuration instance, loaded based on the selected workspace folder.
   *
   * @type {ExtensionConfig}
   * @private
   * @memberof ExtensionRuntime
   * @example
   * const config = extensionRuntime.extensionConfig;
   * console.log(config.enable);
   */
  private config!: ExtensionConfig;

  /**
   * In-memory snapshot of detected project context keys.
   */
  private readonly detectedContexts: ProjectContexts = {
    [ContextKeys.IsTypeScript]: false,
    [ContextKeys.IsNode]: false,
    [ContextKeys.HasExpress]: false,
    [ContextKeys.HasFastify]: false,
    [ContextKeys.IsReact]: false,
  };

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructs a new instance of the extension runtime.
   *
   * @param context - The context provided by VS Code upon activation.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * export function activate(context: ExtensionContext) {
   *   const extensionRuntime = new ExtensionRuntime(context);
   *   extensionRuntime.initialize().then((initialized) => {
   *     if (initialized) {
   *       extensionRuntime.start();
   *     }
   *   });
   */
  constructor(private readonly context: ExtensionContext) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * Initializes the extension runtime.
   * Selects the active workspace, loads configuration, and handles version notifications.
   * This must complete successfully before start() is invoked.
   *
   * @returns A promise that resolves to true if initialization succeeded, false otherwise.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * const extensionRuntime = new ExtensionRuntime(context);
   * const initialized = await extensionRuntime.initialize();
   * if (initialized) {
   *   extensionRuntime.start();
   * }
   */
  async initialize(): Promise<boolean> {
    const workspaceFolder = await this.selectWorkspaceFolder();

    if (!workspaceFolder) {
      return false;
    }

    this.initializeConfiguration(workspaceFolder);
    await this.setContextKeys(workspaceFolder.uri);

    if (!this.isExtensionEnabled()) {
      return false;
    }

    this.startVersionChecks();

    return true;
  }

  /**
   * Starts the extension by registering all commands and providers.
   * This should only be called after successful initialization.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * if (initialized) {
   *   extensionRuntime.start();
   * }
   */
  start(): void {
    this.registerWorkspaceCommands();
    this.registerGeneratorCommands();
  }

  /**
   * Starts version-related checks without blocking extension activation.
   * Local notifications are fast and run immediately, while the marketplace
   * check runs in the background because it requires a network request.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * extensionRuntime.startVersionChecks();
   */
  private startVersionChecks(): void {
    void this.handleLocalVersionNotifications();
    void this.checkMarketplaceVersion();
  }

  /**
   * Returns the version declared in the extension's package.json.
   * If the version cannot be resolved, a fallback value of '0.0.0' is returned.
   *
   * @returns The current version string.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * const currentVersion = extensionRuntime.getCurrentVersion();
   * console.log(`Current extension version: ${currentVersion}`);
   */
  private getCurrentVersion(): string {
    return this.context.extension.packageJSON?.version ?? '0.0.0';
  }

  /**
   * Handles version notifications that depend only on local information.
   * This includes first activation messages and update notifications.
   * This method runs synchronously during activation since it does not require any network requests.
   *
   * @returns A promise that resolves when all notifications have been handled.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * await extensionRuntime.handleLocalVersionNotifications();
   */
  private async handleLocalVersionNotifications(): Promise<void> {
    const previousVersion = this.context.globalState.get<string>(
      ContextKeys.Version,
    );

    const currentVersion = this.getCurrentVersion();

    // Handle first activation of the extension
    if (!previousVersion) {
      const welcomeMessage = l10n.t(
        'Welcome to {0} version {1}! The extension is now active',
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      window.showInformationMessage(welcomeMessage);

      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );

      return;
    }

    // Handle extension update
    if (previousVersion !== currentVersion) {
      const actionReleaseNotes: MessageItem = {
        title: l10n.t('Release Notes'),
      };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionReleaseNotes, actionDismiss];

      const updateMessage = l10n.t(
        "The {0} extension has been updated. Check out what's new in version {1}",
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      // Open the changelog in the marketplace if requested by the user
      if (userSelection?.title === actionReleaseNotes.title) {
        const changelogUrl = `${REPOSITORY_URL}/blob/main/CHANGELOG.md`;
        env.openExternal(Uri.parse(changelogUrl));
      }

      // Persist the new version locally
      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );
    }
  }

  /**
   * Checks the VS Code Marketplace for a newer extension version.
   * This operation requires a network request and therefore runs in the background.
   * If a newer version is found, the user is notified with an option to update immediately.
   *
   * @returns A promise that resolves when the check is complete and any notifications have been handled.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * await extensionRuntime.checkMarketplaceVersion();
   */
  private async checkMarketplaceVersion(): Promise<void> {
    const currentVersion = this.getCurrentVersion();

    try {
      const latestVersion = await VSCodeMarketplaceClient.getLatestVersion(
        USER_PUBLISHER,
        EXTENSION_NAME,
      );

      // No action required if the extension is already up to date
      if (latestVersion === currentVersion) {
        return;
      }

      const actionUpdateNow: MessageItem = { title: l10n.t('Update Now') };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionUpdateNow, actionDismiss];

      const updateMessage = l10n.t(
        'A new version of {0} is available. Update to version {1} now',
        EXTENSION_DISPLAY_NAME,
        latestVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      // Trigger the VS Code command to install the new version
      if (userSelection?.title === actionUpdateNow.title) {
        await commands.executeCommand(
          'workbench.extensions.action.install.anotherVersion',
          `${USER_PUBLISHER}.${EXTENSION_NAME}`,
        );
      }
    } catch (error) {
      // Marketplace queries may fail due to network issues, so we log it silently
      console.error('Error retrieving extension version:', error);
    }
  }

  /**
   * Selects the workspace folder to use for the extension.
   * VS Code does not guarantee a workspace folder exists during activation,
   * so this method explicitly handles missing workspace scenarios.
   *
   * @returns A promise that resolves to the selected WorkspaceFolder, or undefined if none.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * const selectedFolder = await extensionRuntime.selectWorkspaceFolder();
   * if (selectedFolder) {
   *   console.log(`Selected workspace folder: ${selectedFolder.name}`);
   * } else {
   *   console.log('No workspace folder selected');
   * }
   */
  private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
    const availableWorkspaceFolders = workspace.workspaceFolders;

    // Check if there are any workspace folders open
    if (!availableWorkspaceFolders || availableWorkspaceFolders.length === 0) {
      const errorMessage = l10n.t(
        '{0}: No workspace folders are open. Please open a workspace folder to use this extension',
        EXTENSION_DISPLAY_NAME,
      );
      this.showError(errorMessage);

      return undefined;
    }

    // Try to load the previously selected workspace folder from global state
    const previousFolderUriString = this.context.globalState.get<string>(
      ContextKeys.SelectedWorkspaceFolder,
    );
    let previousFolder: WorkspaceFolder | undefined;

    // Find the workspace folder by matching URI
    if (previousFolderUriString) {
      previousFolder = availableWorkspaceFolders.find(
        (folder) => folder.uri.toString() === previousFolderUriString,
      );
    }

    // If only one workspace folder is available, use it directly
    if (availableWorkspaceFolders.length === 1) {
      return availableWorkspaceFolders[0];
    }

    // Use the previously selected workspace folder if available
    if (previousFolder) {
      // Notify the user which workspace is being used
      window.showInformationMessage(
        l10n.t('Using workspace folder: {0}', previousFolder.name),
      );

      return previousFolder;
    }

    // Multiple workspace folders are available and no previous selection exists
    const pickerPlaceholder = l10n.t(
      '{0}: Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
      EXTENSION_DISPLAY_NAME,
    );
    const selectedFolder = await window.showWorkspaceFolderPick({
      placeHolder: pickerPlaceholder,
    });

    // Remember the user's selection for future use
    if (selectedFolder) {
      this.context.globalState.update(
        ContextKeys.SelectedWorkspaceFolder,
        selectedFolder.uri.toString(),
      );
    }

    return selectedFolder;
  }

  /**
   * Initializes configuration and sets up a listener for configuration changes.
   * The listener updates context keys and notifies users when the enable state changes.
   *
   * @param selectedWorkspaceFolder - The workspace folder used to load the configuration.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * const selectedFolder = await extensionRuntime.selectWorkspaceFolder();
   * if (selectedFolder) {
   *   extensionRuntime.initializeConfiguration(selectedFolder);
   * }
   */
  private initializeConfiguration(
    selectedWorkspaceFolder: WorkspaceFolder,
  ): void {
    // Get the configuration for the extension within the selected workspace
    this.config = new ExtensionConfig(
      workspace.getConfiguration(EXTENSION_ID, selectedWorkspaceFolder.uri),
    );

    this.config.workspaceSelection = selectedWorkspaceFolder.uri.fsPath;

    // Watch for changes in the workspace configuration
    workspace.onDidChangeConfiguration((configurationChangeEvent) => {
      const updatedWorkspaceConfig = workspace.getConfiguration(
        EXTENSION_ID,
        selectedWorkspaceFolder.uri,
      );

      if (
        configurationChangeEvent.affectsConfiguration(
          `${EXTENSION_ID}.enable`,
          selectedWorkspaceFolder.uri,
        )
      ) {
        const isExtensionEnabled =
          updatedWorkspaceConfig.get<boolean>('enable');

        this.config.update(updatedWorkspaceConfig);

        if (isExtensionEnabled) {
          const enabledMessage = l10n.t(
            'The {0} extension is now enabled and ready to use',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(enabledMessage);
        } else {
          const disabledMessage = l10n.t(
            'The {0} extension is now disabled',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(disabledMessage);
        }
      }

      if (
        configurationChangeEvent.affectsConfiguration(
          EXTENSION_ID,
          selectedWorkspaceFolder.uri,
        )
      ) {
        this.config.update(updatedWorkspaceConfig);
      }
    });
  }

  /**
   * Checks if the extension is enabled based on the current configuration.
   * If disabled, shows a warning message to the user (only once).
   *
   * @returns true if the extension is enabled, false otherwise.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * if (extensionRuntime.isExtensionEnabled()) {
   *   // Execute command handler logic
   * } else {
   *   // Command handler will be skipped and a warning will be shown (only on the first check)
   * }
   */
  private isExtensionEnabled(): boolean {
    const isEnabled = this.config.enable;

    if (isEnabled) {
      this.hasDisabledWarningBeenShown = false;
      return true;
    }

    if (!this.hasDisabledWarningBeenShown) {
      this.showError(
        l10n.t(
          'The {0} extension is disabled in settings. Enable it to use its features',
          EXTENSION_DISPLAY_NAME,
        ),
      );
      this.hasDisabledWarningBeenShown = true;
    }

    return false;
  }

  /**
   * Resolves project context signals and synchronizes VS Code context keys.
   *
   * The runtime intentionally orchestrates detection through shared helpers so
   * context rules stay reusable and out of this class.
   */
  private async setContextKeys(resource?: Uri): Promise<void> {
    const detectedContext = await detectProjectContext({
      resource,
      workspaceSelection: this.config.workspaceSelection,
    });

    await this.applyContext(detectedContext);
  }

  /**
   * Applies the detected context to in-memory state and VS Code UI contexts.
   */
  private async applyContext(projectContext: ProjectContext): Promise<void> {
    const resolvedContexts: ProjectContexts = {
      [ContextKeys.IsTypeScript]: projectContext.isTypeScript,
      [ContextKeys.IsNode]: projectContext.isNode,
      [ContextKeys.HasExpress]: projectContext.hasExpress,
      [ContextKeys.HasFastify]: projectContext.hasFastify,
      [ContextKeys.IsReact]: projectContext.isReact,
    };

    const contextMappings: Array<[ProjectContextKey, boolean]> = [
      [ContextKeys.IsTypeScript, resolvedContexts[ContextKeys.IsTypeScript]],
      [ContextKeys.IsNode, resolvedContexts[ContextKeys.IsNode]],
      [ContextKeys.HasExpress, resolvedContexts[ContextKeys.HasExpress]],
      [ContextKeys.HasFastify, resolvedContexts[ContextKeys.HasFastify]],
      [ContextKeys.IsReact, resolvedContexts[ContextKeys.IsReact]],
    ];

    await Promise.all(
      contextMappings.map(async ([key, value]) => {
        this.detectedContexts[key] = value;
        await commands.executeCommand(
          'setContext',
          `${EXTENSION_ID}.${key}`,
          value,
        );
      }),
    );
  }

  /**
   * Registers a VS Code command that is gated by the extension's enabled state.
   * If the extension is disabled when the command is invoked, the handler is skipped.
   *
   * @param commandId - The unique identifier for the command.
   * @param commandHandler - The function to execute when the command is invoked.
   * @returns A disposable that removes the command registration when disposed.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * const disposable = extensionRuntime.registerCommand(
   *   'autoTS.myCommand',
   *   () => {
   *     // Command handler logic that only runs if the extension is enabled
   *   }
   * );
   * // Remember to dispose of the command when it's no longer needed
   * disposable.dispose();
   */
  private registerCommand<CommandArgs extends unknown[]>(
    commandId: string,
    commandHandler: (...args: CommandArgs) => void | Promise<void>,
  ) {
    return commands.registerCommand(commandId, async (...args: CommandArgs) => {
      if (!this.isExtensionEnabled()) {
        return;
      }

      try {
        const resource = await this.resolveExecutionResource(args);
        if (!resource) {
          this.showError(
            l10n.t(
              '{0} could not find an active folder. Select a workspace folder to continue.',
              EXTENSION_DISPLAY_NAME,
            ),
          );
          return;
        }

        return commandHandler(...([resource, ...args.slice(1)] as CommandArgs));
      } catch (error) {
        this.showError(
          l10n.t(
            '{0} failed: {1}. Verify your target folder and try again.',
            EXTENSION_DISPLAY_NAME,
            getErrorMessage(error),
          ),
        );
      }
    });
  }

  /**
   * Registers the command that lets users switch the active workspace folder.
   *
   * This command is important for multi-root workspaces where users may want to change which folder the extension operates on.
   * The command updates the global state with the new selection and reloads the configuration accordingly.
   * It also provides user feedback about the workspace change.
   *
   * @memberof ExtensionRuntime
   *
   * @example
   * // The command can be invoked from the command palette or programmatically
   * await commands.executeCommand('autoTS.changeWorkspace');
   */
  private registerWorkspaceCommands(): void {
    // Register a command to change the selected workspace folder
    const disposableChangeWorkspace = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.ChangeWorkspace}`,
      async () => {
        const pickerPlaceholder = l10n.t('Select a workspace folder to use');
        const selectedFolder = await window.showWorkspaceFolderPick({
          placeHolder: pickerPlaceholder,
        });

        if (selectedFolder) {
          this.context.globalState.update(
            ContextKeys.SelectedWorkspaceFolder,
            selectedFolder.uri.toString(),
          );

          // Update configuration for the new workspace folder
          const updatedWorkspaceConfig = workspace.getConfiguration(
            EXTENSION_ID,
            selectedFolder.uri,
          );
          this.config.update(updatedWorkspaceConfig);

          this.config.workspaceSelection = selectedFolder.uri.fsPath;
          await this.setContextKeys(selectedFolder.uri);

          window.showInformationMessage(
            l10n.t('Switched to workspace folder: {0}', selectedFolder.name),
          );
        }
      },
    );

    this.context.subscriptions.push(disposableChangeWorkspace);
  }

  /**
   * Resolves the execution resource for a command.
   *
   * If a URI is provided in the arguments, it is used directly.
   * Otherwise, attempts to infer the active folder from the workspace context.
   *
   * @param args - Command arguments passed during execution.
   * @returns The resolved URI or undefined if it cannot be determined.
   */
  private async resolveExecutionResource(
    args: unknown[],
  ): Promise<Uri | undefined> {
    const firstArg = args[0];

    if (firstArg instanceof Uri) {
      return firstArg;
    }

    return resolveFolderResource(undefined);
  }

  /**
   * Displays an error message to the user.
   *
   * This centralizes error handling to ensure consistency and allow
   * future improvements (e.g., logging or telemetry) without changing call sites.
   *
   * @param message - The message to display.
   */
  private showError(message: string): void {
    window.showErrorMessage(message);
  }

  /**
   * Builds Smart Generate options with lightweight context-aware relevance.
   *
   * Context is used only to prioritize options.
   * All commands remain available to avoid restricting user workflows.
   *
   * @param commandDefinitions Registered command definitions.
   * @param context Project context flags.
   * @returns Ordered options for Smart Generate quick pick.
   */
  private buildGenerateOptions(
    commandDefinitions: Array<{
      name: CommandIds;
      label: string;
      detail: string;
    }>,
    contexts: ProjectContexts,
  ): GenerateOption[] {
    const reactCommands = new Set<CommandIds>([
      CommandIds.GenerateReactComponent,
    ]);
    const nodeCommands = new Set<CommandIds>([
      CommandIds.GenerateNodeModule,
      CommandIds.GenerateNodeServer,
    ]);
    const typeScriptCommands = new Set<CommandIds>([
      CommandIds.GenerateInterface,
      CommandIds.GenerateEnum,
      CommandIds.GenerateType,
    ]);
    const expressCommands = new Set<CommandIds>([
      CommandIds.GenerateExpressController,
      CommandIds.GenerateExpressMiddleware,
      CommandIds.GenerateExpressRoute,
      CommandIds.GenerateExpressServer,
    ]);
    const fastifyCommands = new Set<CommandIds>([
      CommandIds.GenerateFastifyController,
      CommandIds.GenerateFastifyMiddleware,
      CommandIds.GenerateFastifyRoute,
      CommandIds.GenerateFastifyServer,
    ]);

    const options: GenerateOption[] = commandDefinitions.map(
      (commandDefinition) => {
        let score = 0;
        const signals: string[] = [];

        if (
          reactCommands.has(commandDefinition.name) &&
          contexts[ContextKeys.IsReact]
        ) {
          signals.push('react');
          score += 100;
        }

        if (
          typeScriptCommands.has(commandDefinition.name) &&
          contexts[ContextKeys.IsTypeScript]
        ) {
          signals.push('typescript');
          score += 30;
        }

        if (
          nodeCommands.has(commandDefinition.name) &&
          contexts[ContextKeys.IsNode]
        ) {
          signals.push('node');
          score += 20;
        }

        if (
          expressCommands.has(commandDefinition.name) &&
          contexts[ContextKeys.HasExpress]
        ) {
          signals.push('express');
          score += 80;
        }

        if (
          fastifyCommands.has(commandDefinition.name) &&
          contexts[ContextKeys.HasFastify]
        ) {
          signals.push('fastify');
          score += 80;
        }

        const confidence: 'low' | 'medium' | 'high' =
          signals.length >= 2
            ? 'high'
            : signals.length === 1
              ? 'medium'
              : 'low';

        return {
          label: commandDefinition.label,
          detail: commandDefinition.detail,
          commandId: commandDefinition.name,
          score,
          signals,
          confidence,
        };
      },
    );

    const maxScore = Math.max(...options.map((option) => option.score), 0);
    const topOptions = options.filter((option) => option.score === maxScore);

    if (topOptions.length === 1 && topOptions[0].confidence === 'high') {
      topOptions[0].isSuggested = true;
    }

    options.sort(
      (leftOption, rightOption) =>
        rightOption.score - leftOption.score ||
        leftOption.label.localeCompare(rightOption.label),
    );

    return options;
  }

  /**
   * Suggestion system v2:
   * - Uses signals instead of raw score
   * - Avoids false positives
   * - Only suggests when confidence is high and unambiguous
   *
   * Options are shown in two sections only when there is a single, high-confidence
   * suggestion. Otherwise, the full list stays flat and visible.
   */
  private buildSmartGenerateItems(
    options: GenerateOption[],
  ): GenerateQuickPickItem[] {
    const suggestedOption = options.find(
      (option) => option.isSuggested && option.confidence === 'high',
    );
    const otherOptions = options
      .filter((option) => option !== suggestedOption)
      .map((option) => ({ ...option, picked: false }));

    if (!suggestedOption) {
      return options;
    }

    return [
      {
        label: l10n.t('Suggested'),
        kind: QuickPickItemKind.Separator,
      },
      {
        ...suggestedOption,
        picked:
          suggestedOption.isSuggested && suggestedOption.confidence === 'high',
      },
      {
        label: l10n.t('Other options'),
        kind: QuickPickItemKind.Separator,
      },
      ...otherOptions,
    ];
  }

  /**
   * Registers all commands related to file operations.
   *
   * Commands are registered with handlers that delegate to the FileGeneratorService, which encapsulates the logic for each operation.
   * This keeps the command registration clean and focused on wiring up user actions to controller logic.
   *
   * The registered commands include creating a barrel file, updating a barrel file in a folder, and updating a specific barrel file.
   *
   * @memberof ExtensionRuntime
   */
  private registerGeneratorCommands(): void {
    const invoker = new CommandInvoker(this.config.enable);

    const commandList = [
      {
        name: CommandIds.GenerateClass,
        label: l10n.t('Class'),
        detail: l10n.t('Generate a TypeScript class'),
        handler: new GenerateClassCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateInterface,
        label: l10n.t('Interface'),
        detail: l10n.t('Generate a TypeScript interface'),
        handler: new GenerateInterfaceCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateEnum,
        label: l10n.t('Enum'),
        detail: l10n.t('Generate a TypeScript enum'),
        handler: new GenerateEnumCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateType,
        label: l10n.t('Type'),
        detail: l10n.t('Generate a TypeScript type alias'),
        handler: new GenerateTypeCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateFunction,
        label: l10n.t('Function'),
        detail: l10n.t('Generate a function file'),
        handler: new GenerateFunctionCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateVariable,
        label: l10n.t('Variable'),
        detail: l10n.t('Generate a variable file'),
        handler: new GenerateVariableCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateCustomComponent,
        label: l10n.t('Custom Template'),
        detail: l10n.t('Generate from custom templates'),
        handler: new GenerateCustomComponentCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateNodeModule,
        label: l10n.t('Node Module'),
        detail: l10n.t('Generate a Node.js module'),
        handler: new GenerateNodeModuleCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateNodeServer,
        label: l10n.t('Node Server'),
        detail: l10n.t('Generate a Node.js server'),
        handler: new GenerateNodeServerCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateExpressController,
        label: l10n.t('Express Controller'),
        detail: l10n.t('Generate an Express controller'),
        handler: new GenerateExpressControllerCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateExpressMiddleware,
        label: l10n.t('Express Middleware'),
        detail: l10n.t('Generate an Express middleware'),
        handler: new GenerateExpressMiddlewareCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateExpressRoute,
        label: l10n.t('Express Route'),
        detail: l10n.t('Generate an Express route'),
        handler: new GenerateExpressRouteCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateExpressServer,
        label: l10n.t('Express Server'),
        detail: l10n.t('Generate an Express server'),
        handler: new GenerateExpressServerCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateFastifyController,
        label: l10n.t('Fastify Controller'),
        detail: l10n.t('Generate a Fastify controller'),
        handler: new GenerateFastifyControllerCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateFastifyMiddleware,
        label: l10n.t('Fastify Middleware'),
        detail: l10n.t('Generate a Fastify middleware'),
        handler: new GenerateFastifyMiddlewareCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateFastifyRoute,
        label: l10n.t('Fastify Route'),
        detail: l10n.t('Generate a Fastify route'),
        handler: new GenerateFastifyRouteCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateFastifyServer,
        label: l10n.t('Fastify Server'),
        detail: l10n.t('Generate a Fastify server'),
        handler: new GenerateFastifyServerCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
      {
        name: CommandIds.GenerateReactComponent,
        label: l10n.t('React Component'),
        detail: l10n.t('Generate a React functional component'),
        handler: new GenerateReactComponentCommand(
          this.config,
          this.context.extensionUri,
        ),
      },
    ];

    commandList.forEach(({ name, handler }) => {
      invoker.register(name, handler);

      const disposable = this.registerCommand(
        `${EXTENSION_ID}.${name}`,
        async (uri: Uri) => await invoker.execute(name, uri),
      );

      this.context.subscriptions.push(disposable);
    });

    const disposableSmartGenerate = this.registerCommand(
      `${EXTENSION_ID}.${CommandIds.Generate}`,
      async (uri: Uri) => {
        const options = this.buildGenerateOptions(
          commandList.map((commandDefinition) => ({
            name: commandDefinition.name,
            label: commandDefinition.label,
            detail: commandDefinition.detail,
          })),
          this.detectedContexts,
        );
        const items = this.buildSmartGenerateItems(options);

        const selectedItem = await window.showQuickPick(items, {
          placeHolder: l10n.t('Select a file type'),
          matchOnDescription: true,
          matchOnDetail: true,
        });

        if (!selectedItem || !('commandId' in selectedItem)) {
          return;
        }

        await invoker.execute(selectedItem.commandId, uri);
      },
    );

    this.context.subscriptions.push(disposableSmartGenerate);
  }
}
