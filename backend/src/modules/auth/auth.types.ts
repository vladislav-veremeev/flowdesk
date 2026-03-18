export type RegisterBody = {
    username: string;
    email: string;
    password: string;
};

export type LoginBody = {
    email: string;
    password: string;
};

export type UpdateProfileBody = {
    username: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
};

export type UserRow = {
    id: string;
    username: string;
    email: string;
    password_hash: string;
};

export type SafeUser = {
    id: string;
    username: string;
    email: string;
};