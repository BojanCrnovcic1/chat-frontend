import axios from "axios";
import React, { useState } from "react";
import { ApiConfig } from "../config/ApiConfig";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthProviderProps {
    children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [onlineStatus, setOnlineStatus] = useState<boolean | null>(false);
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(ApiConfig.API_URL + 'auth/user/login', {
                email: email,
                password: password,
            });
            const { token } = response.data;
            setToken(token);

            setOnlineStatus(onlineStatus);
            localStorage.setItem('token', token);
            console.log('online status: ', onlineStatus)
            console.log('login user: ', response.data);
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Login failed. Please check your credentials.');
        }
    };

    const logout = () => {
        setToken(null);
        setOnlineStatus(false);
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, onlineStatus, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
