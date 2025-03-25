import { Navigate } from "react-router-dom";

interface PublicRouteProps {
    element: React.ReactElement;
    isAuthenticated: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element, isAuthenticated }) => {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

export default PublicRoute;
