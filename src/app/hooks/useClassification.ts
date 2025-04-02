import { useState, useCallback } from "react";
import { ClassificationState, InputType, Result } from "../types";

const initialState: ClassificationState = {
  inputType: "text",
  results: [],
  isLoading: false,
  error: null,
};

export const useClassification = () => {
  const [state, setState] = useState<ClassificationState>(initialState);

  const setInputType = useCallback((type: InputType) => {
    setState((prev) => ({
      ...prev,
      inputType: type,
      results: [],
      error: null,
    }));
  }, []);

  const setResults = useCallback((results: Result[]) => {
    setState((prev) => ({ ...prev, results }));
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    setInputType,
    setResults,
    setIsLoading,
    setError,
  };
};
