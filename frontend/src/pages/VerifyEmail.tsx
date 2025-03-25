import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {Alert, Button, Input, Typography} from "@material-tailwind/react";
import {IoMdWarning} from "react-icons/io";
import logo from "../assets/images/main-logo.svg";

const VerifyEmail: React.FC = () => {
    const [verifyCode, setVerifyCode] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();  // Используем useNavigate для перенаправления

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVerifyCode(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken'); // Получаем токен из localStorage
            const storedEmail = localStorage.getItem("userEmail");

            if (!token) {
                setError('Токен не найден. Пожалуйста, войдите в систему.');
                setIsLoading(false);
                return;
            }

            const response = await axios.post(
                'http://localhost:3000/auth/verify-email',
                {
                    email: storedEmail, // Замените на email пользователя
                    verifyCode,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Добавляем токен в заголовок запроса
                    },
                }
            );

            if (response.data.message === 'Email verified successfully') {
                navigate('/dashboard'); // Перенаправляем на страницу логина после успешного подтверждения
            }
        } catch (err) {
            setError('Неверный код подтверждения');
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

            <h1 className="text-center font-bold text-2xl">Подтвержение почты</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
                <div>
                    <Typography as="label" htmlFor="verifyCode" type="small" color="default" className="font-semibold">
                        Введите код подтверждения:
                    </Typography>
                    <Input
                        id="verifyCode"
                        type="text"
                        placeholder="******"
                        value={verifyCode}
                        onChange={handleInputChange}
                        required
                        maxLength={6}
                        className="data-[icon-placement=start]:!pl-[36px]"
                    />
                </div>
                {error && (
                    <Alert color={"warning"}>
                        <Alert.Icon>
                            <IoMdWarning size={20} />
                        </Alert.Icon>
                        <Alert.Content>{error}</Alert.Content>
                    </Alert>
                )}
                <Button type="submit" isFullWidth={true} disabled={isLoading}>
                    {isLoading ? 'Подтверждение...' : 'Подтвердить'}
                </Button>
            </form>
        </div>
    );
};

export default VerifyEmail;
