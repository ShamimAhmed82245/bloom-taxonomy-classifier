"use client";

import { useState } from "react";
import { InputComponentProps } from "../types";
import { classifyText } from "../utils/apiClient";

export default function BatchInput({
  setResults,
  setIsLoading,
  setError,
}: InputComponentProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const questions = text
        .split("\n")
        .filter((q) => q.trim())
        .map((q) => q.trim());

      const results = await Promise.all(
        questions.map((question) => classifyText(question))
      );
      setResults(results);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to process questions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter multiple questions (one per line)..."
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Classify All
      </button>
    </form>
  );
}
