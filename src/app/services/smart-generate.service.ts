import { CommandDefinition } from '../configs';
import { isContextActive, ProjectContext } from '../types';

/**
 * Ranks generation commands by active project context.
 *
 * @remarks
 * This service is intentionally stateless, deterministic, and side-effect free.
 * It exists as a class to keep the services layer consistent.
 *
 * IMPORTANT:
 * Do not introduce weights or heuristics here.
 * Ranking must remain predictable and easy to reason about.
 *
 * This service does NOT:
 * - Detect project context
 * - Execute commands
 * - Control UI behavior
 *
 * @category Services
 * @internal
 */
export class SmartGenerateService {
  /**
   * Orders commands by relevance to the detected context.
   *
   * @param commands - Available command definitions.
   * @param context - Detected project context signals.
   * @remarks
   * Returns a new array and does not mutate the input.
   * Uses a simple match-count score with no weighting or heuristics.
   *
   * @example
   * const sorted = service.sortByContextRelevance(commands, context);
   */
  public sortByContextRelevance(
    commands: CommandDefinition[],
    context: ProjectContext,
  ): CommandDefinition[] {
    return [...commands].sort((leftCommand, rightCommand) => {
      const scoreLeft = this.calculateContextScore(leftCommand, context);
      const scoreRight = this.calculateContextScore(rightCommand, context);

      // Higher score means the command is more relevant for the active context.
      return scoreRight - scoreLeft;
    });
  }

  /**
   * Calculates how well a command matches the current project context.
   */
  private calculateContextScore(
    command: CommandDefinition,
    context: ProjectContext,
  ): number {
    if (!command.contexts || command.contexts.length === 0) {
      return 0;
    }

    let score = 0;

    for (const contextKey of command.contexts) {
      if (isContextActive(context, contextKey)) {
        score++;
      }
    }

    return score;
  }
}
