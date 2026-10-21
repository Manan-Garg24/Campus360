import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentLeave = () => {
    const [leaves, setLeaves] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [leaveType, setLeaveType] = useState("personal");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const fetchLeaves = async () => {
        try {
            const response = await api.get("/leaves/my");

            const data = response.data;

            setLeaves(
                Array.isArray(data)
                    ? data
                    : data.leaves || []
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load leave applications"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchLeaves();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setError("");
        setSuccess("");

        if (new Date(endDate) < new Date(startDate)) {
            setError("End date cannot be before start date.");
            setSubmitting(false);
            return;
        }

        try {
            await api.post("/leaves", {
                startDate,
                endDate,
                leaveType,
                reason
            });

            setStartDate("");
            setEndDate("");
            setLeaveType("personal");
            setReason("");

            setSuccess(
                "Leave application submitted successfully."
            );

            fetchLeaves();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to submit leave application"
            );
        } finally {
            setSubmitting(false);
        }
    };


    const getStatusStyle = (status) => {
        if (status === "approved") {
            return "bg-green-100 text-green-700";
        }

        if (status === "rejected") {
            return "bg-red-100 text-red-700";
        }

        return "bg-yellow-100 text-yellow-700";
    };


    return (
        <div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Leave Applications
                </h1>

                <p className="text-gray-500 mt-2">
                    Apply for leave and track your applications.
                </p>
            </div>


            {/* Messages */}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-5">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-5">
                    {success}
                </div>
            )}


            {/* Application Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

                <h2 className="text-xl font-semibold mb-5">
                    Apply for Leave
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) =>
                                    setStartDate(e.target.value)
                                }
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(e.target.value)
                                }
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                    </div>


                    {/* Leave type */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Leave Type
                        </label>

                        <select
                            value={leaveType}
                            onChange={(e) =>
                                setLeaveType(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >

                            <option value="medical">
                                Medical
                            </option>

                            <option value="personal">
                                Personal
                            </option>

                            <option value="emergency">
                                Emergency
                            </option>

                            <option value="other">
                                Other
                            </option>

                        </select>

                    </div>


                    {/* Reason */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason
                        </label>

                        <textarea
                            value={reason}
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
                            placeholder="Enter reason for leave"
                            required
                            rows="5"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting
                            ? "Submitting..."
                            : "Apply for Leave"}
                    </button>

                </form>

            </div>


            {/* Previous Applications */}
            <div>

                <h2 className="text-xl font-semibold text-gray-800 mb-5">
                    My Leave Applications
                </h2>


                {loading ? (
                    <p className="text-gray-500">
                        Loading leave applications...
                    </p>
                ) : leaves.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                        <p className="text-gray-500">
                            No leave applications found.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {leaves.map((leave) => (

                            <div
                                key={leave._id}
                                className="bg-white rounded-2xl shadow-sm p-6"
                            >

                                <div className="flex justify-between items-start gap-4">

                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {leave.leaveType
                                                .charAt(0)
                                                .toUpperCase() +
                                                leave.leaveType.slice(1)}
                                            {" "}Leave
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(
                                                leave.startDate
                                            ).toLocaleDateString()}
                                            {" → "}
                                            {new Date(
                                                leave.endDate
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>


                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                                            leave.status
                                        )}`}
                                    >
                                        {leave.status}
                                    </span>

                                </div>


                                <p className="text-gray-600 mt-4">
                                    {leave.reason}
                                </p>


                                {leave.adminRemarks && (
                                    <div className="mt-5 bg-gray-50 rounded-lg p-4">

                                        <p className="text-sm font-semibold text-gray-700">
                                            Admin Remarks
                                        </p>

                                        <p className="text-sm text-gray-600 mt-1">
                                            {leave.adminRemarks}
                                        </p>

                                    </div>
                                )}

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default StudentLeave;