import Header from "@/components/header";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "@/components/footer";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"
import { IoCartOutline } from "react-icons/io5";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "@/context/authContext";

export default function Signup() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>("");

    const { user, isLoading, signup } = useAuth();

    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required"),
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
        password: Yup.string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters")
            .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
            .matches(/[a-z]/, "Password must contain at least one lowercase letter")
            .matches(/[0-9]/, "Password must contain at least one number")
            .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Confirm password is required'),
        role: Yup.string()
            .oneOf(['customer', 'vendor'], 'Invalid role')
            .required("Role is required"),
    });

    useEffect(() => {
        // Redirect authenticated users away from signup page
        if (!isLoading && user) {
            console.log("user role in signup", user.role);
            if (user.role === "vendor") {
                navigate("/vendor-home");
            } else {
                navigate("/");
            }
        }
    }, [user, isLoading, navigate]);


    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "customer",
        },
        validationSchema,
        onSubmit: handleSignup,
    });

    async function handleSignup(values: any) {
        const { name, email, password, role } = values;
        console.log(values);
        try {
            await signup(name, email, password, role);
            console.log("Signup successful");
            console.log(role);
            if (role === "vendor") {
                navigate("/vendor-home");
            } else {
                console.log("customer");
                navigate("/");
            }
        } 
        catch (error : any) {
            console.error("Signup failed:", error);
            setError(error.message);
        }

    }

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <>
            <main className="flex h-screen items-center justify-center flex-col gap-1 w-full px-2 pt-4 pb-2">
                <IoCartOutline className="text-lg scale-300 2xl:scale-600 mb-3 2xl:mb-5" />
                <h1 className="text-4xl 2xl:text-5xl font-normal mb-3 2xl:mt-5">Cart Cloud</h1>
                <form className="w-full max-w-md" onSubmit={formik.handleSubmit}>
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="grid gap-1">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="text-red-500 text-xs">{formik.errors.name}</div>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="e@example.com"
                                
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-red-500 text-xs">{formik.errors.email}</div>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter Password"
                                
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-red-500 text-xs">{formik.errors.password}</div>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <div className="text-red-500 text-xs">{formik.errors.confirmPassword}</div>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formik.values.role}
                                onValueChange={value => {
                                    formik.setFieldValue("role", value);
                                }}
                            >
                                <SelectTrigger id="role" className="w-full">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="vendor">Vendor</SelectItem>
                                </SelectContent>
                            </Select>
                            {formik.touched.role && formik.errors.role && (
                                <div className="text-red-500 text-xs">{formik.errors.role}</div>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <Button
                                className="w-full bg-[var(--foreground)] text-white hover:bg-[var(--muted-foreground)]"
                                type="submit"
                            >
                                Create Account
                            </Button>
                        </div>
                        <p className="text-red-500 text-xs">{error}</p>
                        <div className="flex items-center justify-center text-sm">
                            Already have an account?
                            <Button type="button" className="ps-1 text-blue-500" variant="link" onClick={() => navigate("/")}>
                                Login
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </>
    )
}