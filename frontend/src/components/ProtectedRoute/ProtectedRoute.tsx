import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.tsx';

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
            <div className="min-h-screen flex items-center justify-center">
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    // Если нет пользователя, редиректим на страницу логина
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если требуется админский доступ, но пользователь не администратор, редиректим на dashboard
    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/dashboard" replace />;
    }

    // Если все проверки пройдены, рендерим дочерние элементы
    return <>{children}</>;
};

export default ProtectedRoute;
