/**
 * Changes a string of words separated by spaces or underscores to camel case.
 *
 * @param {string} str - The string to camelize
 * @example
 * camelize('foo bar');
 *
 * @returns {string} - The camelized string
 */
export const camelize = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/g, '')
    .replace(/-+/g, '')
    .replace(/_+/g, '')
    .replace(/\.+/g, '')
    .replace(/\/+/g, '');
};

/**
 * Changes a string of words separated by spaces or underscores to pascal case.
 *
 * @param {string} str - The string to pascalize
 * @example
 * pascalize('foo bar');
 *
 * @returns {string} - The pascalized string
 */
export const pascalize = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/-+/g, '')
    .replace(/_+/g, '')
    .replace(/\.+/g, '')
    .replace(/\/+/g, '');
};

/**
 * Changes a string to kebab-case.
 *
 * @param {string} str - The string to kebabize
 * @example
 * kebabize('foo bar');
 *
 * @returns {string} - The kebabized string
 */
export const kebabize = (str: string): string => {
  return str
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/\.+/g, '-')
    .replace(/\/+/g, '-')
    .toLowerCase();
};

/**
 * Changes a string to snake_case.
 *
 * @param {string} str - The string to snakeize
 * @example
 * snakeize('foo bar');
 *
 * @returns {string} - The snakeized string
 */
export const snakeize = (str: string): string => {
  return str
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/\.+/g, '_')
    .replace(/\/+/g, '_')
    .toLowerCase();
};

/**
 * Changes a string to CONSTANT_CASE.
 *
 * @param {string} str - The string to constantize
 * @example
 * constantize('foo bar');
 *
 * @returns {string} - The constantized string
 */
export const constantize = (str: string): string => {
  return str
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/\.+/g, '_')
    .replace(/\/+/g, '_')
    .toUpperCase();
};

/**
 * Changes a string to Title Case.
 *
 * @param {string} str - The string to titleize
 * @example
 * titleize('foo bar');
 *
 * @returns {string} - The titleized string
 */
export const titleize = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Changes a string to Sentence case.
 *
 * @param {string} str - The string to sentenceCase
 * @example
 * sentenceCase('foo bar');
 *
 * @returns {string} - The sentence-cased string
 */
export const sentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Changes a string to its plural form.
 *
 * @param {string} str - The string to pluralize
 * @example
 * pluralize('foo');
 *
 * @returns {string} - The pluralized string
 */
export const pluralize = (str: string): string => {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s')) {
    return str;
  }
  return str + 's';
};

/**
 * Changes a string to its singular form.
 *
 * @param {string} str - The string to singularize
 * @example
 * singularize('foos');
 *
 * @returns {string} - The singularized string
 */
export const singularize = (str: string): string => {
  if (str.endsWith('ies')) {
    return str.slice(0, -3) + 'y';
  }
  if (str.endsWith('s')) {
    return str.slice(0, -1);
  }
  return str;
};
