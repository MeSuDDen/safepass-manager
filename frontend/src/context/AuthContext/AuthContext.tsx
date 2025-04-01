import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { FaCircleCheck } from "react-icons/fa6";
import api from "../../utils/axiosInstance";
import { User } from "../../types";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAdmin: () => boolean;
    checkAuth: () => Promise<void>;
    register: (email: string, password: string, masterPassword: string, confirmMasterPassword: string, agree: boolean) => Promise<void>;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useNavigate();

    // Функция обновления токена
    const refreshToken = async () => {
        try {
            const response = await api.get("/auth/refresh");
            const { accessToken } = response.data;
            setToken(accessToken);
            document.cookie = `accessToken=${accessToken}; path=/; max-age=900`;
        } catch (error) {
            console.error("Ошибка обновления токена", error);
        }
    };

    // Проверка аутентификации пользователя
    const checkAuth = async () => {
        try {
            const response = await api.get("/auth/me");
            setUser(response.data.user);
            setToken(response.data.token);
        } catch (error) {
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Вызов checkAuth при монтировании компонента
    useEffect(() => {
        checkAuth();
    }, []);

    // Логин
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await api.post("/auth/login", { email, password });
            setUser(response.data.user);
            setToken(response.data.token);
            console.log('User after login: ', response.data)
            toast.success("Авторизация успешна", { icon: <FaCircleCheck size={20} color="#575757" /> });
            router("/dashboard");
        } catch (error) {
            console.error("Ошибка входа", error);
            toast.error("Ошибка входа");
        } finally {
            setIsLoading(false);
        }
    };

    // Регистрация
    const register = async (email: string, password: string, masterPassword: string, confirmMasterPassword: string, agree: boolean) => {
        try {
            setIsLoading(true);
            const response = await api.post("/auth/register", { email, password, masterPassword, confirmMasterPassword, agree });
            toast.success("Регистрация успешна. Проверьте почту.", { icon: <FaCircleCheck size={20} color="#575757" /> });
            router("/verify-email/" + response.data.emailVerificationHash);
        } catch (error) {
            console.error("Ошибка регистрации", error);
            toast.error("Ошибка регистрации");
        } finally {
            setIsLoading(false);
        }
    };

    // Выход
    const logout = async () => {
        try {
            await api.post("/auth/logout");
            setUser(null);
            setToken(null);
            toast.success("Выход выполнен", { icon: <FaCircleCheck size={20} color="#575757" /> });
            router("/login");
        } catch (error) {
            console.error("Ошибка выхода", error);
            toast.error("Ошибка при выходе");
        }
    };

    // Проверка роли администратора
    const isAdmin = () => user?.role === "admin";

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin, checkAuth, register, refreshToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth должен использоваться внутри AuthProvider");
    }
    return context;
};
