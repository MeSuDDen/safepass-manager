import { Card, CardHeader } from "@material-tailwind/react";
import { ReactNode } from "react";

interface AdminCardProps {
    title: string;
    icon: ReactNode;
    count?: number | string;
    description?: string;
    isPositive?: boolean;
    showStatistics?: {
        changePercentage: number;
        period?: string;
    };
}

export default function AdminPanelCard({
                                           title,
                                           icon,
                                           count,
                                           description,
                                           isPositive,
                                           showStatistics,
                                       }: AdminCardProps) {
    const borderColorClass =
        isPositive === true ? 'border-l-green-400' :
            isPositive === false ? 'border-l-red-400' :
                'border-l-gray-200';

    return (
        <Card className={`border-l-4 ${borderColorClass} rounded-lg`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 bg">
                <h1 className="text-sm font-medium">{title}</h1>
                <div className="h-8 w-8 rounded-md bg-gray-200 flex items-center justify-center">
                    {icon}
                </div>
            </CardHeader>

            <div className="px-6 pb-6">
                <div className="text-2xl font-bold">{count}</div>
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}

                {showStatistics?.changePercentage !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">
              <span
                  className={`font-semibold ${
                      showStatistics.changePercentage > 0
                          ? 'text-green-500'
                          : 'text-red-500'
                  }`}
              >
                {showStatistics.changePercentage > 0 ? '+' : ''}
                  {showStatistics.changePercentage}%
              </span>
                {` since ${showStatistics.period || 'last month'}`}
            </span>
                    </div>
                )}
            </div>
        </Card>
    );
}