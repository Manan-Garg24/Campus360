import { useEffect, useState } from "react";
import api from "../../services/api";

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const FacultyTimetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const response = await api.get("/timetable/faculty");

                const data = response.data;

                setTimetable(
                    Array.isArray(data)
                        ? data
                        : data.timetable || []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load timetable."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    const getDayClasses = (day) => {
        return timetable
            .filter((item) => item.day === day)
            .sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
            );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading timetable...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    My Timetable
                </h1>

                <p className="text-gray-500 mt-1">
                    View your weekly teaching schedule.
                </p>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {timetable.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                    No timetable entries found.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {days.map((day) => {
                        const classes = getDayClasses(day);

                        return (
                            <div
                                key={day}
                                className="bg-white rounded-xl shadow-sm overflow-hidden"
                            >
                                <div className="bg-gray-50 p-5 border-b">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {day}
                                    </h2>
                                </div>

                                <div className="p-5 space-y-4">

                                    {classes.length === 0 ? (
                                        <p className="text-gray-400">
                                            No classes scheduled.
                                        </p>
                                    ) : (
                                        classes.map((item) => (
                                            <div
                                                key={item._id}
                                                className="border rounded-lg p-4"
                                            >
                                                <div className="flex justify-between gap-4">

                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            {item.subject?.name ||
                                                                "Unknown Subject"}
                                                        </h3>

                                                        <p className="text-sm text-blue-600">
                                                            {item.subject?.code ||
                                                                "N/A"}
                                                        </p>
                                                    </div>

                                                    <span className="text-sm font-medium">
                                                        {item.startTime} -{" "}
                                                        {item.endTime}
                                                    </span>

                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">

                                                    <div>
                                                        <p className="text-gray-400">
                                                            Room
                                                        </p>
                                                        <p className="font-medium">
                                                            {item.room}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">
                                                            Semester
                                                        </p>
                                                        <p className="font-medium">
                                                            {item.semester}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">
                                                            Section
                                                        </p>
                                                        <p className="font-medium">
                                                            {item.section}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">
                                                            Department
                                                        </p>
                                                        <p className="font-medium">
                                                            {item.department?.name ||
                                                                "N/A"}
                                                        </p>
                                                    </div>

                                                </div>
                                            </div>
                                        ))
                                    )}

                                </div>
                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
};

export default FacultyTimetable;