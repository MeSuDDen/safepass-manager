import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {Alert, Button, Input, Typography} from '@material-tailwind/react';
import {IoMdWarning} from 'react-icons/io';
import logo from '../assets/images/main-logo.svg';

const VerifyEmail: React.FC = () => {
    const {hash} = useParams<{ hash: string }>(); // Получаем hash из URL
    const [code, setCode] = useState<string>(''); // Добавляем состояние для verifyCode
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyHash = async () => {
            try {
                setIsLoading(true);

                if (!hash) {
                    setError('Ссылка повреждена. Проверьте правильность ссылки в письме.');
                    return;
                }

                await axios.get(`http://localhost:5000/api/auth/verify-email/${hash}`);

            } catch (err) {
                let errorMessage = 'Некорректная ссылка';
                let instructions = '';

                if (axios.isAxiosError(err)) {
                    // Обработка разных статус-кодов от сервера
                    switch (err.response?.status) {
                        case 404:
                            errorMessage = 'Ссылка устарела или не существует';
                            instructions = 'Запросите новое письмо подтверждения через личный кабинет';
                            break;
                        case 410:
                            errorMessage = 'Ссылка уже использована';
                            instructions = 'Вы можете войти в систему с вашими учетными данными';
                            break;
                        case 400:
                            errorMessage = 'Неверный формат ссылки';
                            instructions = 'Скопируйте ссылку из письма полностью';
                            break;
                        default:
                            instructions = 'Попробуйте повторить позже или обратитесь в поддержку';
                    }
                }

                setError(`${errorMessage}. ${instructions}`);

            } finally {
                setIsLoading(false);
            }
        };

        verifyHash();
    }, [hash]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `http://localhost:5000/api/auth/verify-email/${hash}`,
                { code },
                { withCredentials: true }
            );

            // Лучше проверять статус ответа, а не текст сообщения
            if (response.status === 200) {
                // Сохраняем данные авторизации, если они приходят с сервера
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            let errorMessage = 'Ошибка подтверждения email';

            if (axios.isAxiosError(err)) {
                // Обработка ошибок Axios
                if (err.response) {
                    // Сервер ответил с ошибкой 4xx/5xx
                    errorMessage = err.response.data.message || 'Неверный код подтверждения';
                } else if (err.request) {
                    // Запрос был сделан, но ответа не получено
                    errorMessage = 'Нет ответа от сервера';
                }
            } else {
                // Другие ошибки
                errorMessage = 'Неизвестная ошибка';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="flex justify-center gap-4 items-center">
                <img src={logo} alt="SafePass" width="40px"/>
                <h1 className="font-bold text-3xl">SafePass</h1>
            </div>

            <h1 className="text-center font-bold text-2xl">Подтверждение почты</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">

                {!error && (
                    <div>
                        <Typography as="label" htmlFor="verifyCode" type="small" color="default" className="font-semibold">
                            Введите код подтверждения:
                        </Typography>
                            <Input
                                id="verifyCode"
                                type="text"
                                placeholder="******"
                                value={code}
                                onChange={handleInputChange}
                                required
                                maxLength={6}
                                className="data-[icon-placement=start]:!pl-[36px]"
                            />
                    </div>
                )}

                {error && (
                    <Alert color="warning">
                        <Alert.Icon>
                            <IoMdWarning size={20}/>
                        </Alert.Icon>
                        <Alert.Content>{error}</Alert.Content>
                    </Alert>
                )}
                {!error && (
                    <Button type="submit" isFullWidth={true} disabled={isLoading}>
                        {isLoading ? 'Подтверждение...' : 'Подтвердить'}
                    </Button>
                )}
            </form>
        </div>
    );
};

export default VerifyEmail;