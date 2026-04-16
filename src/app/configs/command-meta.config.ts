import { ContextKey } from '../types';
import { CommandIds } from './commands.config';

/**
 * Defines a generator command consumed by command registration and Smart Generate.
 *
 * Usage: each entry maps a command id to UI text and optional context affinity.
 *
 * Constraint: `id` values must be unique, and `contexts` can only include
 * supported `ContextKey` values.
 *
 * This config does NOT implement scoring or execution behavior.
 * @category Config
 */
export type CommandDefinition = {
  id: CommandIds;
  contexts?: ContextKey[];
  ui: {
    label: string;
    detail: string;
  };
};

export const COMMANDS: CommandDefinition[] = [
  // Core commands are always available regardless of detected framework.
  {
    id: CommandIds.GenerateClass,
    ui: {
      label: 'Class',
      detail: 'Generate a TypeScript class',
    },
  },
  {
    id: CommandIds.GenerateInterface,
    ui: {
      label: 'Interface',
      detail: 'Generate a TypeScript interface',
    },
  },
  {
    id: CommandIds.GenerateEnum,
    ui: {
      label: 'Enum',
      detail: 'Generate a TypeScript enum',
    },
  },
  {
    id: CommandIds.GenerateType,
    ui: {
      label: 'Type',
      detail: 'Generate a TypeScript type alias',
    },
  },
  {
    id: CommandIds.GenerateFunction,
    ui: {
      label: 'Function',
      detail: 'Generate a function file',
    },
  },
  {
    id: CommandIds.GenerateVariable,
    ui: {
      label: 'Variable',
      detail: 'Generate a variable file',
    },
  },
  {
    id: CommandIds.GenerateCustomComponent,
    ui: {
      label: 'Custom Template',
      detail: 'Generate from custom templates',
    },
  },
  {
    id: CommandIds.GenerateNodeModule,
    ui: {
      label: 'Node Module',
      detail: 'Generate a Node.js module',
    },
  },
  {
    id: CommandIds.GenerateNodeServer,
    ui: {
      label: 'Node Server',
      detail: 'Generate a Node.js server',
    },
  },
  // React-specific commands are context-affined, not context-gated.
  {
    id: CommandIds.GenerateReactComponent,
    contexts: ['react'],
    ui: {
      label: 'React Component',
      detail: 'Generate a React functional component',
    },
  },
  // Express-specific commands are context-affined, not context-gated.
  {
    id: CommandIds.GenerateExpressController,
    contexts: ['express'],
    ui: {
      label: 'Express Controller',
      detail: 'Generate an Express controller',
    },
  },
  {
    id: CommandIds.GenerateExpressMiddleware,
    contexts: ['express'],
    ui: {
      label: 'Express Middleware',
      detail: 'Generate an Express middleware',
    },
  },
  {
    id: CommandIds.GenerateExpressRoute,
    contexts: ['express'],
    ui: {
      label: 'Express Route',
      detail: 'Generate an Express route',
    },
  },
  {
    id: CommandIds.GenerateExpressServer,
    contexts: ['express'],
    ui: {
      label: 'Express Server',
      detail: 'Generate an Express server',
    },
  },
  // Fastify-specific commands are context-affined, not context-gated.
  {
    id: CommandIds.GenerateFastifyController,
    contexts: ['fastify'],
    ui: {
      label: 'Fastify Controller',
      detail: 'Generate a Fastify controller',
    },
  },
  {
    id: CommandIds.GenerateFastifyMiddleware,
    contexts: ['fastify'],
    ui: {
      label: 'Fastify Middleware',
      detail: 'Generate a Fastify middleware',
    },
  },
  {
    id: CommandIds.GenerateFastifyRoute,
    contexts: ['fastify'],
    ui: {
      label: 'Fastify Route',
      detail: 'Generate a Fastify route',
    },
  },
  {
    id: CommandIds.GenerateFastifyServer,
    contexts: ['fastify'],
    ui: {
      label: 'Fastify Server',
      detail: 'Generate a Fastify server',
    },
  },
];
