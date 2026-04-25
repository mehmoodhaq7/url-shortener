const { nanoid } = require("nanoid");

/**
 * Generates a URL-safe unique slug
 * @param {number} size - length of slug (default 7)
 * @returns {string}
 */
const generateSlug = (size = 7) => {
  return nanoid(size);
};

module.exports = generateSlug;
