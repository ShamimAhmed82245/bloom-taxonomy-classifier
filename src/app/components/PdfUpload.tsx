"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { InputProps } from "../types";
import { extractTextFromPdf } from "../utils/geminiProcessor";
import { classifyText } from "../utils/apiClient";

export default function PdfUpload({
  setResults,
  setIsLoading,
  setError,
}: InputProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);

      try {
        const extractedText = await extractTextFromPdf(file);
        const result = await classifyText(extractedText);
        setResults([result]);
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
          ? "Drop the PDF here"
          : "Drag & drop a PDF file here, or click to select"}
      </p>
    </div>
  );
}
