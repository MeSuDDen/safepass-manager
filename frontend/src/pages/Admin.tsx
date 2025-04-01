import AdminPanelCard from "../components/ui/AdminPanelCard.tsx";
import {LuShieldCheck, LuUserPlus, LuUsers} from "react-icons/lu";
import { MdBlockFlipped } from "react-icons/md";

export default function AdminPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AdminPanelCard title={'Total Users'} icon={<LuUsers  size={"18px"} color={"#212121"}/>} isPositive={true} count={1254} description={'Active accounts in the system'} showStatistics={{changePercentage: 12.5, period: "since last month"}}/>
            <AdminPanelCard title={'Admin Users'} icon={<LuShieldCheck  size={"18px"} color={"#212121"}/>} count={8} description={'Users with admin privileges'}/>
            <AdminPanelCard title={'Blocked Users'} icon={<MdBlockFlipped  size={"18px"} color={"#212121"}/>} isPositive={false} count={24} description={'Temporarily disabled accounts'} showStatistics={{changePercentage: -4, period: "since last month"}}/>
            <AdminPanelCard title={'New Users'} icon={<LuUserPlus  size={"18px"} color={"#212121"}/>} isPositive={true} count={87} description={'Joined this month'} showStatistics={{changePercentage: 8, period: "since last month"}}/>
        </div>
    )
}