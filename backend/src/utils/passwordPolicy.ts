// Min 8 chars, at least one lowercase, one uppercase, one digit, one special character.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_RULES_DESCRIPTION =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';

export function isStrongPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
