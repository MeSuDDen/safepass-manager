import { Navigate } from "react-router-dom";
import {JSX} from "react";

interface ProtectedRouteProps {
    element: JSX.Element;
    isAuthenticated: boolean;
}

const ProtectedRoute = ({ element, isAuthenticated }: ProtectedRouteProps) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
