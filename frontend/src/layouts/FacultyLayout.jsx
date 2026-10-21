import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FacultyLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: "Dashboard", path: "/faculty" },
        { name: "Students", path: "/faculty/students" },
        { name: "Attendance", path: "/faculty/attendance" },
        { name: "Assignments", path: "/faculty/assignments" },
        { name: "Grades", path: "/faculty/grades" },
        { name: "Timetable", path: "/faculty/timetable" },
        { name: "Notices", path: "/faculty/notices" },
        { name: "Submissions", path: "/faculty/submissions" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white fixed left-0 top-0 bottom-0">

                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold">
                        Campus360
                    </h1>

                    <p className="text-gray-400 text-sm mt-1">
                        Faculty Portal
                    </p>
                </div>


                <nav className="p-4 space-y-2">

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/faculty"}
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


                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">

                    <button
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* Main Content */}
            <div className="ml-64 flex-1">

                {/* Navbar */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">

                    <h2 className="font-semibold text-gray-800">
                        Faculty Portal
                    </h2>


                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                {user?.name}
                            </p>

                            <p className="text-xs text-gray-500">
                                {user?.email}
                            </p>
                        </div>

                    </div>

                </header>


                {/* Current Page */}
                <main className="p-8">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default FacultyLayout;