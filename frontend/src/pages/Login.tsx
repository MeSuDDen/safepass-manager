import { Button, Input, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import logo from "../assets/images/main-logo.svg";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext/AuthContext.tsx";
import {toast, Toaster} from "react-hot-toast";
import {useEffect, useState} from "react";
import {LoginFormValues} from "../types";

export default function LoginPage() {
    const { login, isLoading, user } = useAuth();
    const [Loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && user) {
            navigate("/dashboard"); // Редирект на дашборд, если пользователь уже авторизован
        }
    }, [user, isLoading, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>();

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
        } catch (error) {
            console.error("Ошибка входа:", error);
            toast.error("Неправильная почта или пароль.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center">
            <Toaster />
            <div className="flex justify-center gap-4 items-center">
                <img src={logo} alt="SafePass" width="40px" />
                <h1 className="font-bold text-3xl">SafePass</h1>
            </div>

            <h1 className="text-center font-bold text-2xl">Авторизация</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
                {/* Поле email */}
                <div className="space-y-1">
                    <Typography as="label" htmlFor="email" type="small" color="default" className="font-semibold">
                        Почта (Корпоративная)
                    </Typography>
                    <Input
                        id="email"
                        type="email"
                        placeholder="someone@example.com"
                        {...register("email", { required: "Введите почту" })}
                        className="data-[icon-placement=start]:!pl-[36px]"
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <MdOutlineEmail size={20} className="ml-2" />
                        </Input.Icon>
                    </Input>
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
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
                        {...register("password", { required: "Введите пароль" })}
                        className="data-[icon-placement=start]:!pl-[36px]"
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <TbLockPassword size={20} className="ml-2" />
                        </Input.Icon>
                    </Input>
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                {/* Кнопка входа */}
                <Button type="submit" isFullWidth={true} disabled={isLoading}>
                    {Loading ? "Вход..." : "Войти"}
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
