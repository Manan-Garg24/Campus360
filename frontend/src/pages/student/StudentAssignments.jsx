import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [selectedAssignment, setSelectedAssignment] =
        useState(null);

    const [answer, setAnswer] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // Fetch assignments + submissions
    // ==========================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [assignmentResponse, submissionResponse] =
                await Promise.all([
                    api.get("/assignments"),
                    api.get("/submissions/my")
                ]);

            const assignmentData = Array.isArray(
                assignmentResponse.data
            )
                ? assignmentResponse.data
                : assignmentResponse.data.assignments || [];

            const submissionData = Array.isArray(
                submissionResponse.data
            )
                ? submissionResponse.data
                : submissionResponse.data.submissions || [];

            setAssignments(assignmentData);
            setSubmissions(submissionData);

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
        fetchData();
    }, []);


    // ==========================================
    // Find submission for assignment
    // ==========================================

    const getSubmission = (assignmentId) => {
        return submissions.find(
            (submission) =>
                submission.assignment?._id === assignmentId ||
                submission.assignment === assignmentId
        );
    };


    // ==========================================
    // Open submission form
    // ==========================================

    const openSubmissionForm = (assignment) => {
        setSelectedAssignment(assignment);
        setAnswer("");
        setMessage("");
        setError("");
    };


    // ==========================================
    // Close submission form
    // ==========================================

    const closeSubmissionForm = () => {
        setSelectedAssignment(null);
        setAnswer("");
    };


    // ==========================================
    // Submit assignment
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!answer.trim()) {
            setError("Please enter your answer.");
            return;
        }

        setSubmitting(true);

        try {
            await api.post("/submissions", {
                assignment: selectedAssignment._id,
                answer: answer.trim()
            });

            setMessage(
                "Assignment submitted successfully."
            );

            closeSubmissionForm();

            await fetchData();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to submit assignment."
            );
        } finally {
            setSubmitting(false);
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
                    Assignments
                </h1>

                <p className="text-gray-500 mt-1">
                    View your assignments and submit your answers.
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


            {/* Submission Form */}

            {selectedAssignment && (
                <div className="bg-white rounded-xl shadow-sm p-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>
                            <h2 className="text-xl font-semibold">
                                Submit Assignment
                            </h2>

                            <p className="text-blue-600 text-sm mt-1">
                                {selectedAssignment.title}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeSubmissionForm}
                            className="text-gray-500 hover:text-gray-800 text-xl"
                        >
                            ✕
                        </button>

                    </div>


                    <div className="bg-gray-50 rounded-lg p-4 mb-6">

                        <p className="text-sm text-gray-500">
                            Assignment
                        </p>

                        <p className="font-medium mt-1">
                            {selectedAssignment.title}
                        </p>

                        <p className="text-gray-600 mt-3">
                            {selectedAssignment.description}
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Answer
                            </label>

                            <textarea
                                value={answer}
                                onChange={(e) =>
                                    setAnswer(e.target.value)
                                }
                                placeholder="Write your answer here..."
                                rows="8"
                                required
                                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>


                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={closeSubmissionForm}
                                className="px-5 py-3 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Assignment"}
                            </button>

                        </div>

                    </form>

                </div>
            )}


            {/* Assignment List */}

            {assignments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                    No assignments available.
                </div>
            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {assignments.map((assignment) => {

                        const dueDate = new Date(
                            assignment.dueDate
                        );

                        const isOverdue =
                            dueDate < new Date();

                        const submission =
                            getSubmission(assignment._id);

                        const isSubmitted =
                            Boolean(submission);

                        return (
                            <div
                                key={assignment._id}
                                className="bg-white rounded-xl shadow-sm p-6"
                            >

                                {/* Header */}

                                <div className="flex items-start justify-between gap-4">

                                    <div>

                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {assignment.title}
                                        </h2>

                                        <p className="text-blue-600 text-sm mt-1">
                                            {assignment.subject?.name ||
                                                "Unknown Subject"}

                                            {assignment.subject?.code &&
                                                ` (${assignment.subject.code})`}
                                        </p>

                                    </div>


                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            isSubmitted
                                                ? "bg-blue-100 text-blue-700"
                                                : isOverdue
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {isSubmitted
                                            ? "Submitted"
                                            : isOverdue
                                            ? "Overdue"
                                            : "Pending"}
                                    </span>

                                </div>


                                {/* Description */}

                                <p className="text-gray-600 mt-4">
                                    {assignment.description}
                                </p>


                                {/* Details */}

                                <div className="grid grid-cols-2 gap-4 mt-6">

                                    <div className="bg-gray-50 rounded-lg p-4">

                                        <p className="text-sm text-gray-500">
                                            Due Date
                                        </p>

                                        <p className="font-semibold mt-1">
                                            {dueDate.toLocaleDateString()}
                                        </p>

                                    </div>


                                    <div className="bg-gray-50 rounded-lg p-4">

                                        <p className="text-sm text-gray-500">
                                            Total Marks
                                        </p>

                                        <p className="font-semibold mt-1">
                                            {assignment.totalMarks}
                                        </p>

                                    </div>

                                </div>


                                {/* Submission Info */}

                                {isSubmitted && (
                                    <div className="mt-4 bg-blue-50 rounded-lg p-4">

                                        <p className="text-sm text-blue-700">
                                            Submitted on
                                        </p>

                                        <p className="font-medium text-blue-800 mt-1">
                                            {new Date(
                                                submission.submittedAt
                                            ).toLocaleString()}
                                        </p>

                                        {submission.marks !== null &&
    submission.marks !== undefined && (
        <div className="mt-3">

            <p className="text-sm text-blue-700">
                Marks:{" "}
                <strong>
                    {submission.marks} /{" "}
                    {assignment.totalMarks}
                </strong>
            </p>

            {submission.feedback && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-sm font-semibold text-gray-700">
                        Faculty Feedback
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                        {submission.feedback}
                    </p>
                </div>
            )}

        </div>
    )}

                                    </div>
                                )}


                                {/* Action */}

                                <div className="flex justify-end mt-6">

                                    {!isSubmitted && !isOverdue && (
                                        <button
                                            onClick={() =>
                                                openSubmissionForm(
                                                    assignment
                                                )
                                            }
                                            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Submit Assignment
                                        </button>
                                    )}

                                    {isSubmitted && (
                                        <span className="text-green-600 font-medium">
                                            ✓ Assignment submitted
                                        </span>
                                    )}

                                    {!isSubmitted && isOverdue && (
                                        <span className="text-red-600 font-medium">
                                            Submission closed
                                        </span>
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

export default StudentAssignments;