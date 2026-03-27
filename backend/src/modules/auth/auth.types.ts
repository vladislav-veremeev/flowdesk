export type RegisterBody = {
    username: string;
    password: string;
};

export type LoginBody = {
    username: string;
    password: string;
};

export type UpdateProfileBody = {
    username: string;
    currentPassword?: string;
    newPassword?: string;
};

export type UserRow = {
    id: string;
    username: string;
    password_hash: string;
    created_at: string;
};

export type SafeUser = {
    id: string;
    username: string;
    createdAt: string;
};
