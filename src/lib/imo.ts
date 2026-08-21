/**
 * IMO numbers are 7 digits where the 7th digit is a check digit computed
 * from the first six, weighted 7,6,5,4,3,2. A string being 7 digits long
 * is not sufficient to consider it valid — verify the check digit.
 */
export function isValidIMO(raw: string | null | undefined): boolean {
  if (!raw) return false
  const cleaned = raw.trim().replace(/^IMO\s*/i, "")
  if (!/^\d{7}$/.test(cleaned)) return false

  const digits = cleaned.split("").map(Number)
  const checkDigit = digits[6]
  const weights = [7, 6, 5, 4, 3, 2]
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0)
  return sum % 10 === checkDigit
}

export function normalizeIMO(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = raw.trim().replace(/^IMO\s*/i, "")
  return /^\d{7}$/.test(cleaned) ? cleaned : null
}
