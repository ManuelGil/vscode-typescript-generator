/**
 * Represents the supported context signals that can be detected in a workspace.
 *
 * Usage: these keys are shared by context detection, command metadata, and
 * Smart Generate scoring.
 *
 * Constraint: only add a key when the extension provides context-specific
 * commands or behavior for that ecosystem.
 * @category Types
 */
export type ContextKey = 'react' | 'express' | 'fastify';

/**
 * Snapshot of detected project contexts.
 *
 * Usage: each key indicates whether that context is active for the current
 * workspace or selected folder.
 *
 * Constraint: the record must include every `ContextKey` exactly once.
 * @category Types
 */
export type ProjectContext = Record<ContextKey, boolean>;

/**
 * Returns whether a specific context key is active in the given snapshot.
 *
 * @remarks
 * This helper is intentionally tiny to keep context access uniform across
 * runtime and services.
 * @category Types
 */
export const isContextActive = (
  context: ProjectContext,
  key: ContextKey,
): boolean => {
  return context[key];
};

/**
 * Default empty context used when a workspace cannot be resolved or inspected.
 * @category Types
 */
export const EMPTY_PROJECT_CONTEXT: ProjectContext = {
  react: false,
  express: false,
  fastify: false,
};
