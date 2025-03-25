import { Outlet } from 'react-router-dom';

export default function AuthLayout() {

    return (
        <div className={"flex justify-center w-full flex-col h-screen items-center"}>
            <div className={"border border-gray-300 rounded-xl px-24 py-14 h-fit max-w-[514px]"}>
                <Outlet/>
            </div>
            <p className={"mt-10"}>© SafePass 2025</p>
        </div>
    )
}