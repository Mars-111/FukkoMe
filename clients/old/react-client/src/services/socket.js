// export 

// function decodeToken(token) {
//     try {
//         // JWT состоит из 3 частей, нам нужна 2-я (Payload)
//         const base64Url = token.split('.')[1];

//         // Base64-URL → Base64
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

//         // Декодируем Payload
//         return JSON.parse(atob(base64));
//     } catch (e) {
//         console.error("Ошибка декодирования токена:", e);
//         return null;
//     }
// }


// export default function initWebSocket(token) {
//     console.log("Инициализация WebSocket-клиента...");
//     const socket = new WebSocket(`wss://socket.mars-ssn.ru/ws?token=${token}`);
//     socket.onopen = () => {
//         console.log("WebSocket соединение установлено");
//     };
//     socket.onclose = (event) => {
//         console.log("WebSocket соединение закрыто", event);
//     };
//     socket.onerror = (error) => {
//         console.error("Ошибка WebSocket:", error);
//     };
//     socket.onmessage = (event) => {
//         try {
//             const data = JSON.parse(event.data);
//             handleMessage(data);
//         } catch (e) {
//             console.error("Ошибка парсинга сообщения:", e, event.data);
//         }
//     };
//     return socket;
// }