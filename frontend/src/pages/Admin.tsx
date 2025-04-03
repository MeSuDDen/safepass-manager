import AdminPanelCard from "../components/ui/AdminPanelCard.tsx";
import SkeletonCard from "../components/ui/SkeletonCard.tsx";
import {useAuth} from "../context/AuthContext/AuthContext.tsx";
import {useEffect, useState} from "react";
import {LuShieldCheck, LuUserPlus, LuUsers} from "react-icons/lu";
import {MdBlockFlipped} from "react-icons/md";
import api from "../utils/axiosInstance.ts";
import BarChart from "../components/ui/BarChart.tsx";
import SkeletonPlateGrid2 from "../components/ui/Skeletons/SkeletonPlateGrid2.tsx";

export default function AdminPage() {
    const {user} = useAuth();
    const [loading, setLoading] = useState(false);
    const [usersData, setUsersData] = useState(null);

    const fetchDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await api.get("users/admin/dashboard/stats", {
                withCredentials: true,
            });
            setUsersData(response.data);
            console.log(response);
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    // Функция для расчета процента изменения
    const calculateChangePercentage = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return (<>
            {loading ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SkeletonCard/>
                    <SkeletonCard/>
                    <SkeletonCard/>
                    <SkeletonCard/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonPlateGrid2/>
                </div>
                </>
            ) : (

                <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <AdminPanelCard
                            title="Total Users"
                            icon={<LuUsers size="18px" color="#212121"/>}
                            count={usersData ? usersData.totalUsersCount.length : 0}
                            description="Active accounts in the system"
                            isPositive={calculateChangePercentage(
                                usersData?.totalUsersCount.length || 0,
                                usersData?.previousTotalUsersCount.length || 0
                            ) >= 0}
                            showStatistics={{
                                changePercentage: calculateChangePercentage(
                                    usersData?.totalUsersCount.length || 0,
                                    usersData?.previousTotalUsersCount.length || 0
                                ),
                                period: "since last month",
                            }}
                        />
                        <AdminPanelCard
                            title="Admin Users"
                            icon={<LuShieldCheck size="18px" color="#212121"/>}
                            count={usersData ? usersData.adminUsersCount.length : 0}
                            description="Users with admin privileges"
                        />
                        <AdminPanelCard
                            title="Blocked Users"
                            icon={<MdBlockFlipped size="18px" color="#212121"/>}
                            count={usersData ? usersData.blockUsersCount.length : 0}
                            description="Temporarily disabled accounts"
                            isPositive={calculateChangePercentage(
                                usersData?.blockUsersCount.length || 0,
                                usersData?.previousBlockUsersCount.length || 0
                            ) >= 0}
                            showStatistics={{
                                changePercentage: calculateChangePercentage(
                                    usersData?.blockUsersCount.length || 0,
                                    usersData?.previousBlockUsersCount.length || 0
                                ),
                                period: "since last month",
                            }}
                        />
                        <AdminPanelCard
                            title="New Users"
                            icon={<LuUserPlus size="18px" color="#212121"/>}
                            count={usersData ? usersData.newUsersCount.length : 0}
                            description="Joined this month"
                            isPositive={calculateChangePercentage(
                                usersData?.newUsersCount.length || 0,
                                usersData?.previousNewUsersCount.length || 0
                            ) >= 0}
                            showStatistics={{
                                changePercentage: calculateChangePercentage(
                                    usersData?.newUsersCount.length || 0,
                                    usersData?.previousNewUsersCount.length || 0
                                ),
                                period: "since last month",
                            }}
                        />
                    </div>
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-6 pt-6"}>
                        {usersData?.monthlyNewUsers && (
                            <BarChart monthlyData={usersData.monthlyNewUsers}/>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
