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

/**
 * Compares a plain text password with a hashed password using bcrypt.
 *
 * This function compares a plain text password with a hashed password to verify if they match.
 * It is used to validate a user's password during the sign-in process.
 *
 * @param {string} plainPassword - The plain text password to be compared.
 * @param {string} hashedPassword - The hashed password to be compared.
 * @returns {boolean} A boolean indicating whether the passwords match.
 *
 * @throws {Error} Logs an error message if the comparison process fails.
 *
 * @example
 * const isMatch = comparePassword('myPlainPassword', '$2b$10$EIX0..');
 * console.log(isMatch); // true
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.log('Error in comparePassword:', error);
    return false;
  }
};
