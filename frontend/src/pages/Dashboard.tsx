import { Button } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function DashboardPage() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/auth/logout",
                {},
                { withCredentials: true } // Передаем куки
            );

            navigate("/login"); // Перенаправляем на страницу входа
        } catch (error) {
            console.error("Ошибка при выходе из системы:", error);
        }
    };

    return (
        <>
            <Button><Link to={'/login'}>Авторизация</Link></Button>
            <Button><Link to={'/register'}>Регистрация</Link></Button>
            <button onClick={handleLogout} className="logout-button">
                Выйти
            </button>
        </>
    );
}
