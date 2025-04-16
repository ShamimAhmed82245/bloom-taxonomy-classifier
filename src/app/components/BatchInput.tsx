"use client";

import { useState } from "react";
import { InputComponentProps, Result } from "../types";

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

      if (questions.length === 0) {
        throw new Error("Please enter at least one question");
      }

      const results = await Promise.all(
        questions.map(async (questionText) => {
          const response = await fetch("/api/classify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: questionText }),
          });

          if (!response.ok) {
            throw new Error(`Failed to classify question: ${questionText}`);
          }

          const data = await response.json();
          const result: Result = {
            text: questionText,
            predictions: data.predictions,
            model_used: data.model_used,
          };
          return result;
        })
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
