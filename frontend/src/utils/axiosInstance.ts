import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Укажи свой API

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // если используешь куки
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await axios.get(`${API_URL}/auth/refresh`, { withCredentials: true }); // Обновляем токен
                return api(originalRequest); // Повторяем запрос
            } catch (err) {
                console.error("Ошибка обновления токена", err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
