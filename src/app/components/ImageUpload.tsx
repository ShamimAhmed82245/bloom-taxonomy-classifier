"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { InputComponentProps } from "../types";
import { extractTextFromImage } from "../utils/geminiProcessor";
import { classifyText } from "../utils/apiClient";

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

      try {
        const extractedQuestions = await extractTextFromImage(file);
        // Join all questions with newlines to create a single string
        const extractedText = extractedQuestions.join("\n");
        const result = await classifyText(extractedText);
        setResults([result]);
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
          ? "Drop the image here"
          : "Drag & drop an image file here, or click to select"}
      </p>
    </div>
  );
}
