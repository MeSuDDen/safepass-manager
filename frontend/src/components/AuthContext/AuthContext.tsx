import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            await axios.get("http://localhost:5000/api/auth/me", {
                withCredentials: true, // Отправляем куки
            });
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
