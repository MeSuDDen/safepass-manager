import {Button, Card, CardHeader} from "@material-tailwind/react";
import {useAuth} from "../context/AuthContext/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {Spinner} from "@material-tailwind/react";
import {LuCalendar, LuTag} from "react-icons/lu";
import {HiOutlineFolderOpen, HiOutlineLockClosed, HiOutlineMagnifyingGlass} from "react-icons/hi2";
import {useDashboardData} from "../hooks/useDashboardData.ts";
import DashboardCard from "../components/ui/DashboardCard.tsx";

export default function DashboardPage() {
    const {user, isLoading: authLoading} = useAuth();
    const navigate = useNavigate();
    const {loading, recentCredentials, folders, popularTags} = useDashboardData();

    if (authLoading || loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner className="h-12 w-12"/>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-6">
                <h2 className="text-2xl font-bold text-gray-800">Добро пожаловать, {user?.profile?.firstName || 'Гость'} {user?.profile?.middleName || null}!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard
                        title={"Credentials"}
                        icon={<HiOutlineLockClosed size={"26px"} color={"#2563eb"}/>}
                        count={recentCredentials.length}
                        description={"Securely stored credentials"}
                        buttonText={"View All"}
                        buttonLink={'/credentials'}>
                    </DashboardCard>

                    <DashboardCard
                        title={"Folders"}
                        icon={<HiOutlineFolderOpen size={"26px"} color={"#2563eb"}/>}
                        count={folders.length}
                        description={"Organized credential folders"}
                        buttonText={"Manage Folders"}
                        buttonLink={'/folders'}>
                    </DashboardCard>



                    <DashboardCard
                        title={"Quick Search"}
                        icon={<HiOutlineMagnifyingGlass size={"26px"} color={"#2563eb"}/>}
                        buttonText={"Advanced Search"}
                        buttonLink={'/search'}
                        extraContent={
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((tag) => (
                                <Button
                                    key={tag}
                                    variant="outline"
                                    size="md"
                                    onClick={() => navigate(`/credentials?tags=${tag}`)}
                                    className="flex items-center cursor-pointer border-secondary"
                                >
                                    <LuTag className="h-3 w-3 mr-1" />
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    }>
                    </DashboardCard>

                </div>

                <Card>
                    <CardHeader className={"pb-2 pt-6 px-6 m-0"}>
                        <h1 className="flex items-center font-bold text-xl">
                            <LuCalendar className="h-5 w-5 mr-2" color={"#2563eb"}/>
                            Recent Credentials
                        </h1>
                        <div className={"description"}>
                            Your most recently updated credentials
                        </div>
                    </CardHeader>
                    <div className={"px-6 pb-6"}>
                        {recentCredentials.length > 0 ? (
                            <div className="space-y-4">
                                {recentCredentials.map(cred => (
                                    <div
                                        key={cred.id}
                                        className="flex items-center justify-between p-3 bg-white border border-secondary rounded-md hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate(`/credentials/${cred.id}`)}
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                                <HiOutlineLockClosed className="h-5 w-5" color={"#2563eb"}/>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800">{cred.title}</h3>
                                                <p className="text-sm text-gray-500">{cred.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-2 max-w-[30%]">
                                            {(cred.Tag ?? []).slice(0, 4).map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                                                >
                          {tag.name}
                        </span>
                                            ))}
                                            {cred.userCredentials && (
                                                <span
                                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          +{cred.userCredentials}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6">
                                <p className="text-gray-500">No credentials found</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => navigate('/credentials/new')}
                                >
                                    Add Your First Credential
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </>
    );
}
