import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentGrades from "./pages/student/StudentGrades";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentNotices from "./pages/student/StudentNotices";
import StudentComplaints from "./pages/student/StudentComplaints";
import StudentLeave from "./pages/student/StudentLeave";
import CampusAssistant from "./pages/student/CampusAssistant";

import FacultyLayout from "./layouts/FacultyLayout";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyStudents from "./pages/faculty/FacultyStudents";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultyGrades from "./pages/faculty/FacultyGrades";
import FacultyTimetable from "./pages/faculty/FacultyTimetable";
import FacultyNotices from "./pages/faculty/FacultyNotices";
import FacultySubmissions from "./pages/faculty/FacultySubmissions";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminSubjects from "./pages/admin/AdminSubjects";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminLeaves from "./pages/admin/AdminLeaves";

import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./layouts/StudentLayout";

function App() {
    return (
        <Routes>

            {/* Default */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />


            {/* Login */}
            <Route
                path="/login"
                element={<Login />}
            />


            {/* Student */}
            <Route
                path="/student"
                element={
                    <ProtectedRoute allowedRole="student">
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >

                <Route
                    index
                    element={<StudentDashboard />}
                />

                <Route
    path="attendance"
    element={<StudentAttendance />}
/>

                <Route
    path="assignments"
    element={<StudentAssignments />}
/>

                <Route
    path="grades"
    element={<StudentGrades />}
/>

                <Route
    path="timetable"
    element={<StudentTimetable />}
/>

                <Route
    path="notices"
    element={<StudentNotices />}
/>

                <Route
    path="complaints"
    element={<StudentComplaints />}
/>

                <Route
    path="leave"
    element={<StudentLeave />}
/>
<Route
    path="assistant"
    element={<CampusAssistant />}
/>

            </Route>


            {/* Faculty - temporary */}
            {/* Faculty */}
<Route
    path="/faculty"
    element={
        <ProtectedRoute allowedRole="faculty">
            <FacultyLayout />
        </ProtectedRoute>
    }
>
    <Route
        index
        element={<FacultyDashboard />}
    />

    <Route
        path="students"
        element={<FacultyStudents />}
    />

    <Route
        path="attendance"
        element={<FacultyAttendance />}
    />

    <Route
        path="assignments"
        element={<FacultyAssignments />}
    />

    <Route
        path="grades"
        element={<FacultyGrades />}
    />

    <Route
        path="timetable"
        element={<FacultyTimetable />}
    />

    <Route
        path="notices"
        element={<FacultyNotices />}
    />
    <Route
    path="submissions"
    element={<FacultySubmissions />}
/>
</Route>


            {/* Admin - temporary */}
            {/* ================= ADMIN ================= */}

<Route
    path="/admin"
    element={
        <ProtectedRoute allowedRole="admin">
            <AdminLayout />
        </ProtectedRoute>
    }
>
    <Route
        index
        element={<AdminDashboard />}
    />

    <Route
    path="students"
    element={<AdminStudents />}
/>

    <Route
    path="faculty"
    element={<AdminFaculty />}
/>

    <Route
    path="departments"
    element={<AdminDepartments />}
/>

    <Route
    path="subjects"
    element={<AdminSubjects />}
/>

    <Route
    path="notices"
    element={<AdminNotices />}
/>

    <Route
    path="complaints"
    element={<AdminComplaints />}
/>

    <Route
    path="leaves"
    element={<AdminLeaves />}
/>
</Route>

        </Routes>
    );
}

export default App;