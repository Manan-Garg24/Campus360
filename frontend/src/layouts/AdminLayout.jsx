import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: "Dashboard", path: "/admin" },
        { name: "Students", path: "/admin/students" },
        { name: "Faculty", path: "/admin/faculty" },
        { name: "Departments", path: "/admin/departments" },
        { name: "Subjects", path: "/admin/subjects" },
        { name: "Notices", path: "/admin/notices" },
        { name: "Complaints", path: "/admin/complaints" },
        { name: "Leave Applications", path: "/admin/leaves" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white fixed h-screen">

                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold">
                        Campus360
                    </h1>

                    <p className="text-gray-400 text-sm mt-1">
                        Admin Portal
                    </p>
                </div>

                <nav className="p-4 space-y-2">

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/admin"}
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-lg transition ${
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-300 hover:bg-gray-800"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}

                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">

                    <button
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg"
                    >
                        Logout
                    </button>

                </div>

            </aside>

            {/* Main content */}
            <main className="ml-64 flex-1">

                {/* Top bar */}
                <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Administration
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage Campus360
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-medium text-gray-800">
                            {user?.name || "Admin"}
                        </p>

                        <p className="text-sm text-gray-500">
                            {user?.email}
                        </p>
                    </div>

                </header>

                {/* Current page */}
                <div className="p-8">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};

export default AdminLayout;