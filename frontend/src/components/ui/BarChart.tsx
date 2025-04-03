import React, { useMemo } from "react";
import { Card, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts"; // Импортируем напрямую
import { IoIosSearch } from "react-icons/io";

// Типизация для данных, получаемых через пропсы
interface MonthlyUserData {
    month: string;
    count: number;
}

interface BarChartProps {
    monthlyData: MonthlyUserData[];
}

const rgbToHex = (rgb: string[]): string => {
    return (
        "#" +
        rgb
            .map((x) => {
                const hex = parseInt(x, 10).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
};

const BarChart: React.FC<BarChartProps> = ({ monthlyData }) => {
    const chartData = monthlyData.map((item) => item.count);
    const months = monthlyData.map((item) => item.month);

    const vars = window.getComputedStyle(document.documentElement);
    const chartColor = rgbToHex(vars.getPropertyValue("--color-primary").split(" "));
    const textColor = rgbToHex(vars.getPropertyValue("--color-foreground").split(" "));
    const lineColor = rgbToHex(vars.getPropertyValue("--color-surface").split(" "));

    const chartConfig = useMemo(
        () => ({
            type: "bar",
            height: 240,
            series: [
                {
                    name: "Новые пользователи",
                    data: chartData,
                },
            ],
            options: {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                colors: [chartColor],
                plotOptions: {
                    bar: {
                        columnWidth: "24%",
                        borderRadius: 2,
                    },
                },
                xaxis: {
                    categories: months,
                    labels: {
                        style: {
                            colors: textColor,
                            fontSize: "12px",
                            fontFamily: "inherit",
                            fontWeight: 400,
                        },
                    },
                },
                yaxis: {
                    labels: {
                        style: {
                            colors: textColor,
                            fontSize: "12px",
                            fontFamily: "inherit",
                            fontWeight: 400,
                        },
                    },
                },
                grid: {
                    show: true,
                    borderColor: lineColor,
                    strokeDashArray: 5,
                },
                tooltip: {
                    theme: "dark",
                },
            },
        }),
        [chartData, months, chartColor, textColor, lineColor]
    );

    return (
        <Card>
            <Card.Header className="m-0 flex flex-wrap items-center gap-4 p-4">
                <Card
                    color="primary"
                    className="grid h-16 w-16 shrink-0 place-items-center rounded-md text-primary-foreground md:h-20 md:w-20"
                >
                    <IoIosSearch className="h-6 w-6 md:h-8 md:w-8" />
                </Card>
                <div>
                    <Typography type="h6">Новые пользователи</Typography>
                    <Typography className="mt-1 max-w-sm text-foreground">
                        Количество новых пользователей за последние 12 месяцев.
                    </Typography>
                </div>
            </Card.Header>
            <Card.Body>
                <Chart {...chartConfig} />
            </Card.Body>
        </Card>
    );
};

export default BarChart;
