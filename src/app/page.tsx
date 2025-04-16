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
      setResults([]); // Clear results when switching tabs
      setError(null); // Clear any existing errors
    },
    [setInputType, setResults, setError]
  );

  const InputComponent = inputComponents[inputType];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header with tabs */}
      <div className="fixed-header">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-3 justify-center">
            {(Object.keys(inputComponents) as InputType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleInputTypeChange(type)}
                className={`tab-button ${
                  inputType === type
                    ? "tab-button-active"
                    : "tab-button-inactive"
                }`}
                aria-pressed={inputType === type}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Bloom Taxonomy Classifier
        </h1>

        {/* Error Display */}
        {error && (
          <div className="animate-fade-in">
            <ErrorAlert error={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Dynamic Input Component */}
        <div className="input-section">
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
        <div className="mt-8 animate-fade-in">
          {results.length > 0 && <Results results={results} />}
        </div>
      </div>
    </div>
  );
}
