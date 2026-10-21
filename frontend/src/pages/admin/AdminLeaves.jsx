import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingLeave, setEditingLeave] =
        useState(null);

    const [status, setStatus] =
        useState("pending");

    const [adminRemarks, setAdminRemarks] =
        useState("");

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/leaves");

            setLeaves(
                response.data.leaves || []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load leave applications"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const openEdit = (leave) => {
        setEditingLeave(leave);

        setStatus(
            leave.status
        );

        setAdminRemarks(
            leave.adminRemarks || ""
        );
    };

    const closeEdit = () => {
        setEditingLeave(null);
        setStatus("pending");
        setAdminRemarks("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingLeave) return;

        try {
            setError("");

            await api.put(
                `/leaves/${editingLeave._id}`,
                {
                    status,
                    adminRemarks
                }
            );

            await fetchLeaves();

            closeEdit();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update leave application"
            );
        }
    };

    const getStatusClass = (value) => {
        if (value === "pending") {
            return "bg-yellow-50 text-yellow-700";
        }

        if (value === "approved") {
            return "bg-green-50 text-green-700";
        }

        if (value === "rejected") {
            return "bg-red-50 text-red-700";
        }

        return "bg-gray-100 text-gray-700";
    };

    const formatStatus = (value) => {
        return value
            .replace("_", " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const calculateDays = (
        startDate,
        endDate
    ) => {
        const start =
            new Date(startDate);

        const end =
            new Date(endDate);

        const difference =
            end.getTime() -
            start.getTime();

        return (
            Math.floor(
                difference /
                    (1000 * 60 * 60 * 24)
            ) + 1
        );
    };

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-gray-500">
                    Loading leave applications...
                </p>
            </div>
        );
    }

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Leave Applications
                </h1>

                <p className="mt-1 text-gray-500">
                    Review and manage student leave requests.
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
                        {leaves.length}
                    </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Pending
                    </p>

                    <p className="mt-2 text-3xl font-bold text-yellow-600">
                        {
                            leaves.filter(
                                (leave) =>
                                    leave.status ===
                                    "pending"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Approved
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {
                            leaves.filter(
                                (leave) =>
                                    leave.status ===
                                    "approved"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Rejected
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-600">
                        {
                            leaves.filter(
                                (leave) =>
                                    leave.status ===
                                    "rejected"
                            ).length
                        }
                    </p>
                </div>

            </div>

            {/* Applications */}
            <div className="rounded-xl bg-white shadow-sm">

                <div className="border-b p-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Student Leave Requests
                    </h2>
                </div>

                {leaves.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No leave applications found.
                    </div>
                ) : (
                    <div className="divide-y">

                        {leaves.map((leave) => (
                            <div
                                key={leave._id}
                                className="p-6 hover:bg-gray-50"
                            >

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                    {/* Information */}
                                    <div className="flex-1">

                                        <div className="mb-2 flex flex-wrap items-center gap-2">

                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {
                                                    leave.student?.user?.name ||
                                                    "Unknown Student"
                                                }
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    leave.status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    leave.status
                                                )}
                                            </span>

                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                {formatStatus(
                                                    leave.leaveType
                                                )}
                                            </span>

                                        </div>

                                        <p className="mb-3 text-sm text-gray-500">
                                            {
                                                leave.student?.user?.email
                                            }
                                        </p>

                                        {/* Dates */}
                                        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs text-gray-500">
                                                    Start Date
                                                </p>

                                                <p className="mt-1 font-medium text-gray-800">
                                                    {formatDate(
                                                        leave.startDate
                                                    )}
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs text-gray-500">
                                                    End Date
                                                </p>

                                                <p className="mt-1 font-medium text-gray-800">
                                                    {formatDate(
                                                        leave.endDate
                                                    )}
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs text-gray-500">
                                                    Duration
                                                </p>

                                                <p className="mt-1 font-medium text-gray-800">
                                                    {calculateDays(
                                                        leave.startDate,
                                                        leave.endDate
                                                    )}{" "}
                                                    day(s)
                                                </p>
                                            </div>

                                        </div>

                                        {/* Reason */}
                                        <div className="mb-4">

                                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                                Reason
                                            </p>

                                            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                                {
                                                    leave.reason
                                                }
                                            </p>

                                        </div>

                                        {/* Admin remarks */}
                                        {leave.adminRemarks && (
                                            <div className="rounded-lg bg-gray-50 p-4">

                                                <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                                    Admin Remarks
                                                </p>

                                                <p className="text-sm text-gray-700">
                                                    {
                                                        leave.adminRemarks
                                                    }
                                                </p>

                                            </div>
                                        )}

                                        <p className="mt-4 text-xs text-gray-400">
                                            Applied on{" "}
                                            {new Date(
                                                leave.createdAt
                                            ).toLocaleString()}
                                        </p>

                                    </div>

                                    {/* Action */}
                                    <button
                                        onClick={() =>
                                            openEdit(
                                                leave
                                            )
                                        }
                                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                    >
                                        Review
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* Review Modal */}
            {editingLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                        <div className="mb-6 flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Review Leave
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {
                                        editingLeave.student?.user?.name
                                    }
                                </p>
                            </div>

                            <button
                                onClick={closeEdit}
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>

                        <div className="mb-6 rounded-lg bg-gray-50 p-4">

                            <p className="text-sm text-gray-600">
                                <span className="font-medium">
                                    Leave:
                                </span>{" "}
                                {formatDate(
                                    editingLeave.startDate
                                )}{" "}
                                →{" "}
                                {formatDate(
                                    editingLeave.endDate
                                )}
                            </p>

                            <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">
                                    Reason:
                                </span>{" "}
                                {
                                    editingLeave.reason
                                }
                            </p>

                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-5"
                        >

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Decision
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

                                    <option value="approved">
                                        Approve
                                    </option>

                                    <option value="rejected">
                                        Reject
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Admin Remarks
                                </label>

                                <textarea
                                    value={adminRemarks}
                                    onChange={(e) =>
                                        setAdminRemarks(
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                    placeholder="Add remarks for the student..."
                                    className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

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
                                    Save Decision
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminLeaves;