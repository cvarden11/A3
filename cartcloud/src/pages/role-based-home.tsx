import { useAuth } from "@/context/authContext";
import { Navigate } from "react-router-dom";
import Home from "./home";
import VendorHomePage from "./vendor-home";
// import AdminDashboard from "./admin-dashboard"; // Uncomment if you have an admin dashboard

export default function RoleBasedHome() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (user.role === "vendor") {
    return <VendorHomePage />;
  }
  // if (user.role === "admin") {
  //   return <AdminDashboard />;
  // }


  // Default Home Page: customer

  console.log("user role in role based home", user.role);
  return <Home />;
} 