// jwtService.js

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token format');
  }

  const payloadBase64Url = parts[1];
  const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');

  // Добавим padding для base64 при необходимости
  const padded = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, '=');

  const payloadJson = atob(padded); // заменили Buffer на atob
  return JSON.parse(payloadJson);
}


export function getUserId(token) {
  try {
    const payload = parseJwt(token);
    // user_id может быть строкой или числом, попытаемся преобразовать в Number
    const userIdRaw = payload.user_id;
    if (userIdRaw === undefined || userIdRaw === null) return null;

    const userIdNum = Number(userIdRaw);
    if (Number.isNaN(userIdNum)) return null;

    return userIdNum;
  } catch (e) {
    console.error('Failed to parse JWT:', e.message);
    return null;
  }
}