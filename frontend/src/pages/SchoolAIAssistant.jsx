import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import TeacherSidebar from "../components/TeacherSidebar";
import StudentSidebar from "../components/StudentSidebar";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function SchoolAIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const renderSidebar = () => {
    switch (user.role) {
      case "teacher":
        return <TeacherSidebar />;

      case "student":
        return <StudentSidebar />;

      case "parent":
        return <ParentSidebar />;

      default:
        return <Sidebar />;
    }
  };

  const exampleQuestions = {
    admin: [
      "Give me an overview of student attendance.",
      "Summarize pending fee information.",
      "What academic patterns are visible in the available results?",
    ],

    teacher: [
	  "Which classes and subjects are assigned to me?",
	  "Give me an attendance summary for my assigned students.",
	  "Summarize academic performance for my assigned students.",
	  "Show homework for my assigned classes and subjects.",
	],

    student: [
      "What is my attendance summary?",
      "Show my recent academic performance.",
      "Do I have any pending fees?",
      "What homework is assigned to me?",
    ],

    parent: [
      "What is my child's attendance summary?",
      "Show my child's recent results.",
      "Are there any pending fees for my child?",
      "What homework is assigned to my child?",
    ],
  };

  const roleQuestions =
    exampleQuestions[user.role] ||
    exampleQuestions.student;

  const handleAsk = async (
    customQuestion = null
  ) => {
    const finalQuestion =
      (
        customQuestion || question
      ).trim();

    if (!finalQuestion || loading) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: finalQuestion,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response =
        await apiRequest(
          "/ai/assistant",
          {
            method: "POST",

            body: JSON.stringify({
              question: finalQuestion,
            }),
          }
        );

      const data =
        await response.json();

      if (!data.success) {
        setError(
          data.message ||
            "Unable to get AI response"
        );

        return;
      }

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: data.data.answer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "School AI Assistant error:",
        error
      );

      setError(
        "Unable to connect to the School AI Assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAsk();
  };

  const clearChat = () => {
    setMessages([]);
    setQuestion("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderSidebar()}

      <Topbar />

      <main className="ml-64 p-6 pt-20">
        <div className="mx-auto max-w-5xl">

          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-purple-100 p-3">
                <Bot
                  size={28}
                  className="text-purple-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  School AI Assistant
                </h1>

                <p className="text-sm text-gray-500">
                  Ask questions about your authorized school data
                </p>
              </div>

            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Trash2 size={17} />

                Clear Chat
              </button>
            )}

          </div>

          {/* SECURITY INFO */}

          <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50 p-4">

            <div className="flex gap-3">

              <Sparkles
                size={20}
                className="mt-0.5 shrink-0 text-purple-600"
              />

              <div>
                <p className="font-medium text-purple-900">
                  Role-aware AI Assistant
                </p>

                <p className="mt-1 text-sm leading-6 text-purple-700">
                  You are signed in as{" "}
                  <span className="font-semibold capitalize">
                    {user.role || "user"}
                  </span>
                  . The assistant can only use school
                  information available to your account.
                </p>
              </div>

            </div>

          </div>

          {/* CHAT */}

          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

            <div className="min-h-[480px] max-h-[62vh] overflow-y-auto p-5">

              {messages.length === 0 ? (
                <div className="flex min-h-[430px] flex-col items-center justify-center text-center">

                  <div className="rounded-full bg-purple-100 p-5">
                    <Bot
                      size={38}
                      className="text-purple-600"
                    />
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-gray-800">
                    How can I help?
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                    Ask about school records available
                    to your account. The assistant uses
                    authorized school data rather than
                    unrestricted school-wide access.
                  </p>

                  {/* EXAMPLES */}

                  <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">

                    {roleQuestions.map(
                      (item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            handleAsk(item)
                          }
                          disabled={loading}
                          className="rounded-xl border p-3 text-left text-sm text-gray-600 transition hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50"
                        >
                          {item}
                        </button>
                      )
                    )}

                  </div>

                </div>
              ) : (
                <div className="space-y-5">

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-purple-600 text-white"
                            : "border bg-gray-50 text-gray-700"
                        }`}
                      >
                        {message.role ===
                          "assistant" && (
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-purple-600">
                            <Bot size={15} />
                            School AI
                          </div>
                        )}

                        <div className="whitespace-pre-wrap text-sm leading-7">
                          {message.text}
                        </div>

                      </div>

                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">

                      <div className="rounded-2xl border bg-gray-50 px-4 py-3">

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />

                          Analyzing authorized school data...
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* ERROR */}

            {error && (
              <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* INPUT */}

            <form
              onSubmit={handleSubmit}
              className="border-t bg-gray-50 p-4"
            >

              <div className="flex gap-3">

                <textarea
                  rows="2"
                  maxLength={1000}
                  value={question}
                  onChange={(e) =>
                    setQuestion(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();

                      if (
                        question.trim() &&
                        !loading
                      ) {
                        handleAsk();
                      }
                    }
                  }}
                  placeholder="Ask about your school data..."
                  className="min-h-[52px] flex-1 resize-none rounded-xl border bg-white px-4 py-3 outline-none focus:border-purple-400"
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !question.trim()
                  }
                  className="flex h-[52px] items-center gap-2 self-end rounded-xl bg-purple-600 px-5 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />

                  <span className="hidden sm:inline">
                    Ask
                  </span>
                </button>

              </div>

              <div className="mt-2 flex justify-between text-xs text-gray-400">

                <span>
                  Enter to send • Shift + Enter for new line
                </span>

                <span>
                  {question.length}/1000
                </span>

              </div>

            </form>

          </div>

          <p className="mt-3 text-center text-xs text-gray-400">
            AI responses may contain mistakes. Important
            academic, attendance, fee or administrative
            information should be verified against the
            original school records.
          </p>

        </div>
      </main>
    </div>
  );
}

export default SchoolAIAssistant;