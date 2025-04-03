import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.tsx';
import {Spinner} from "@material-tailwind/react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                           requireAdmin = false
                                                       }) => {
    const { user, isLoading, isAdmin } = useAuth();
    const location = useLocation();

    // Показываем индикатор загрузки, пока данные о пользователе не получены
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner className="h-12 w-12"/>
            </div>
        );
    }

    // Если нет пользователя, редиректим на страницу логина
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если требуется админский доступ, но пользователь не администратор, редиректим на страницу с ошибкой прав
    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/not-authorized" replace />;
    }

    // Если все проверки пройдены, рендерим дочерние элементы
    return <>{children}</>;
};

export default ProtectedRoute;
