import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Checkbox, Input, Popover, Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword, TbPasswordFingerprint } from "react-icons/tb";
import { IoMdWarning } from "react-icons/io";
import { VscQuestion } from "react-icons/vsc";
import logo from "../assets/images/main-logo.svg";
import axios from "axios";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [masterPassword, setMasterPassword] = useState("");
    const [confirmMasterPassword, setConfirmMasterPassword] = useState("");
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // Валидация
        if (!email || !password || !masterPassword || !confirmMasterPassword) {
            setError("Все поля обязательны для заполнения");
            return;
        }

        if (masterPassword !== confirmMasterPassword) {
            setError("Мастер-пароли не совпадают");
            return;
        }

        if (!agree) {
            setError("Вы должны согласиться с условиями и положениями");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", {
                email,
                password,
                masterPassword,
            });

            const { emailVerificationHash } = response.data;
            const verifyEmailLink = `http://localhost:3000/verify-email/${emailVerificationHash}`
            window.location.href = verifyEmailLink;
        } catch (err) {
            console.error('Ошибка регистрации', error);
        }
    };

    return (
        <div>
            <div className={"flex flex-col gap-4"}>
                <div className={"flex justify-center gap-4 items-center"}>
                    <img src={logo} alt={"SafePass"} width={"40px"} />
                    <h1 className={"font-bold text-3xl"}>SafePass</h1>
                </div>
                <h1 className={"text-center font-bold text-2xl"}>Регистрация</h1>
                {error && (
                    <Alert color={"warning"}>
                        <Alert.Icon>
                            <IoMdWarning size={20} />
                        </Alert.Icon>
                        <Alert.Content>{error}</Alert.Content>
                    </Alert>
                )}
                <div className="w-80 space-y-1">
                    <Typography
                        as="label"
                        htmlFor="email"
                        type="small"
                        color="default"
                        className="font-semibold"
                    >
                        Почта
                    </Typography>
                    <Input
                        id="email"
                        type="email"
                        placeholder="someone@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={"data-[icon-placement=start]:!pl-[36px]"}
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <MdOutlineEmail size={20} className={"ml-2"} />
                        </Input.Icon>
                    </Input>
                </div>
                <div className="w-80 space-y-1">
                    <Typography
                        as="label"
                        htmlFor="password"
                        type="small"
                        color="default"
                        className="font-semibold"
                    >
                        Пароль (Корпоративная)
                    </Typography>
                    <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={"data-[icon-placement=start]:!pl-[36px]"}
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <TbLockPassword size={20} className={"ml-2"} />
                        </Input.Icon>
                    </Input>
                </div>
                <div className="w-80 space-y-1">
                    <Typography
                        as="label"
                        htmlFor="master"
                        type="small"
                        color="default"
                        className="font-semibold flex flex-row items-center gap-1"
                    >
                        Мастер-пароль
                        <Popover>
                            <Popover.Trigger as={VscQuestion} className={"cursor-pointer"} />
                            <Popover.Content className="max-w-sm">
                                <Typography type="small" className="text-foreground">
                                    Мастер-пароль — это пароль, которым шифруются все ваши данные. Мастер-пароль никогда не передается на сервер, поэтому расшифровать ваши данные на сервере невозможно.
                                </Typography>
                                <Popover.Arrow />
                            </Popover.Content>
                        </Popover>
                    </Typography>
                    <Input
                        id="master"
                        type="password"
                        placeholder="********"
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        className={"data-[icon-placement=start]:!pl-[36px]"}
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <TbPasswordFingerprint size={20} className={"ml-2"} />
                        </Input.Icon>
                    </Input>
                </div>
                <div className="w-80 space-y-1">
                    <Typography
                        as="label"
                        htmlFor="master-confirm"
                        type="small"
                        color="default"
                        className="font-semibold"
                    >
                        Подтвердите мастер-пароль
                    </Typography>
                    <Input
                        id="master-confirm"
                        type="password"
                        placeholder="********"
                        value={confirmMasterPassword}
                        onChange={(e) => setConfirmMasterPassword(e.target.value)}
                        className={"data-[icon-placement=start]:!pl-[36px]"}
                    >
                        <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                            <TbPasswordFingerprint size={20} className={"ml-2"} />
                        </Input.Icon>
                    </Input>
                </div>
                <Alert>
                    <Alert.Icon>
                        <IoMdWarning size={20} />
                    </Alert.Icon>
                    <Alert.Content>Мы не можем восстановить мастер-пароль, поэтому будьте уверены, что вы не забудете и не потеряете мастер-пароль.</Alert.Content>
                </Alert>
            </div>
            <div className="my-4 flex items-center gap-2">
                <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
                    <Checkbox.Indicator />
                </Checkbox>
                <Typography
                    htmlFor="remember"
                    className="text-foreground"
                    type={"small"}
                >
                    Я согласен с{" "}
                    <Typography as="a" href="/privacy-policy" color="primary" type={"small"} className={"text-[#a3a3a3] hover:text-[#212121] transition-all"}>
                        Условиями и Положениями
                    </Typography>
                </Typography>
            </div>
            <Button isFullWidth={true} onClick={handleRegister} disabled={loading}>
                {loading ? "Загрузка..." : "Регистрация"}
            </Button>
            <div className={"w-full flex flex-col justify-center"}>
                <Typography
                    type="small"
                    color="default"
                    className="!mt-4 font-normal "
                >
                    Вы имеете аккаунт?{" "}
                    <Link to="/login" className="font-medium text-center text-[#a3a3a3] hover:text-[#212121] transition-all">
                        Вход
                    </Link>
                </Typography>
            </div>
        </div>
    );
}