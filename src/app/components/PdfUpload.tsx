"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { InputComponentProps, Result } from "../types";
import { extractTextFromPdf } from "../utils/geminiProcessor";

export default function PdfUpload({
  setResults,
  setIsLoading,
  setError,
}: InputComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      setResults([]);

      try {
        // Extract questions using Gemini AI
        const questions = await extractTextFromPdf(file);

        // Classify each question individually and maintain the question text
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
          error instanceof Error ? error.message : "Failed to process PDF"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setResults, setIsLoading, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  if (!isClient) {
    return null; // Don't render anything on server-side
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-500"
          }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the PDF here...</p>
        ) : (
          <p className="text-gray-600">
            Drag & drop a PDF here, or click to select one
          </p>
        )}
      </div>
    </div>
  );
}
