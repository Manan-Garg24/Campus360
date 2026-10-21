import { useEffect, useState } from "react";
import api from "../../services/api";

const FacultySubmissions = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [selectedAssignment, setSelectedAssignment] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [gradingId, setGradingId] = useState(null);

    const [marks, setMarks] = useState({});
    const [feedback, setFeedback] = useState({});

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // Load Faculty Assignments
    // ==========================================

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/assignments/my");

            const data = response.data;

            const assignmentData = Array.isArray(data)
                ? data
                : data.assignments || [];

            setAssignments(assignmentData);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load assignments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);


    // ==========================================
    // Load Submissions
    // ==========================================

    const fetchSubmissions = async (assignmentId) => {
        if (!assignmentId) {
            setSubmissions([]);
            return;
        }

        try {
            setLoadingSubmissions(true);
            setError("");
            setMessage("");

            const response = await api.get(
                `/submissions/assignment/${assignmentId}`
            );

            const data = response.data;

            const submissionData = Array.isArray(data)
                ? data
                : data.submissions || [];

            setSubmissions(submissionData);

            // Prepare existing marks and feedback
            const existingMarks = {};
            const existingFeedback = {};

            submissionData.forEach((submission) => {
                if (
                    submission.marks !== null &&
                    submission.marks !== undefined
                ) {
                    existingMarks[submission._id] =
                        submission.marks;
                }

                existingFeedback[submission._id] =
                    submission.feedback || "";
            });

            setMarks(existingMarks);
            setFeedback(existingFeedback);

        } catch (err) {
            console.error(err);

            setSubmissions([]);

            setError(
                err.response?.data?.message ||
                "Failed to load submissions."
            );
        } finally {
            setLoadingSubmissions(false);
        }
    };


    // ==========================================
    // Assignment Change
    // ==========================================

    const handleAssignmentChange = async (e) => {
        const assignmentId = e.target.value;

        setSelectedAssignment(assignmentId);

        await fetchSubmissions(assignmentId);
    };


    // ==========================================
    // Grade Submission
    // ==========================================

    const handleGrade = async (submission) => {
        const submissionId = submission._id;

        const selectedAssignmentData = assignments.find(
            (assignment) =>
                assignment._id === selectedAssignment
        );

        if (!selectedAssignmentData) {
            setError("Assignment not found.");
            return;
        }

        const enteredMarks = Number(
            marks[submissionId]
        );

        if (
            marks[submissionId] === undefined ||
            marks[submissionId] === ""
        ) {
            setError("Please enter marks.");
            return;
        }

        if (enteredMarks < 0) {
            setError("Marks cannot be negative.");
            return;
        }

        if (
            enteredMarks >
            selectedAssignmentData.totalMarks
        ) {
            setError(
                `Marks cannot be greater than ${selectedAssignmentData.totalMarks}.`
            );
            return;
        }

        try {
            setGradingId(submissionId);
            setError("");
            setMessage("");

            await api.put(
                `/submissions/${submissionId}/grade`,
                {
                    marks: enteredMarks,
                    feedback:
                        feedback[submissionId] || ""
                }
            );

            setMessage(
                "Submission graded successfully."
            );

            await fetchSubmissions(selectedAssignment);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to grade submission."
            );
        } finally {
            setGradingId(null);
        }
    };


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                    Loading assignments...
                </p>
            </div>
        );
    }


    return (
        <div className="space-y-6">

            {/* Header */}

            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Submissions
                </h1>

                <p className="text-gray-500 mt-1">
                    Review and grade student assignment submissions.
                </p>
            </div>


            {/* Messages */}

            {message && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}


            {/* Assignment Selector */}

            <div className="bg-white rounded-xl shadow-sm p-6">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Assignment
                </label>

                <select
                    value={selectedAssignment}
                    onChange={handleAssignmentChange}
                    className="w-full border rounded-lg px-4 py-3"
                >

                    <option value="">
                        Select an assignment
                    </option>

                    {assignments.map((assignment) => (
                        <option
                            key={assignment._id}
                            value={assignment._id}
                        >
                            {assignment.title}
                            {assignment.subject?.name
                                ? ` - ${assignment.subject.name}`
                                : ""}
                        </option>
                    ))}

                </select>

            </div>


            {/* No Assignment Selected */}

            {!selectedAssignment && (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                    Select an assignment to view student submissions.
                </div>
            )}


            {/* Loading Submissions */}

            {selectedAssignment &&
                loadingSubmissions && (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                        Loading submissions...
                    </div>
                )}


            {/* No Submissions */}

            {selectedAssignment &&
                !loadingSubmissions &&
                submissions.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                        No students have submitted this assignment yet.
                    </div>
                )}


            {/* Submission List */}

            {selectedAssignment &&
                !loadingSubmissions &&
                submissions.length > 0 && (

                    <div className="space-y-6">

                        {submissions.map((submission) => {

                            const studentName =
                                submission.student?.user?.name ||
                                "Unknown Student";

                            const rollNumber =
                                submission.student?.rollNumber ||
                                "N/A";

                            const assignment =
                                assignments.find(
                                    (item) =>
                                        item._id ===
                                        selectedAssignment
                                );

                            return (
                                <div
                                    key={submission._id}
                                    className="bg-white rounded-xl shadow-sm p-6"
                                >

                                    {/* Student Header */}

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>

                                            <h2 className="text-xl font-semibold text-gray-800">
                                                {studentName}
                                            </h2>

                                            <p className="text-gray-500 text-sm mt-1">
                                                Roll Number:{" "}
                                                {rollNumber}
                                            </p>

                                        </div>


                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                submission.status ===
                                                "graded"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {submission.status ===
                                            "graded"
                                                ? "Graded"
                                                : "Pending Evaluation"}
                                        </span>

                                    </div>


                                    {/* Submitted Date */}

                                    <div className="mt-4 text-sm text-gray-500">
                                        Submitted on:{" "}
                                        {new Date(
                                            submission.submittedAt
                                        ).toLocaleString()}
                                    </div>


                                    {/* Student Answer */}

                                    <div className="mt-6">

                                        <h3 className="font-semibold text-gray-800 mb-2">
                                            Student Answer
                                        </h3>

                                        <div className="bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap text-gray-700">
                                            {submission.answer}
                                        </div>

                                    </div>


                                    {/* Grading */}

                                    <div className="mt-6 border-t pt-6">

                                        <h3 className="font-semibold text-gray-800 mb-4">
                                            Evaluation
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                            {/* Marks */}

                                            <div>

                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Marks
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={
                                                        assignment?.totalMarks
                                                    }
                                                    value={
                                                        marks[
                                                            submission._id
                                                        ] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setMarks(
                                                            (
                                                                previous
                                                            ) => ({
                                                                ...previous,
                                                                [submission._id]:
                                                                    e.target
                                                                        .value
                                                            })
                                                        )
                                                    }
                                                    className="w-full border rounded-lg px-4 py-3"
                                                />

                                                <p className="text-xs text-gray-500 mt-1">
                                                    Maximum:{" "}
                                                    {
                                                        assignment?.totalMarks
                                                    }
                                                </p>

                                            </div>


                                            {/* Feedback */}

                                            <div className="md:col-span-2">

                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Feedback
                                                </label>

                                                <textarea
                                                    rows="3"
                                                    value={
                                                        feedback[
                                                            submission._id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setFeedback(
                                                            (
                                                                previous
                                                            ) => ({
                                                                ...previous,
                                                                [submission._id]:
                                                                    e.target
                                                                        .value
                                                            })
                                                        )
                                                    }
                                                    placeholder="Enter feedback for the student..."
                                                    className="w-full border rounded-lg px-4 py-3"
                                                />

                                            </div>

                                        </div>


                                        {/* Grade Button */}

                                        <div className="flex justify-end mt-5">

                                            <button
                                                onClick={() =>
                                                    handleGrade(
                                                        submission
                                                    )
                                                }
                                                disabled={
                                                    gradingId ===
                                                    submission._id
                                                }
                                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {gradingId ===
                                                submission._id
                                                    ? "Saving..."
                                                    : submission.status ===
                                                      "graded"
                                                    ? "Update Grade"
                                                    : "Grade Submission"}
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

        </div>
    );
};

export default FacultySubmissions;