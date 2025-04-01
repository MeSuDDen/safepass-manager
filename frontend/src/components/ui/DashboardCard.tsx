import {Button, Card} from "@material-tailwind/react";
import {ReactNode} from "react";
import {useNavigate} from "react-router-dom";

interface DashboardCardProps {
    title: string;
    icon: ReactNode;
    count?: number;
    description?: string;
    buttonText: string;
    buttonLink: string;
    extraContent?: ReactNode; // <- Добавляем проп для любого JSX
}

export default function DashboardCard({
                                          title,
                                          icon,
                                          count,
                                          description,
                                          buttonText,
                                          buttonLink,
                                          extraContent, // <- Принимаем JSX-контент
                                      }: DashboardCardProps) {
    const navigate = useNavigate();

    return (
        <Card>
            <div className="pb-2 pt-6 px-6 m-0 flex items-center gap-2">
                {icon}
                <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <div className="px-6 pb-6">
                {count !== undefined && (
                    <div className="text-3xl font-bold text-[#2563eb] mb-2">
                        {count}
                    </div>
                )}
                {description && <div className="text-sm text-gray-500">{description}</div>}

                {/* Вставляем дополнительный контент, если он есть */}
                {extraContent}

                <Button
                    size="md"
                    variant="outline"
                    className="w-full mt-4 cursor-pointer border-secondary"
                    onClick={() => navigate(buttonLink)}
                >
                    {buttonText}
                </Button>
            </div>
        </Card>
    );
}
