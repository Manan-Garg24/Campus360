import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentComplaints = () => {
    const [complaints, setComplaints] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("other");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const fetchComplaints = async () => {
        try {
            const response = await api.get("/complaints/my");

            const data = response.data;

            setComplaints(
                Array.isArray(data)
                    ? data
                    : data.complaints || []
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load complaints"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchComplaints();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/complaints", {
                title,
                description,
                category,
            });

            setTitle("");
            setDescription("");
            setCategory("other");

            setSuccess("Complaint submitted successfully.");

            fetchComplaints();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to submit complaint"
            );
        } finally {
            setSubmitting(false);
        }
    };


    const getStatusStyle = (status) => {
        if (status === "resolved") {
            return "bg-green-100 text-green-700";
        }

        if (status === "rejected") {
            return "bg-red-100 text-red-700";
        }

        if (status === "in_progress") {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-gray-100 text-gray-700";
    };


    return (
        <div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Complaints
                </h1>

                <p className="text-gray-500 mt-2">
                    Submit and track your campus complaints.
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


            {/* Complaint Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

                <h2 className="text-xl font-semibold mb-5">
                    Submit a Complaint
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Title */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Enter complaint title"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    {/* Category */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >

                            <option value="hostel">
                                Hostel
                            </option>

                            <option value="library">
                                Library
                            </option>

                            <option value="canteen">
                                Canteen
                            </option>

                            <option value="transport">
                                Transport
                            </option>

                            <option value="academic">
                                Academic
                            </option>

                            <option value="infrastructure">
                                Infrastructure
                            </option>

                            <option value="other">
                                Other
                            </option>

                        </select>

                    </div>


                    {/* Description */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Describe your complaint"
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
                            : "Submit Complaint"}
                    </button>

                </form>

            </div>


            {/* Previous complaints */}
            <div>

                <h2 className="text-xl font-semibold text-gray-800 mb-5">
                    My Complaints
                </h2>


                {loading ? (
                    <p className="text-gray-500">
                        Loading complaints...
                    </p>
                ) : complaints.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                        <p className="text-gray-500">
                            You haven't submitted any complaints.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {complaints.map((complaint) => (

                            <div
                                key={complaint._id}
                                className="bg-white rounded-2xl shadow-sm p-6"
                            >

                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">

                                    <div>

                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {complaint.title}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1 capitalize">
                                            Category:{" "}
                                            {complaint.category}
                                        </p>

                                    </div>


                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusStyle(
                                            complaint.status
                                        )}`}
                                    >
                                        {complaint.status.replace(
                                            "_",
                                            " "
                                        )}
                                    </span>

                                </div>


                                <p className="text-gray-600 mt-4">
                                    {complaint.description}
                                </p>


                                <p className="text-sm text-gray-400 mt-4">
                                    Submitted:{" "}
                                    {new Date(
                                        complaint.createdAt
                                    ).toLocaleDateString()}
                                </p>


                                {complaint.adminResponse && (
                                    <div className="mt-5 bg-gray-50 rounded-lg p-4">

                                        <p className="text-sm font-semibold text-gray-700">
                                            Admin Response
                                        </p>

                                        <p className="text-sm text-gray-600 mt-1">
                                            {complaint.adminResponse}
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

export default StudentComplaints;