import axios from "axios";
import React, { useState, useEffect } from "react";
import { ApiConfig } from "../config/ApiConfig";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { User } from "../types/User";

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [onlineStatus, setOnlineStatus] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            axios.get(ApiConfig.API_URL + 'auth/user/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(response => {
                const fetchedUser = response.data;
                console.log('Fetched user:', fetchedUser);
                setUser({ ...fetchedUser });
                setOnlineStatus(true); 
            })
            .catch(() => {
                logout();
            });
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(ApiConfig.API_URL + 'auth/user/login', {
                email,
                password,
            });

            const { token, user } = response.data;
            setToken(token);
            localStorage.setItem('token', token);

            setUser({ ...user });
            setOnlineStatus(onlineStatus);

            console.log('token: ', token);
            console.log('user: ', user);
            console.log('online status: ', onlineStatus);

            await axios.post(ApiConfig.API_URL + 'auth/user/online-status', { isOnline: true }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Login failed. Please check your credentials.');
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post(ApiConfig.API_URL + 'auth/user/online-status', { isOnline: false }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Failed to update online status:', error);
        }

        setUser(null);
        setToken(null);
        setOnlineStatus(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn: !!user, user, setUser, token, onlineStatus, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
