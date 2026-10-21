import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [faculty, setFaculty] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        code: "",
        department: "",
        semester: "",
        credits: "",
        faculty: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [subjectsRes, departmentsRes, facultyRes] =
                await Promise.all([
                    api.get("/subjects"),
                    api.get("/departments"),
                    api.get("/faculty")
                ]);

            setSubjects(subjectsRes.data.subjects || []);
            setDepartments(departmentsRes.data.departments || []);
            setFaculty(facultyRes.data.faculty || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load subject data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredFaculty = useMemo(() => {
        if (!form.department) return [];

        return faculty.filter(
            (item) =>
                item.department?._id === form.department
        );
    }, [faculty, form.department]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,

            ...(name === "department"
                ? { faculty: "" }
                : {})
        }));
    };

    const resetForm = () => {
        setForm({
            name: "",
            code: "",
            department: "",
            semester: "",
            credits: "",
            faculty: ""
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const payload = {
                name: form.name,
                code: form.code,
                department: form.department,
                semester: Number(form.semester),
                credits: Number(form.credits),
                faculty: form.faculty
            };

            if (editingId) {
                await api.put(
                    `/subjects/${editingId}`,
                    payload
                );
            } else {
                await api.post("/subjects", payload);
            }

            await fetchData();
            resetForm();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save subject"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (subject) => {
        setEditingId(subject._id);

        setForm({
            name: subject.name,
            code: subject.code,
            department: subject.department?._id || "",
            semester: String(subject.semester),
            credits: String(subject.credits),
            faculty: subject.faculty?._id || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this subject?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await api.delete(`/subjects/${id}`);

            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete subject"
            );
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-gray-500">
                    Loading subjects...
                </p>
            </div>
        );
    }

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Subjects
                </h1>

                <p className="mt-1 text-gray-500">
                    Manage courses and their faculty assignments.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Form */}
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {editingId
                            ? "Edit Subject"
                            : "Add New Subject"}
                    </h2>

                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2"
                >

                    {/* Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Subject Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Data Structures"
                            required
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Code */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Subject Code
                        </label>

                        <input
                            type="text"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                            placeholder="CS301"
                            required
                            className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Department
                        </label>

                        <select
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                        >
                            <option value="">
                                Select Department
                            </option>

                            {departments.map((department) => (
                                <option
                                    key={department._id}
                                    value={department._id}
                                >
                                    {department.name} (
                                    {department.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Faculty */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Faculty
                        </label>

                        <select
                            name="faculty"
                            value={form.faculty}
                            onChange={handleChange}
                            required
                            disabled={!form.department}
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {form.department
                                    ? "Select Faculty"
                                    : "Select Department First"}
                            </option>

                            {filteredFaculty.map((item) => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.user?.name} -{" "}
                                    {item.employeeId}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Semester */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Semester
                        </label>

                        <select
                            name="semester"
                            value={form.semester}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                        >
                            <option value="">
                                Select Semester
                            </option>

                            {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                (semester) => (
                                    <option
                                        key={semester}
                                        value={semester}
                                    >
                                        Semester {semester}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* Credits */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Credits
                        </label>

                        <input
                            type="number"
                            name="credits"
                            value={form.credits}
                            onChange={handleChange}
                            min="1"
                            max="10"
                            required
                            placeholder="4"
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                ? "Update Subject"
                                : "Add Subject"}
                        </button>
                    </div>

                </form>
            </div>

            {/* Subjects */}
            <div className="rounded-xl bg-white shadow-sm">

                <div className="border-b p-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        All Subjects
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {subjects.length} subject
                        {subjects.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {subjects.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No subjects found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Subject
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Code
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Department
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Semester
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Credits
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Faculty
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                {subjects.map((subject) => (
                                    <tr
                                        key={subject._id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">
                                                {subject.name}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                                                {subject.code}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {subject.department?.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {subject.semester}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {subject.credits}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700">
                                                {subject.faculty?.user?.name ||
                                                    "N/A"}
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                {subject.faculty?.employeeId ||
                                                    ""}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(subject)
                                                    }
                                                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            subject._id
                                                        )
                                                    }
                                                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
};

export default AdminSubjects;