/**
 * Represents the result of a classification request
 */
export interface ModelPrediction {
  prediction: number;
  probability: number;
}

export interface Result {
  text: string;
  predictions: Record<string, ModelPrediction>;
  model_used: string;
}

/**
 * Props for the Input component
 */
export interface InputComponentProps {
  setResults: (results: Result[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Supported input types for classification
 */
export type InputType = "text" | "pdf" | "image" | "batch";

/**
 * Global classification state
 */
export interface ClassificationState {
  inputType: InputType;
  results: Result[];
  isLoading: boolean;
  error: string | null;
}

/**
 * API response shape
 */
export interface ApiResponse {
  prediction: string;
  confidence: number;
  explanation?: string;
}
