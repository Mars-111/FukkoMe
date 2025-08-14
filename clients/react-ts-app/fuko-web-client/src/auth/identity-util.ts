

export function isValidGrantType(grantType: string) {
    return grantType === "authorization_code" || grantType === "cookie";
}

export function parseJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload); // Расшифровывает base64
    return JSON.parse(decoded);
  } catch (e) {
    console.error('Invalid JWT', e);
    return null;
  }
}
