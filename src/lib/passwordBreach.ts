/**
 * Check if a password has been found in data breaches using the
 * HaveIBeenPwned Passwords API (k-Anonymity model).
 * Only the first 5 chars of the SHA-1 hash are sent to the API.
 */
export async function checkPasswordBreach(password: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return 0;
    const text = await response.text();
    const match = text.split('\n').find(line => line.startsWith(suffix));
    if (match) {
      return parseInt(match.split(':')[1].trim(), 10);
    }
    return 0;
  } catch {
    // If the API is unreachable, don't block signup
    return 0;
  }
}
