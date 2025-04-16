"use client";

import { useState, useCallback } from "react";
import debounce from "lodash/debounce";
import { InputComponentProps } from "../types";

const TextInput: React.FC<InputComponentProps> = ({
  setResults,
  setIsLoading,
  setError,
}) => {
  const [text, setText] = useState("");

  const classifyText = useCallback(
    async (inputText: string) => {
      if (!inputText.trim()) {
        setError("Please enter some text to classify");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/classify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: inputText }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Create a result object that matches the expected format
        setResults([{
          text: inputText,
          predictions: data.predictions,
          model_used: data.model_used
        }]);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to classify text"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setResults, setIsLoading, setError]
  );

  const debouncedClassify = debounce(classifyText, 500);

  return (
    <div>
      <textarea
        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your question here..."
        aria-label="Question text"
      />
      <button
        onClick={() => classifyText(text)}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={!text.trim()}
      >
        Classify
      </button>
    </div>
  );
};

export default TextInput;
