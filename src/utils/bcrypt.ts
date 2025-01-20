import * as bcrypt from 'bcrypt';
const saltRounds = 10;

/**
 * Hashes a plain text password using bcrypt.
 *
 * This function generates a salt and uses it to hash the provided plain text password.
 * It ensures the password is securely hashed before storing it in a database.
 *
 * @param {string} plainPassword - The plain text password to be hashed.
 * @returns {string | undefined} The hashed password. If an error occurs, returns `undefined`.
 *
 * @throws {Error} Logs an error message if the hashing process fails.
 *
 * @example
 * const hashedPassword = hashPassword('myPlainPassword');
 * console.log(hashedPassword); // '$2b$10$EIX0..'
 */
export const hashPassword = (plainPassword: string): string | undefined => {
  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(plainPassword, salt);
  } catch (error) {
    console.log('Error in hashPassword:', error);
    return undefined;
  }
};
