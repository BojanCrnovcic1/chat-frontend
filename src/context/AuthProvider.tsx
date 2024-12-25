import React, { useState, useEffect } from "react";
import axios from "axios";
import { ApiConfig } from "../config/ApiConfig";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { User } from "../types/User";
import { Admin } from "../types/Admin";

const apiClient = axios.create({
    baseURL: ApiConfig.API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && error.config && !error.config._retry) {
            error.config._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    const response = await axios.post(`${ApiConfig.API_URL}auth/refresh`, { refreshToken });
                    const { accessToken } = response.data;

                    localStorage.setItem("accessToken", accessToken);
                    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

                    return apiClient(error.config);
                } catch (refreshError) {
                    if (axios.isAxiosError(refreshError)) {
                        if (refreshError.response?.status === 401) {
                            console.warn("Istekao refresh token u intercepteru, vraćanje na login...");
                            window.dispatchEvent(new Event("logout"));
                        } else {
                            console.error(
                                "Greška prilikom osvežavanja tokena:",
                                refreshError.response?.data?.message || refreshError.message
                            );
                        }
                    } else {
                        console.error("Nepoznata greška prilikom osvežavanja tokena u interseptoru:", refreshError);
                    }
                }
            } else {
                console.warn("Nema refresh tokena, vraćanje na login...");
                window.dispatchEvent(new Event("logout"));
            }
        }
        return Promise.reject(error);
    }
);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken"));
    const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
    const [onlineStatus, setOnlineStatus] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = () => {
            logout();
        };
        window.addEventListener("logout", handleLogout);
        return () => {
            window.removeEventListener("logout", handleLogout);
        };
    }, []);

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            const refreshToken = localStorage.getItem("refreshToken");
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken && refreshToken) {
                await refreshAccessToken();
            } else if (!accessToken) {
                logout();
            }
        };

        checkAndRefreshToken();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (token) {
                refreshAccessToken();
            } else {
                logout();
            }
        }, 30 * 60 * 1000);

        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        if (!token) return;
    
        const fetchDetails = async () => {
            if (role === "admin") {
                await fetchAdminDetails();
            } else {
                await fetchUserDetails();
            }
        };
    
        fetchDetails();
    }, [token, role]);
    
    const fetchUserDetails = async () => {
        try {
            const response = await apiClient.get("auth/user/me");
            const fetchedUser = response.data;
            setUser(fetchedUser);
            setRole(fetchedUser.role);
            setOnlineStatus(fetchedUser.onlineStatus);

            updateOnlineStatus(true);
        } catch (error: any) {
            console.error("Greška prilikom učitavanja podataka korisnika:", error.response?.data?.message || error.message);
            logout();
        }
    }; 

    const fetchAdminDetails = async () => {
        try {
            const response = await axios.get(`${ApiConfig.API_URL}auth/admin/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('fetch admin detalis: ', response.data);
            setAdmin(response.data);
        } catch (error: any) {
            console.error("Greška prilikom učitavanja admina:", error.response?.data?.message || error.message);
            logout();
        }
    };

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            clearLocalStorage();
            logout();
            return;
        }

        try {
            const response = await axios.post(`${ApiConfig.API_URL}auth/refresh`, { refreshToken });
            const { accessToken } = response.data;

            setToken(accessToken);
            localStorage.setItem("accessToken", accessToken);
            apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.warn("Istekao refresh token, vraćanje na login...");
                clearLocalStorage();
                logout();
            } else {
                console.error("Greška prilikom osvežavanja tokena:", error.response?.data?.message || error.message);
            }
        }
    };

    const clearLocalStorage = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
    };

    const updateOnlineStatus = async (isOnline: boolean) => {
        if (!token) return;

        try {
            await apiClient.post("auth/user/online-status", { isOnline });
            setOnlineStatus(isOnline);
        } catch (error: any) {
            console.error("Greška prilikom ažuriranja statusa:", error.response?.data?.message || error.message);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(ApiConfig.API_URL + "auth/login", { email, password });
            const { accessToken, refreshToken, user, role } = response.data;

            setRole(role);
            localStorage.setItem("role", role);

            setToken(accessToken);
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            

            if (user) setUser(user);
            setOnlineStatus(onlineStatus);
            updateOnlineStatus(true);

            if (role === 'admin') {
    
                navigate("/admin/dashboard")
                console.log('admin login: ',response.data)
            } else {
               
                navigate("/")
                console.log('user login: ',response.data)
            }
            
        } catch (error: any) {
            console.error("Login greška:", error.response?.data?.message || error.message);
            throw new Error("Neuspešna prijava. Proverite kredencijale.");
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await apiClient.post("auth/user/online-status", { isOnline: false });
            }
        } catch (error: any) {
            console.error("Greška prilikom odjave:", error.response?.data?.message || error.message);
        }

        setUser(null);
        setAdmin(null);
        setRole(null);
        setToken(null);
        setOnlineStatus(null);

        clearLocalStorage();
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!(user || admin),
                user,
                admin,
                setUser,
                setAdmin,
                token,
                role,
                onlineStatus,
                login,
                logout,
                refreshAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
