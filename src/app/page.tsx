"use client";

import { useCallback } from "react";
import TextInput from "./components/TextInput";
import PdfUpload from "./components/PdfUpload";
import ImageUpload from "./components/ImageUpload";
import BatchInput from "./components/BatchInput";
import Results from "./components/Results";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorAlert from "./components/ErrorAlert";
import { InputType } from "./types";
import { useClassification } from "./hooks/useClassification";

const inputComponents = {
  text: TextInput,
  pdf: PdfUpload,
  image: ImageUpload,
  batch: BatchInput,
} as const;

export default function Home() {
  const {
    inputType,
    results,
    isLoading,
    error,
    setInputType,
    setResults,
    setIsLoading,
    setError,
  } = useClassification();

  const handleInputTypeChange = useCallback(
    (type: InputType) => {
      setInputType(type);
    },
    [setInputType]
  );

  const InputComponent = inputComponents[inputType];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Bloom Taxonomy Classifier
        </h1>

        {/* Input Type Selector */}
        <div
          className="flex gap-4 mb-8 justify-center"
          role="radiogroup"
          aria-label="Input type selection"
        >
          {(Object.keys(inputComponents) as InputType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleInputTypeChange(type)}
              aria-pressed={inputType === type}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                inputType === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

        {/* Dynamic Input Component */}
        <div className="mb-8">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <InputComponent
              setResults={setResults}
              setIsLoading={setIsLoading}
              setError={setError}
            />
          )}
        </div>

        {/* Results Display */}
        {results.length > 0 && <Results results={results} />}
      </div>
    </div>
  );
}
