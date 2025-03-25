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

const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    return !!token; // Если токен есть → true, иначе → false
};

function App() {
    const isAuthenticated = checkAuth(); // Определяем статус авторизации

    return (
        <Routes>
            {/* Переадресация на страницу авторизации */}
            <Route path="/" element={<Navigate to="/login"/>}/>

            {/* Авторизация */}
            <Route element={<AuthLayout />} >
                <Route path="/login" element={<PublicRoute element={<Login />} isAuthenticated={isAuthenticated} />} />
                <Route path="/register" element={<PublicRoute element={<Register />} isAuthenticated={isAuthenticated} />} />
                <Route path="/reset" element={<PublicRoute element={<Reset />} isAuthenticated={isAuthenticated} />} />
                <Route path="/verify-email" element={<PublicRoute element={<VerifyEmail />} isAuthenticated={isAuthenticated} />} />
            </Route>

            <Route path="/dashboard/*" element={<ProtectedRoute element={<Dashboard/>} isAuthenticated={isAuthenticated} />}/>

            {/* Политика конфиденциальности и условия */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage/>}/>

            {/* Ошибка 404 */}
            <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
    );
}

export default App;
