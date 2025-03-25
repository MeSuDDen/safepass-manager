import logo from "../assets/images/main-logo.svg";
import {Alert, Button, Input, Typography} from "@material-tailwind/react";
import {MdOutlineEmail} from "react-icons/md";
import {Link} from "react-router-dom";

export default function ResetPage() {
    return (
        <>
            <div>
                <div className={"flex flex-col gap-4"}>
                    <div className={"flex justify-center gap-4 items-center"}>
                        <img src={logo} alt={"SafePass"} width={"40px"}/>
                        <h1 className={"font-bold text-3xl"}>SafePass</h1>
                    </div>
                    <h1 className={"text-center font-bold text-2xl"}>Восстановить пароль</h1>
                    <div className="w-80 space-y-1">
                        <Alert>
                            <Alert.Content>Введите электронную почту, чтобы получить инструкции по восстановлению пароля</Alert.Content>
                        </Alert>
                        <Typography
                            as="label"
                            htmlFor="email"
                            type="small"
                            color="default"
                            className="font-semibold"
                        >
                            Почта
                        </Typography>
                        <Input id="email" type="email" placeholder="someone@example.com"
                               className={"data-[icon-placement=start]:!pl-[36px]"}>
                            <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                                <MdOutlineEmail size={20} className={"ml-2"}/>
                            </Input.Icon>
                        </Input>
                    </div>
                </div>
                <div className={"mt-4"}>
                    <Button isFullWidth={true}><Link to={'/register'}>Восстановить</Link></Button>
                </div>
                <div className={"w-full flex flex-col justify-center"}>
                    <Typography
                        type="small"
                        color="default"
                        className="!mt-4 font-normal "
                    >
                        Только что вспомнили свой пароль?{" "}
                        <Link to="/login" className="font-medium text-center text-[#a3a3a3] hover:text-[#212121] transition-all">
                            Вход
                        </Link>
                    </Typography>
                </div>
                <div className="!mt-4 flex justify-end">

                </div>
            </div>
        </>
    )
}