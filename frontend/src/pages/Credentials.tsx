import React, {useState, useEffect, useMemo} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    Button,
    Input,
    Card,
    Spinner,
    CardHeader,
    Select,
    SelectTrigger,
    Badge,
    IconButton
} from "@material-tailwind/react";
import {ICredentials, Folder} from '@/types';
import {useAuth} from "../context/AuthContext/AuthContext.tsx";
import {LuLock, LuCopy, LuEye, LuEyeOff, LuSearch, LuFilter, LuTag, LuX} from 'react-icons/lu';
import {toast} from "react-hot-toast";
import api from "@/utils/axiosInstance.ts";

const CredentialsPage = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [credentials, setCredentials] = useState<ICredentials[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedFolder, setSelectedFolder] = useState(searchParams.get('folder') || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(
        searchParams.get('tags') ? searchParams.get('tags')!.split(',') : []
    );
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [dataCredentials, dataFolders, dataTags] = await Promise.all([
                    api.get(`/credentials/${user.id}`).then(res => res.data),
                    api.get(`/folders/${user.id}`).then(res => res.data),
                    api.get(`/tags/all/${user.id}`).then(res => res.data),
                ]);
                setCredentials(dataCredentials);
                setFolders(dataFolders);
                setAvailableTags(dataTags)
                console.log(dataCredentials)
                console.log(dataFolders)
                console.log(dataTags)
            } catch (error) {
                console.error("Ошибка загрузки данных", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        const params = new URLSearchParams();

        if (searchQuery) params.set('q', searchQuery);
        if (selectedFolder) params.set('folder', selectedFolder);
        if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));

        setSearchParams(params);
    }, [searchQuery, selectedFolder, selectedTags, setSearchParams]);


    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard`);
    };

    const handleTagSelect = (tag: { id: string, name: string }) => {
        if (selectedTags.includes(tag.name)) {
            setSelectedTags(selectedTags.filter(t => t !== tag.name));
        } else {
            setSelectedTags([...selectedTags, tag.name]);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedFolder('');
        setSelectedTags([]);
        setSearchParams(new URLSearchParams());
    };

    const filteredCredentials = useMemo(() => {
        return credentials.filter(cred => {
            const query = searchQuery.toLowerCase();

            const matchesSearch = searchQuery
                ? (
                    cred.title?.toLowerCase().includes(query) ||
                    cred.username?.toLowerCase().includes(query) ||
                    cred.url?.toLowerCase().includes(query) ||
                    cred.description?.toLowerCase().includes(query)
                )
                : true;

            const matchesFolder = selectedFolder ? cred.folderId === selectedFolder : true;

            const matchesTags = selectedTags.length > 0
                ? selectedTags.every(tag =>
                    cred.Tag?.some(t => t.name === tag)  // Сравниваем только tag.name
                )
                : true;

            return matchesSearch && matchesFolder && matchesTags;
        });
    }, [credentials, searchQuery, selectedFolder, selectedTags]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Credentials</h2>
                <Button onClick={() => navigate('/credentials/new')}>
                    Add New Credential
                </Button>
            </div>

            <Card>
                <CardHeader className={"p-6 m-0"}>
                    <h1 className="text-lg flex items-center font-bold">
                        <LuFilter color={"#3972ed"} className="h-5 w-5 mr-2 text-primary"/>
                        Search & Filters
                    </h1>
                    <div className={"mt-2 text-sm text-gray-500"}>
                        Find credentials by name, folder, or tags
                    </div>
                </CardHeader>
                <div className={"px-6 pb-6"}>
                    <div className="space-y-4">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Input
                                type="search"
                                value={searchQuery}
                                placeholder="Search by title, username, URL, or description..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="data-[icon-placement=start]:!pl-[36px]"
                            >
                                <Input.Icon className="data-[placement=start]:left-px w-full bg-white w-fit">
                                    <LuSearch size={20} className="ml-2"/>
                                </Input.Icon>
                            </Input>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Folder</label>
                                <Select
                                    value={selectedFolder || ""}
                                    onValueChange={(val) => setSelectedFolder(val)}
                                >
                                    <SelectTrigger placeholder="All Folders" />
                                    <Select.List>
                                        <Select.Option value="">All Folders</Select.Option>
                                        {folders.map(folder => (
                                            <Select.Option key={folder.id} value={folder.id}>
                                                {folder.name}
                                            </Select.Option>
                                        ))}
                                    </Select.List>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Tags</label>
                                <div className="flex flex-wrap gap-2 items-center h-[38px]">
                                    {loading ? (
                                        <span className={"text-sm text-gray-500"}>Loading tags...</span>
                                    ) : availableTags && availableTags.length > 0 ? (
                                        availableTags.map((tag, id) => (
                                                tag ? (
                                                    <Badge
                                                        key={id}
                                                        className="cursor-pointer"
                                                        onClick={() => handleTagSelect(tag)}>
                                                        <Badge.Content>
                                                            <IconButton
                                                                color={selectedTags.includes(tag.name) ? "primary" : "#fff"} // Сравниваем tag.name
                                                                size={"sm"}
                                                                className={"border font-semibold min-h-5 text-[12px] rounded-full px-2 cursor-pointer"}
                                                            >
                                                                {tag.name}
                                                            </IconButton>

                                                        </Badge.Content>
                                                    </Badge>
                                                ) : null
                                            )
                                        )
                                    ) : (<span className="text-sm text-gray-500">No tags available</span>)
                                    }
                                </div>
                            </div>
                        </div>

                        {(searchQuery || selectedFolder || selectedTags.length > 0) && (
                            <div className="flex justify-between items-center pt-2">
                                <div className="text-sm text-gray-500">
                                    Found {credentials.length} credential(s)
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex items-center text-gray-500"
                                >
                                    <LuX className="h-4 w-4 mr-1"/>
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                {loading ? (
                        <div className="flex justify-center items-center p-6">
                            <span className="text-gray-500">Loading...</span>
                            {/* Можно добавить иконку загрузки или анимацию */}
                        </div>
                    ) : filteredCredentials.length > 0 ? (
                    filteredCredentials.map((cred) => (
                        <Card key={cred.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="p-6 pb-2 m-0">
                                <div className="flex justify-between">
                                    <h3 className="text-lg flex items-center font-bold">
                                        <LuLock className="h-5 w-5 mr-2 text-primary" color={"#3972ed"}/>
                                        <span
                                            className="cursor-pointer hover:text-[#3972ed] transition-colors"
                                            onClick={() => navigate(`/credentials/${cred.id}`)}
                                        >
                        {cred.title}
                      </span>
                                    </h3>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            onClick={() => navigate(`/credentials/${cred.id}`)}
                                            title="Edit"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                 strokeLinecap="round" strokeLinejoin="round">
                                                <path
                                                    d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                                <div className={"mt-2"}>
                                    {cred.url && (
                                        <a
                                            href={cred.url.startsWith('http') ? cred.url : `https://${cred.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline text-sm"
                                        >
                                            {cred.url}
                                        </a>
                                    )}
                                </div>
                            </CardHeader>
                            <div className="pb-4 px-6">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-1">
                                        {cred.Tag && cred.Tag.length > 0 ? (
                                            cred.Tag.map((tag, id) => (
                                                tag.name ? (
                                                    <Badge key={id} color="primary" className="flex items-center">
                                                        <LuTag className="h-3 w-3 mr-1"/>
                                                        {tag.name}
                                                    </Badge>
                                                ) : null
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">No tags available</span>
                                        )}
                                    </div>


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <div>
                                                <span className="text-xs text-gray-500 block">Username</span>
                                                <span className="font-medium">{cred.username}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(cred.username, 'Username')}
                                                title="Copy username"
                                            >
                                                <LuCopy className="h-4 w-4"/>
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <div>
                                                <span className="text-xs text-gray-500 block">Password</span>
                                                <span className="font-medium">
                            {visiblePasswords[cred.id] ? cred.password : '••••••••'}
                          </span>
                                            </div>
                                            <div className="flex">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => togglePasswordVisibility(cred.id)}
                                                    title={visiblePasswords[cred.id] ? 'Hide password' : 'Show password'}
                                                >
                                                    {visiblePasswords[cred.id] ? (
                                                        <LuEyeOff className="h-4 w-4"/>
                                                    ) : (
                                                        <LuEye className="h-4 w-4"/>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(cred.password, 'Password')}
                                                    title="Copy password"
                                                    aria-label="Copy password"
                                                >
                                                    <LuCopy className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {cred.description && (
                                        <div className="mt-3 text-sm text-gray-600">
                                            <p className="line-clamp-2">{cred.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <div className="text-center p-6">
                            <p className="text-gray-500 mb-4">No credentials found</p>
                            <Button onClick={() => navigate('/credentials/new')}>
                                Add Your First Credential
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CredentialsPage;
