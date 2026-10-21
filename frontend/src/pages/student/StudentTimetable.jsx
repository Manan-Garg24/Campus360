import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentTimetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const response = await api.get("/timetable/my");

                const data = response.data;

                setTimetable(
                    Array.isArray(data)
                        ? data
                        : data.timetable || []
                );
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load timetable"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    if (loading) {
        return (
            <p className="text-gray-600">
                Loading timetable...
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

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    return (
        <div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Timetable
                </h1>

                <p className="text-gray-500 mt-2">
                    View your weekly class schedule.
                </p>
            </div>


            {/* Timetable */}
            {timetable.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <p className="text-gray-500">
                        No timetable available.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">

                    {days.map((day) => {

                        const dayClasses = timetable.filter(
                            (item) => item.day === day
                        );

                        if (dayClasses.length === 0) {
                            return null;
                        }

                        return (
                            <div
                                key={day}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                            >

                                {/* Day heading */}
                                <div className="bg-gray-50 px-6 py-4 border-b">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {day}
                                    </h2>
                                </div>


                                {/* Classes */}
                                <div className="divide-y">

                                    {dayClasses.map((item) => (
                                        <div
                                            key={item._id}
                                            className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                        >

                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {item.subject?.name ||
                                                        "Unknown Subject"}
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.subject?.code || ""}
                                                </p>
                                            </div>


                                            <div className="text-sm text-gray-600">
                                                <p>
                                                    <span className="font-medium">
                                                        Time:
                                                    </span>{" "}
                                                    {item.startTime} -{" "}
                                                    {item.endTime}
                                                </p>

                                                <p className="mt-1">
                                                    <span className="font-medium">
                                                        Room:
                                                    </span>{" "}
                                                    {item.room}
                                                </p>
                                            </div>


                                            <div className="text-sm text-gray-600">
                                                <p>
                                                    <span className="font-medium">
                                                        Faculty:
                                                    </span>{" "}
                                                    {item.faculty?.user?.name ||
                                                        "Not assigned"}
                                                </p>
                                            </div>

                                        </div>
                                    ))}

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
};

export default StudentTimetable;