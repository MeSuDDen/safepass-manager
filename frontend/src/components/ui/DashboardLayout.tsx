import {Button, Input, Tooltip} from "@material-tailwind/react";
import logo from "../../assets/images/main-logo.svg";
import {useAuth} from "../../context/AuthContext/AuthContext.tsx";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import {IoIosSearch} from "react-icons/io";
import {AiOutlinePlusCircle} from "react-icons/ai";
import {FaFolderPlus} from "react-icons/fa";
import {LuLayoutGrid, LuLogOut, LuUser, LuShield, LuMenu} from "react-icons/lu";
import {CiLock} from "react-icons/ci";
import {HiBars3CenterLeft} from "react-icons/hi2";

const DashboardLayout = () => {
    const {user, logout, isAdmin} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-0 left-0 z-20 m-4">
                <Button variant="outline" size="sm" onClick={toggleMenu}>
                    <LuMenu className="h-5 w-5"/>
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={`
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-10 
                    transition-all duration-300 ease-in-out
                    flex flex-col bg-white border-r border-gray-200 shadow-sm
                `}
            >

                {/* Mobile close button */}
                <div className="lg:hidden absolute top-0 right-0 m-4">
                    <Button variant="ghost" size="sm" onClick={closeMenu}>
                        <LuMenu className="h-5 w-5"/>
                    </Button>
                </div>

                {/* Logo */}
                <div className={`p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {isCollapsed ? (
                        <Link to='/'>
                            <img src={logo} alt="SafePass" width="40px"/>
                        </Link>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <Link to='/'>
                                    <img src={logo} alt="SafePass" width="40px"/>
                                </Link>
                                <h1 className="text-xl font-bold text-primary">SafePass</h1>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Безопасный менеджер паролей</p>
                        </>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 px-2 space-y-1 overflow-y-auto">
                    <div className="py-2">
                        {!isCollapsed && (
                            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Main
                            </p>
                        )}
                        <Tooltip placement="right" open={isCollapsed ? undefined : false}>
                            <Link
                                to="/dashboard"
                                className={`
                                    mt-1 group flex items-center px-3 py-2 text-sm rounded-md
                                    ${location.pathname === '/dashboard'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                onClick={closeMenu}
                            >
                                <LuLayoutGrid className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5`}/>
                                {!isCollapsed && "Dashboard"}
                            </Link>
                        </Tooltip>
                    </div>

                    <div className="py-2">
                        {!isCollapsed && (
                            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Manage
                            </p>
                        )}
                        <Tooltip placement="right" open={isCollapsed ? undefined : false}>
                            <Link
                                to="/credentials"
                                className={`
                                    mt-1 group flex items-center px-3 py-2 text-sm rounded-md
                                    ${location.pathname === '/credentials'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                onClick={closeMenu}
                            >
                                <CiLock className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5`}/>
                                {!isCollapsed && "Credentials"}
                            </Link>
                        </Tooltip>
                        <Tooltip placement="right" open={isCollapsed ? undefined : false}>
                            <Link
                                to="/folders"
                                className={`
                                    mt-1 group flex items-center px-3 py-2 text-sm rounded-md
                                    ${location.pathname === '/folders'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                onClick={closeMenu}
                            >
                                <FaFolderPlus className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5`}/>
                                {!isCollapsed && "Folders"}
                            </Link>
                        </Tooltip>
                    </div>

                    {isAdmin() && (
                        <div className="py-2">
                            {!isCollapsed && (
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Admin
                                </p>
                            )}
                            <Tooltip placement="right" open={isCollapsed ? undefined : false}>
                                <Link
                                    to="/admin-panel"
                                    className={`
                                        mt-1 group flex items-center px-3 py-2 text-sm rounded-md
                                        ${location.pathname === '/admin-panel'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    onClick={closeMenu}
                                >
                                    <LuShield className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5`}/>
                                    {!isCollapsed && "Admin Panel"}
                                </Link>
                            </Tooltip>
                        </div>
                    )}
                </div>

                {/* User profile */}
                <div className="p-4 border-t border-gray-200">
                    {isCollapsed ? (
                        <Tooltip placement="right">
                            <div className="flex justify-center">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <LuUser className="h-6 w-6 text-gray-500"/>
                                </div>
                            </div>
                        </Tooltip>
                    ) : (
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <LuUser className="h-6 w-6 text-gray-500"/>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">@{user?.profile?.username}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto cursor-pointer"
                                onClick={logout}
                                title="Sign out"
                            >
                                <LuLogOut className="h-5 w-5"/>
                            </Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div className={`flex-1 flex flex-col overflow-hidden ${isCollapsed ? 'lg:ml-0' : 'lg:ml-0'}`}>
                {/* Top bar */}
                <header className="bg-white shadow-sm z-10">

                    <div className="flex items-center justify-between p-4">
                        <div className={"flex gap-4 items-center"}>
                            {/* Collapse button */}
                            <div className="relative hidden lg:block">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg p-2"
                                    onClick={toggleSidebar}
                                >
                                    <HiBars3CenterLeft className={`h-4 w-4 transition-transform`}/>
                                </Button>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                {location.pathname === '/dashboard' && 'Обзор'}
                                {location.pathname === '/credentials' && 'Учётные данные'}
                                {location.pathname === '/folders' && 'Folders'}
                                {location.pathname === '/admin-panel' && 'Администрирование'}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <form onSubmit={handleSearch} className="relative hidden sm:block">
                                <Input
                                    type={'search'}
                                    size={'sm'}
                                    placeholder="Search credentials..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="group-hover:border-primary group-hover:ring-primary/10 group-focus:border-primary group-focus:ring-primary/10"
                                >
                                    <Input.Icon>
                                        <IoIosSearch className="h-full w-full"/>
                                    </Input.Icon>
                                </Input>
                            </form>
                            <div className="flex items-center space-x-2">
                                {location.pathname === '/credentials' && (
                                    <Button
                                        className={"cursor-pointer"}
                                        size="sm"
                                        onClick={() => navigate('/credentials/new')}
                                    >
                                        <AiOutlinePlusCircle className="h-4 w-4 mr-2"/>
                                        New Credential
                                    </Button>
                                )}
                                {location.pathname === '/folders' && (
                                    <Button
                                        className={"cursor-pointer"}
                                        size="sm"
                                        onClick={() => navigate('/folders/new')}
                                    >
                                        <FaFolderPlus className="h-4 w-4 mr-2"/>
                                        New Folder
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout;