import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import AuthLayout from "./components/Auth/AuthLayout/AuthLayout.tsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.tsx";
import NotFoundPage from "./pages/NotFound.tsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicy.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import PublicRoute from "./components/PublicRoute/PublicRoute.tsx";
import { useContext } from "react";
import { AuthContext } from "./components/AuthContext/AuthContext.tsx";

function App() {
    const auth = useContext(AuthContext);

    if (!auth) {
        return <div>Ошибка: не удалось загрузить контекст аутентификации</div>;
    }

    const { isAuthenticated, isLoading } = auth;

    if (isLoading) {
        return <div>Загрузка...</div>; // Показываем прелоадер, пока идёт проверка авторизации
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Авторизация */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<PublicRoute element={<Login />} isAuthenticated={isAuthenticated} />} />
                <Route path="/register" element={<PublicRoute element={<Register />} isAuthenticated={isAuthenticated} />} />
                <Route path="/reset" element={<PublicRoute element={<Reset />} isAuthenticated={isAuthenticated} />} />
                <Route path="/verify-email/:hash" element={<PublicRoute element={<VerifyEmail />} isAuthenticated={isAuthenticated} />} />
            </Route>

            {/* Защищённый маршрут */}
            <Route path="/dashboard/*" element={<ProtectedRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />} />

            {/* Политика конфиденциальности */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* Ошибка 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
