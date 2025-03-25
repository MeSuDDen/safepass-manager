import {Button} from "@material-tailwind/react";
import {Link, useNavigate} from "react-router-dom";

export default function DashboardPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken"); // Удаляем токен
        navigate("/login"); // Перенаправляем на страницу входа
    };
    return (
        <>
            <Button><Link to={'/login'}>Авторизация</Link></Button>
            <Button><Link to={'/register'}>Регистрация</Link></Button>
            <button onClick={handleLogout} className="logout-button">
                Выйти
            </button>
        </>
    )
}