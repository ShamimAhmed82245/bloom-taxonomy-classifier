"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { InputComponentProps, Result } from "../types";
import { extractTextFromImage } from "../utils/geminiProcessor";

export default function ImageUpload({
  setResults,
  setIsLoading,
  setError,
}: InputComponentProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      setResults([]);

      try {
        // Extract questions from the image
        const questions = await extractTextFromImage(file);

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
          error instanceof Error ? error.message : "Failed to process image"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setResults, setIsLoading, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-500"
          }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the image here..."
            : "Drag & drop an image file here, or click to select"}
        </p>
      </div>
    </div>
  );
}
