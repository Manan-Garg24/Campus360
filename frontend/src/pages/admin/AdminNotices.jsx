import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminNotices = () => {
    const [notices, setNotices] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        content: "",
        targetAudience: "all",
        department: "",
        publishDate: "",
        expiryDate: "",
        priority: "normal"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [noticesRes, departmentsRes] =
                await Promise.all([
                    api.get("/notices"),
                    api.get("/departments")
                ]);

            setNotices(noticesRes.data.notices || []);
            setDepartments(
                departmentsRes.data.departments || []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load notices"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,

            ...(name === "targetAudience" &&
            value !== "department"
                ? { department: "" }
                : {})
        }));
    };

    const resetForm = () => {
        setForm({
            title: "",
            content: "",
            targetAudience: "all",
            department: "",
            publishDate: "",
            expiryDate: "",
            priority: "normal"
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const payload = {
                title: form.title,
                content: form.content,
                targetAudience: form.targetAudience,
                department:
                    form.targetAudience === "department"
                        ? form.department
                        : null,
                publishDate:
                    form.publishDate || undefined,
                expiryDate:
                    form.expiryDate || null,
                priority: form.priority
            };

            if (editingId) {
                await api.put(
                    `/notices/${editingId}`,
                    payload
                );
            } else {
                await api.post(
                    "/notices",
                    payload
                );
            }

            await fetchData();
            resetForm();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save notice"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (notice) => {
        setEditingId(notice._id);

        const formatDateTime = (date) => {
            if (!date) return "";

            const d = new Date(date);

            const year = d.getFullYear();
            const month = String(
                d.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
                d.getDate()
            ).padStart(2, "0");
            const hours = String(
                d.getHours()
            ).padStart(2, "0");
            const minutes = String(
                d.getMinutes()
            ).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setForm({
            title: notice.title,
            content: notice.content,
            targetAudience:
                notice.targetAudience,
            department:
                notice.department?._id || "",
            publishDate:
                formatDateTime(notice.publishDate),
            expiryDate:
                formatDateTime(notice.expiryDate),
            priority:
                notice.priority || "normal"
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this notice?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await api.delete(
                `/notices/${id}`
            );

            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete notice"
            );
        }
    };

    const getAudienceLabel = (notice) => {
        if (
            notice.targetAudience ===
            "department"
        ) {
            return (
                notice.department?.code ||
                notice.department?.name ||
                "Department"
            );
        }

        if (
            notice.targetAudience ===
            "student"
        ) {
            return "Students";
        }

        if (
            notice.targetAudience ===
            "faculty"
        ) {
            return "Faculty";
        }

        return "Everyone";
    };

    const getPriorityClass = (priority) => {
        if (priority === "high") {
            return "bg-red-50 text-red-700";
        }

        if (priority === "low") {
            return "bg-gray-100 text-gray-700";
        }

        return "bg-blue-50 text-blue-700";
    };

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-gray-500">
                    Loading notices...
                </p>
            </div>
        );
    }

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Notices
                </h1>

                <p className="mt-1 text-gray-500">
                    Create and manage campus announcements.
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
                            ? "Edit Notice"
                            : "Create Notice"}
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
                    className="space-y-5"
                >

                    {/* Title */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Notice Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Mid-Semester Examination Schedule"
                            required
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Content
                        </label>

                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Write the notice details..."
                            required
                            className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Audience */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Target Audience
                            </label>

                            <select
                                name="targetAudience"
                                value={form.targetAudience}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                            >
                                <option value="all">
                                    Everyone
                                </option>

                                <option value="student">
                                    Students
                                </option>

                                <option value="faculty">
                                    Faculty
                                </option>

                                <option value="department">
                                    Specific Department
                                </option>
                            </select>
                        </div>

                        {/* Department */}
                        {form.targetAudience ===
                            "department" && (
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

                                    {departments.map(
                                        (department) => (
                                            <option
                                                key={
                                                    department._id
                                                }
                                                value={
                                                    department._id
                                                }
                                            >
                                                {
                                                    department.name
                                                }{" "}
                                                (
                                                {
                                                    department.code
                                                }
                                                )
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        )}

                        {/* Priority */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Priority
                            </label>

                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                            >
                                <option value="low">
                                    Low
                                </option>

                                <option value="normal">
                                    Normal
                                </option>

                                <option value="high">
                                    High
                                </option>
                            </select>
                        </div>

                        {/* Publish Date */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Publish Date
                            </label>

                            <input
                                type="datetime-local"
                                name="publishDate"
                                value={form.publishDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Expiry */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Expiry Date
                            </label>

                            <input
                                type="datetime-local"
                                name="expiryDate"
                                value={form.expiryDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                            ? "Update Notice"
                            : "Publish Notice"}
                    </button>

                </form>

            </div>

            {/* Notices */}
            <div className="rounded-xl bg-white shadow-sm">

                <div className="border-b p-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        All Notices
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {notices.length} notice
                        {notices.length !== 1
                            ? "s"
                            : ""}
                    </p>
                </div>

                {notices.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No notices found.
                    </div>
                ) : (
                    <div className="divide-y">

                        {notices.map((notice) => (
                            <div
                                key={notice._id}
                                className="p-6 hover:bg-gray-50"
                            >

                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                    <div className="flex-1">

                                        <div className="mb-2 flex flex-wrap items-center gap-2">

                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {notice.title}
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                                                    notice.priority
                                                )}`}
                                            >
                                                {notice.priority}
                                            </span>

                                        </div>

                                        <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                            {notice.content}
                                        </p>

                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">

                                            <span className="rounded-md bg-gray-100 px-3 py-1">
                                                To:{" "}
                                                {getAudienceLabel(
                                                    notice
                                                )}
                                            </span>

                                            <span className="rounded-md bg-gray-100 px-3 py-1">
                                                Published:{" "}
                                                {new Date(
                                                    notice.publishDate
                                                ).toLocaleString()}
                                            </span>

                                            {notice.expiryDate && (
                                                <span className="rounded-md bg-gray-100 px-3 py-1">
                                                    Expires:{" "}
                                                    {new Date(
                                                        notice.expiryDate
                                                    ).toLocaleString()}
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                    <div className="flex gap-2">

                                        <button
                                            onClick={() =>
                                                handleEdit(
                                                    notice
                                                )
                                            }
                                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    notice._id
                                                )
                                            }
                                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default AdminNotices;