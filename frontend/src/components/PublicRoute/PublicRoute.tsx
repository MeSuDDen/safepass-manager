import { Navigate } from "react-router-dom";
import {JSX} from "react";

interface PublicRouteProps {
    element: JSX.Element;
    isAuthenticated: boolean;
}

const PublicRoute = ({ element, isAuthenticated }: PublicRouteProps) => {
    return isAuthenticated ? <Navigate to="/dashboard" /> : element;
};

export default PublicRoute;
