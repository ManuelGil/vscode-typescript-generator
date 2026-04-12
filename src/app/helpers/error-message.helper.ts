/**
 * Converts unknown error values into safe, user-facing text.
 *
 * @param error - Unknown thrown value.
 * @returns Readable error message.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};
