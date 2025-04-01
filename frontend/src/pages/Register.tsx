import { useForm } from "react-hook-form";
import { Alert, Button, Checkbox, Input, Popover, Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword, TbPasswordFingerprint } from "react-icons/tb";
import { IoMdWarning } from "react-icons/io";
import { VscQuestion } from "react-icons/vsc";
import logo from "../assets/images/main-logo.svg";
import { useAuth } from "../context/AuthContext/AuthContext.tsx";
import {RegisterFormValues} from "../types";

export default function RegisterPage() {
    const { register: registerUser, isLoading } = useAuth(); // Remove `isLoading` if you don't need it
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>();
    const masterPassword = watch("masterPassword");

    const onSubmit = async (data: RegisterFormValues) => {
        const { ...registerData } = data;

        try {
            await registerUser(
                registerData.email,
                registerData.password,
                registerData.masterPassword,
                registerData.confirmMasterPassword,
                registerData.agree // Используем значение agree
            );
        } catch (err) {
            console.error("Ошибка регистрации", err);
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

                {(errors.email || errors.password || errors.masterPassword || errors.confirmMasterPassword) && (
                    <Alert color={"warning"}>
                        <Alert.Icon>
                            <IoMdWarning size={20} />
                        </Alert.Icon>
                        <Alert.Content>
                            {errors.email?.message || errors.password?.message || errors.masterPassword?.message || errors.confirmMasterPassword?.message}
                        </Alert.Content>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="w-80 space-y-1">
                        <Typography as="label" htmlFor="email" className="font-semibold">Почта</Typography>
                        <Input id="email" type="email" placeholder="someone@example.com" {...register("email", { required: "Введите email" })} >
                            <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                                <MdOutlineEmail size={20} className={"ml-2"} />
                            </Input.Icon>
                        </Input>
                    </div>

                    <div className="w-80 space-y-1">
                        <Typography as="label" htmlFor="password" className="font-semibold">Пароль</Typography>
                        <Input id="password" type="password" placeholder="********" {...register("password", { required: "Введите пароль", minLength: {value: 8, message: "ППароль должен быть минимум 8 символов",}, pattern: {value: /^(?=.*[A-Z])(?=.*[\W_]).{8,25}$/, message: "Пароль должен содержать хотя бы одну заглавную букву и один специальный символ",},})}>
                            <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                                <TbLockPassword size={20} className={"ml-2"} />
                            </Input.Icon>
                        </Input>
                    </div>

                    <div className="w-80 space-y-1">
                        <Typography as="label" htmlFor="masterPassword" className="font-semibold flex items-center gap-1">
                            Мастер-пароль
                            <Popover>
                                <Popover.Trigger as={VscQuestion} className="cursor-pointer" />
                                <Popover.Content className="max-w-sm">
                                    <Typography type="small" className="text-foreground">
                                        Мастер-пароль используется для шифрования данных и не передается на сервер.
                                    </Typography>
                                    <Popover.Arrow />
                                </Popover.Content>
                            </Popover>
                        </Typography>
                        <Input id="masterPassword" type="password" placeholder="********" {...register("masterPassword", { required: "Введите мастер-пароль", minLength: {value: 8, message: "ППароль должен быть минимум 8 символов",}, pattern: {value: /^(?=.*[A-Z])(?=.*[\W_]).{8,25}$/, message: "Мастер-пароль должен содержать хотя бы одну заглавную букву и один специальный символ",},})}>
                            <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                                <TbPasswordFingerprint size={20} className={"ml-2"} />
                            </Input.Icon>
                        </Input>
                    </div>

                    <div className="w-80 space-y-1">
                        <Typography as="label" htmlFor="confirmMasterPassword" className="font-semibold">Подтвердите мастер-пароль</Typography>
                        <Input className={"data-[icon-placement=start]:!pl-[36px]"} id="confirmMasterPassword" type="password" placeholder="********" {...register("confirmMasterPassword", { required: "Подтвердите мастер-пароль", minLength: {value: 8, message: "Пароль должен быть минимум 8 символов",}, pattern: {value: /^(?=.*[A-Z])(?=.*[\W_]).{8,25}$/, message: "Мастер-пароль должен содержать хотя бы одну заглавную букву и один специальный символ"}, validate: value => value === masterPassword || "Мастер-пароли не совпадают" })}>
                            <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                                <TbPasswordFingerprint size={20} className={"ml-2"} />
                            </Input.Icon>
                        </Input>
                    </div>

                    <div className="my-4 flex items-center gap-2">
                        <Checkbox {...register("agree", { required: "Вы должны согласиться с условиями" })} >
                            <Checkbox.Indicator />
                        </Checkbox>
                        <Typography className="text-foreground text-sm">
                            Я согласен с {" "}
                            <Typography as="a" href="/privacy-policy" color="primary" className="text-[#a3a3a3] hover:text-[#212121] transition-all">
                                Условиями и Положениями
                            </Typography>
                        </Typography>
                    </div>

                    <Button type="submit" isFullWidth={true} disabled={isSubmitting || isLoading}>
                        {isSubmitting || isLoading ? "Загрузка..." : "Регистрация"}
                    </Button>
                </form>

                <div className="w-full flex flex-col justify-center">
                    <Typography type="small" color="default" className="!mt-4 font-normal">
                        Уже есть аккаунт? {" "}
                        <Link to="/login" className="font-medium text-center text-[#a3a3a3] hover:text-[#212121] transition-all">
                            Вход
                        </Link>
                    </Typography>
                </div>
            </div>
        </div>
    );
}
