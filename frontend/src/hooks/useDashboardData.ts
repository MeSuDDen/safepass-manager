import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext/AuthContext.tsx";
import api from "../utils/axiosInstance.ts";
import {Folder} from "../types";

export const useDashboardData = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [recentCredentials, setRecentCredentials] = useState<Credential[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [popularTags, setPopularTags] = useState<string[]>([]);

    const fetchDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [credentials, allFolders, allTags] = await Promise.all([
                api.get(`/credentials/${user.id}`).then(res => res.data),
                api.get(`/folders/${user.id}`).then(res => res.data),
                api.get(`/tags/${user.id}`).then(res => res.data),
            ]);

            // Подсчет популярных тегов
            const tagCounts = allTags.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const sortedTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag]) => tag)
                .slice(0, 6);

            setFolders(allFolders);
            setRecentCredentials(credentials);
            setPopularTags(sortedTags);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    return { loading, recentCredentials, folders, popularTags };
};
