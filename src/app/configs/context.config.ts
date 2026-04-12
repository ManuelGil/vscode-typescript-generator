/**
 * Keys used to store and retrieve data from the extension's global state.
 */
export enum ContextKeys {
  /** The URI string of the user's previously selected workspace folder. */
  SelectedWorkspaceFolder = 'selectedWorkspaceFolder',

  /** The last recorded version of the extension to detect updates. */
  Version = 'version',

  /** Signals whether the current workspace is a TypeScript project. */
  IsTypeScript = 'is.typescript',

  /** Signals whether the current workspace has Node.js dependencies. */
  IsNode = 'is.node',

  /** Signals whether the current workspace has Express.js dependencies. */
  HasExpress = 'has.express',

  /** Signals whether the current workspace has Fastify dependencies. */
  HasFastify = 'has.fastify',

  /** Signals whether the current workspace has React dependencies or files. */
  IsReact = 'is.react',
}
