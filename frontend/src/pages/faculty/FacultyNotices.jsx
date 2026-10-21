import { useEffect, useState } from "react";
import api from "../../services/api";

const FacultyNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await api.get("/notices/my");

                const data = response.data;

                setNotices(
                    Array.isArray(data)
                        ? data
                        : data.notices || []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load notices."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString();
    };

    const getPriorityClass = (priority) => {
        if (priority === "high") {
            return "bg-red-100 text-red-700";
        }

        if (priority === "low") {
            return "bg-gray-100 text-gray-700";
        }

        return "bg-blue-100 text-blue-700";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading notices...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Notices
                </h1>

                <p className="text-gray-500 mt-1">
                    Important announcements and campus updates.
                </p>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {notices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                    No notices available.
                </div>
            ) : (
                <div className="space-y-5">

                    {notices.map((notice) => (
                        <div
                            key={notice._id}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >

                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {notice.title}
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Published{" "}
                                        {formatDate(notice.publishDate)}
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityClass(
                                        notice.priority
                                    )}`}
                                >
                                    {notice.priority}
                                </span>

                            </div>

                            <p className="text-gray-600 mt-5 whitespace-pre-line">
                                {notice.content}
                            </p>

                            <div className="flex flex-wrap gap-3 mt-5 text-sm">

                                <span className="bg-gray-100 px-3 py-1 rounded-full">
                                    Audience:{" "}
                                    {notice.targetAudience}
                                </span>

                                {notice.department && (
                                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                                        Department:{" "}
                                        {notice.department.name}
                                    </span>
                                )}

                                {notice.expiryDate && (
                                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                                        Expires:{" "}
                                        {formatDate(
                                            notice.expiryDate
                                        )}
                                    </span>
                                )}

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default FacultyNotices;