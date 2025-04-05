// pages/NotAuthorized.tsx
import {Button, Typography} from "@material-tailwind/react";
import {FaFlag} from "react-icons/fa6";

const NotAuthorized = () => {
    return (
        <div className="h-screen mx-auto grid place-items-center text-center px-8">
            <div>
                <FaFlag className="w-20 h-20 mx-auto"/>
                <Typography
                    variant="h1"
                    color="primary"
                    className="mt-10 !text-3xl !leading-snug md:!text-4xl"
                >
                    У вас нет прав для доступа к этой странице.
                </Typography>
                <Typography className="mt-8 mb-14 text-[18px] font-normal text-gray-500 mx-auto md:max-w-sm">
                    Не волнуйтесь, наша команда уже этим занимается. Попробуйте обновить страницу или вернитесь позже.
                </Typography>
                <div className={"flex justify-center items-center gap-4"}>
                    <Button as={"a"} href={"/"} variant="solid" color={"primary"} className="w-full px-4 md:w-[10rem]">
                        Главная страница
                    </Button>
                    <Button as={"a"} href={"/login"} variant="solid" color={"primary"}
                            className="w-full px-4 md:w-[10rem]">
                        Авторизация
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotAuthorized;
