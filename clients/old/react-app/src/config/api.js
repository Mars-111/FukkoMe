import axios from "axios";
import keycloak from "../auth/keycloak";


export const apiChatsService = axios.create({
    baseURL: "https://chats.mars-ssn.ru/api",
});


// Добавляем interceptor для автоматического добавления токена
apiChatsService.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      // Проверяем и обновляем токен перед каждым запросом
      try {
        await keycloak.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error('Не удалось обновить токен:', error);
        keycloak.logout();
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов
apiChatsService.interceptors.response.use(
  (response) => {
    console.log('Успешный запрос');
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      console.warn(`Ошибка с кодом ${status}`);

      if (status === 401) {
        console.log('Unauthorized - перенаправление на login');
        keycloak.login();
      }

      if (status === 500) {
        console.log('Ошибка сервера — перенаправление на 500.html');
        window.location.href = '/errors/500.html';
      }


    } else if (error.request) {
      console.warn('Сервер не ответил (возможно CORS или отключение сервера)');        
      window.location.href = '/errors/502.html';
      // Можешь тут показать страницу "сервер недоступен"
    } else {
      console.error('Произошла ошибка при настройке запроса:', error.message);
    }

    return Promise.reject(error);
  }
);
