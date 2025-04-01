import {Routes, Route, Navigate} from "react-router-dom";
import "./index.css";
import AuthLayout from "./components/Auth/AuthLayout/AuthLayout.tsx";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFound.tsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicy.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import Credentials from "./pages/Credentials.tsx";
import Folders from "./pages/Folders.tsx";
import Admin from "./pages/Admin.tsx";

import {AuthProvider} from "./context/AuthContext/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.tsx";
import {Toaster} from "react-hot-toast";
import DashboardLayout from "./components/ui/DashboardLayout.tsx";


function App() {
    return (
        <>
            <Toaster position="top-center" toastOptions={{duration: 3000, removeDelay: 1000}}></Toaster>
            <AuthProvider>
                <Routes>

                    <Route path="/" element={<Navigate to="/login" replace/>}/>

                    {/* Авторизация */}
                    <Route element={<AuthLayout/>}>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/reset" element={<Reset/>}/>
                        <Route path="/verify-email/:hash" element={<VerifyEmail/>}/>
                    </Route>

                    {/* Защищённый маршрут */}
                    <Route element={<DashboardLayout/>}>
                        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                        <Route path="/credentials/*" element={<ProtectedRoute><Credentials/></ProtectedRoute>}/>
                        <Route path="/folders/*" element={<ProtectedRoute><Folders/></ProtectedRoute>}/>
                        <Route path="/admin-panel/*" element={<ProtectedRoute><Admin/></ProtectedRoute>}/>
                    </Route>
                    {/* Политика конфиденциальности */}
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage/>}/>

                    {/* Ошибка 404 */}
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </AuthProvider>
        </>
    );
}

export default App;
