export default class AuthError extends Error {
  constructor(message: string) {
    super(message); // передаем сообщение в конструктор Error
    this.name = "AuthError"; // задаем имя ошибки

    // Восстанавливаем прототип (необходимо для правильной работы instanceof в некоторых версиях JS/TS)
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
