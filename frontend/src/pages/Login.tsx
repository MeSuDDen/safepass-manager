import {Alert, Button, Input, Typography} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import logo from "../assets/images/main-logo.svg";
import { useState } from "react";
import axios from "axios";
import {IoMdWarning} from "react-icons/io";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                { email, password },
                { withCredentials: true } // Обязательно для работы с куками
            );

            console.log("Server Response:", response.data);

            if (response.data.requiresMasterPassword) {
                navigate("/master-password"); // Переход на ввод мастер-пароля
            } else {
                navigate("/dashboard"); // Если не требуется мастер-пароль
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Неправильная почта или пароль.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="flex justify-center gap-4 items-center">
                <img src={logo} alt="SafePass" width="40px" />
                <h1 className="font-bold text-3xl">SafePass</h1>
            </div>

            <h1 className="text-center font-bold text-2xl">Авторизация</h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
                {/* Поле email */}
                <div className="space-y-1">
                    <Typography as="label" htmlFor="email" type="small" color="default" className="font-semibold">
                        Почта (Корпоративная)
                    </Typography>
                    <Input
                        id="email"
                        type="email"
                        placeholder="someone@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="data-[icon-placement=start]:!pl-[36px]"
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <MdOutlineEmail size={20} className="ml-2" />
                        </Input.Icon>
                    </Input>
                </div>

                {/* Поле пароля */}
                <div className="space-y-1">
                    <Typography as="label" htmlFor="password" type="small" color="default" className="font-semibold">
                        Пароль
                    </Typography>
                    <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="data-[icon-placement=start]:!pl-[36px]"
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <TbLockPassword size={20} className="ml-2" />
                        </Input.Icon>
                    </Input>
                </div>

                {/* Ошибка */}
                {error && (
                    <Alert color={"warning"}>
                        <Alert.Icon>
                            <IoMdWarning size={20} />
                        </Alert.Icon>
                        <Alert.Content>{error}</Alert.Content>
                    </Alert>
                )}

                {/* Кнопка входа */}
                <Button type="submit" isFullWidth={true} disabled={isLoading}>
                    {isLoading ? "Вход..." : "Войти"}
                </Button>
            </form>

            {/* Ссылки */}
            <Typography type="small" color="default" className="mt-4 font-normal">
                Вы не зарегистрированы?{" "}
                <Link to="/register" className="font-medium text-[#a3a3a3] hover:text-[#212121] transition-all">
                    Регистрация
                </Link>
            </Typography>

            <Typography as="a" href="/reset" type="small" color="default"
                        className="font-medium text-[#a3a3a3] hover:text-[#212121] transition-all">
                Восстановить пароль
            </Typography>
        </div>
    );
}
