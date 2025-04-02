import axios from "axios";
import { Result } from "../types";

const API_URL =
  process.env.NEXT_PUBLIC_CLASSIFIER_API_URL ||
  "http://localhost:8000/predict/";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add CORS support for development
  withCredentials: false,
});

export async function classifyText(text: string): Promise<Result> {
  try {
    const payload = {
      text,
      model_type: "all",
    };

    // Log the request payload
    console.log("Request payload:", payload);

    const response = await api.post("", payload);

    // Log the response
    console.log("Response:", response.data);

    // Return the result with predictions and model used
    return {
      text,
      predictions: response.data.predictions,
      model_used: response.data.model_used,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          "Unable to connect to the classifier API. Please ensure the server is running."
        );
      }
      throw new Error(
        error.response?.data?.message || "Failed to classify text"
      );
    }
    throw new Error("An unexpected error occurred");
  }
}
