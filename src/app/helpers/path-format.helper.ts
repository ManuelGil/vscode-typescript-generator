/**
 * Normalizes filesystem paths to POSIX-style separators for cross-platform compatibility.
 * @category Helpers
 */
export const toPosixPath = (filePath: string): string => {
  return filePath.replace(/\\/g, '/');
};
