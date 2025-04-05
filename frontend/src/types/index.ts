export interface RegisterFormValues {
    email: string;
    password: string;
    masterPassword: string;
    confirmMasterPassword: string; // make this optional
    agree: boolean;
}

export interface LoginFormValues {
    email: string;
    password: string;
}

export interface Folder {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    username: string;
    firstName: string;
    lastName: string;
    middleName: string;
    phoneNumber: string;
    position: string;
    birthDate: string;
}

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string;
    role: string;
    profile?: UserProfile; // profile может быть undefined
}

export interface ICredentials {
    id: number;
    name: string;
    login: string;
    password: string;
    folder: string;
    tags: string[];
}
