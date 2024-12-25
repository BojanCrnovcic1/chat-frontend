import { createContext, useContext } from "react";
import { User } from "../types/User";
import { Admin } from "../types/Admin";

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    admin: Admin | null;
    setUser: (user: User | null) => void;
    setAdmin: (admin: Admin | null) => void;
    token: string | null;
    role: string | null;
    onlineStatus: boolean | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
