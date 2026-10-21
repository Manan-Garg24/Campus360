import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingComplaint, setEditingComplaint] =
        useState(null);

    const [status, setStatus] = useState("pending");
    const [adminResponse, setAdminResponse] =
        useState("");

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/complaints");

            setComplaints(
                response.data.complaints || []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load complaints"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const openEdit = (complaint) => {
        setEditingComplaint(complaint);
        setStatus(complaint.status);
        setAdminResponse(
            complaint.adminResponse || ""
        );
    };

    const closeEdit = () => {
        setEditingComplaint(null);
        setStatus("pending");
        setAdminResponse("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingComplaint) return;

        try {
            setError("");

            await api.put(
                `/complaints/${editingComplaint._id}`,
                {
                    status,
                    adminResponse
                }
            );

            await fetchComplaints();
            closeEdit();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update complaint"
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this complaint?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await api.delete(
                `/complaints/${id}`
            );

            await fetchComplaints();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete complaint"
            );
        }
    };

    const getStatusClass = (value) => {
        switch (value) {
            case "pending":
                return "bg-yellow-50 text-yellow-700";

            case "in_progress":
                return "bg-blue-50 text-blue-700";

            case "resolved":
                return "bg-green-50 text-green-700";

            case "rejected":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatStatus = (value) => {
        return value
            .replace("_", " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    const getCategoryClass = (value) => {
        if (value === "academic") {
            return "bg-purple-50 text-purple-700";
        }

        if (value === "infrastructure") {
            return "bg-orange-50 text-orange-700";
        }

        if (value === "hostel") {
            return "bg-indigo-50 text-indigo-700";
        }

        return "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-gray-500">
                    Loading complaints...
                </p>
            </div>
        );
    }

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Complaints
                </h1>

                <p className="mt-1 text-gray-500">
                    Review and manage student complaints.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Statistics */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-800">
                        {complaints.length}
                    </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Pending
                    </p>

                    <p className="mt-2 text-3xl font-bold text-yellow-600">
                        {
                            complaints.filter(
                                (item) =>
                                    item.status ===
                                    "pending"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        In Progress
                    </p>

                    <p className="mt-2 text-3xl font-bold text-blue-600">
                        {
                            complaints.filter(
                                (item) =>
                                    item.status ===
                                    "in_progress"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Resolved
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {
                            complaints.filter(
                                (item) =>
                                    item.status ===
                                    "resolved"
                            ).length
                        }
                    </p>
                </div>

            </div>

            {/* Complaints */}
            <div className="rounded-xl bg-white shadow-sm">

                <div className="border-b p-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Student Complaints
                    </h2>
                </div>

                {complaints.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No complaints found.
                    </div>
                ) : (
                    <div className="divide-y">

                        {complaints.map((complaint) => (
                            <div
                                key={complaint._id}
                                className="p-6"
                            >

                                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

                                    {/* Complaint info */}
                                    <div className="flex-1">

                                        <div className="mb-2 flex flex-wrap items-center gap-2">

                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {complaint.title}
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    complaint.status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    complaint.status
                                                )}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryClass(
                                                    complaint.category
                                                )}`}
                                            >
                                                {formatStatus(
                                                    complaint.category
                                                )}
                                            </span>

                                        </div>

                                        {/* Student */}
                                        <div className="mb-3 text-sm text-gray-500">
                                            <span className="font-medium text-gray-700">
                                                Student:
                                            </span>{" "}
                                            {complaint.student?.user?.name ||
                                                "Unknown"}

                                            {" • "}

                                            {complaint.student?.user?.email ||
                                                ""}
                                        </div>

                                        {/* Description */}
                                        <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                            {
                                                complaint.description
                                            }
                                        </p>

                                        {/* Admin response */}
                                        {complaint.adminResponse && (
                                            <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                                <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                                    Admin Response
                                                </p>

                                                <p className="text-sm text-gray-700">
                                                    {
                                                        complaint.adminResponse
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">

                                            <span>
                                                Submitted:{" "}
                                                {new Date(
                                                    complaint.createdAt
                                                ).toLocaleString()}
                                            </span>

                                            {complaint.resolvedAt && (
                                                <span>
                                                    Resolved:{" "}
                                                    {new Date(
                                                        complaint.resolvedAt
                                                    ).toLocaleString()}
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-start gap-2">

                                        <button
                                            onClick={() =>
                                                openEdit(
                                                    complaint
                                                )
                                            }
                                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                        >
                                            Manage
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    complaint._id
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

            {/* Edit Modal */}
            {editingComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                        <div className="mb-6 flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Manage Complaint
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {editingComplaint.title}
                                </p>
                            </div>

                            <button
                                onClick={closeEdit}
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-5"
                        >

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                                >
                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="in_progress">
                                        In Progress
                                    </option>

                                    <option value="resolved">
                                        Resolved
                                    </option>

                                    <option value="rejected">
                                        Rejected
                                    </option>
                                </select>
                            </div>

                            {/* Response */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Admin Response
                                </label>

                                <textarea
                                    value={adminResponse}
                                    onChange={(e) =>
                                        setAdminResponse(
                                            e.target.value
                                        )
                                    }
                                    rows="5"
                                    placeholder="Write a response to the student..."
                                    className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminComplaints;