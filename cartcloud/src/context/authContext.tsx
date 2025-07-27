import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
const BASE_API_URL = import.meta.env.VITE_API_URL;

interface User {
    id: string;
    name: string;
    email: string;
    role: "customer" | "vendor" | "admin";
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, role: "customer" | "vendor") => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => { },
    logout: () => { },
    signup: async () => { }
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    const response = await fetch(BASE_API_URL + "/users/" + decoded.id, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    const data = await response.json();
                    setUser({
                        id: data._id || data.id,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                    });
                } 
                catch (e) {
                    setUser(null);
                    // Clear invalid token
                    localStorage.removeItem("token");
                }
            }
            setIsLoading(false);
        }
        )();
    }, []);

    async function login(email: string, password: string) {
        console.log(email, password);
        const response = await fetch(BASE_API_URL + "/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const message = await response.json().then((data: any) => data.message || "Unknown error");
            throw new Error(message);
        }
        const data = await response.json();
        localStorage.setItem("token", data.token);
        const userObj = {
            id: data.user._id || data.user.id,
            name: data.user.name ? data.user.name : "",
            email: data.user.email,
            role: data.user.role,
        };
        console.log("Setting user after login:", userObj);
        setUser(userObj);
    }

    async function signup(name: string, email: string, password: string, role: "customer" | "vendor") {
        const response = await fetch(BASE_API_URL + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password, role })
        });
        if (!response.ok) {
            const message = await response.json().then((data: any) => data.message || "Unknown error");
            throw new Error(message);
        }
        const data = await response.json();
        localStorage.setItem("token", data.token);
        const userObj = {
            id: data.user._id || data.user.id,
            name: data.user.name ? data.user.name : "",
            email: data.user.email,
            role: data.user.role,
        };
        console.log("Setting user after signup:", userObj);
        setUser(userObj);
    }

    function logout() {
        setUser(null);
        localStorage.removeItem("token");
    }
    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
