/**
 * Returns cookie configuration options
 * @param expirationDate Cookie expiration date
 */
export function getCookieOptions (expirationDate: Date) {
  return {
    path: '/',
    expires: expirationDate,
    httpOnly: true,
    secure: process.env.PRODUCTION,
    domain: process.env.PRODUCTION ? process.env.FRONT_END_URL : undefined,
  }
}