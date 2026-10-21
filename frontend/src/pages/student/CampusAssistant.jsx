import { useState } from "react";
import api from "../../services/api";

const CampusAssistant = () => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm Campus360 AI Assistant. How can I help you today?"
        }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();

        const message = input.trim();

        if (!message || loading) return;

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: message
            }
        ]);

        setInput("");
        setLoading(true);

        try {
            const response = await api.post("/ai/chat", {
                message
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        response.data.reply ||
                        "Sorry, I couldn't generate a response."
                }
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        error.response?.data?.message ||
                        "Something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] flex-col">

            {/* Header */}
            <div className="mb-5">
                <h1 className="text-3xl font-bold text-gray-800">
                    Campus360 AI Assistant
                </h1>

                <p className="mt-1 text-gray-500">
                    Ask questions and get help from your AI campus assistant.
                </p>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-6 shadow-sm">

                <div className="space-y-5">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                <p className="whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl bg-gray-100 px-5 py-3 text-gray-500">
                                Campus360 AI is thinking...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="mt-4 flex gap-3"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Campus360 AI something..."
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3 outline-none focus:border-blue-500"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default CampusAssistant;