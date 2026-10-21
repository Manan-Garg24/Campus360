import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentNotices = () => {
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
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load notices"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    if (loading) {
        return (
            <p className="text-gray-600">
                Loading notices...
            </p>
        );
    }

    if (error) {
        return (
            <p className="text-red-600">
                {error}
            </p>
        );
    }

    return (
        <div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Notices
                </h1>

                <p className="text-gray-500 mt-2">
                    Stay updated with the latest campus announcements.
                </p>
            </div>


            {/* Notices */}
            {notices.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <p className="text-gray-500">
                        No notices available.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">

                    {notices.map((notice) => (

                        <div
                            key={notice._id}
                            className="bg-white rounded-2xl shadow-sm p-6"
                        >

                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {notice.title}
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Published:{" "}
                                        {new Date(
                                            notice.publishDate
                                        ).toLocaleDateString()}
                                    </p>
                                </div>


                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                                        notice.priority === "high"
                                            ? "bg-red-100 text-red-700"
                                            : notice.priority === "low"
                                            ? "bg-gray-100 text-gray-700"
                                            : "bg-blue-100 text-blue-700"
                                    }`}
                                >
                                    {notice.priority}
                                </span>

                            </div>


                            <p className="text-gray-600 mt-5 leading-relaxed">
                                {notice.content}
                            </p>


                            <div className="mt-5 pt-4 border-t flex flex-wrap gap-5 text-sm text-gray-500">

                                <span>
                                    Audience:{" "}
                                    <span className="font-medium capitalize">
                                        {notice.targetAudience}
                                    </span>
                                </span>


                                {notice.department && (
                                    <span>
                                        Department:{" "}
                                        <span className="font-medium">
                                            {notice.department.name}
                                        </span>
                                    </span>
                                )}


                                {notice.expiryDate && (
                                    <span>
                                        Expires:{" "}
                                        <span className="font-medium">
                                            {new Date(
                                                notice.expiryDate
                                            ).toLocaleDateString()}
                                        </span>
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

export default StudentNotices;