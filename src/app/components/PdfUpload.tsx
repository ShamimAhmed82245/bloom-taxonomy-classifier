"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { InputComponentProps } from "../types";
import { extractTextFromPdf } from "../utils/geminiProcessor";
import { classifyMultipleQuestions } from "../utils/apiClient";

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

        // Classify each question individually
        const classificationResults = await classifyMultipleQuestions(
          questions
        );

        setResults(classificationResults);
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
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the PDF here...</p>
        ) : (
          <p>Drag & drop a PDF here, or click to select one</p>
        )}
      </div>
    </div>
  );
}
