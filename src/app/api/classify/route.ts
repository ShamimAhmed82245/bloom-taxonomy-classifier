import { api } from "@/app/utils/apiClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const payload = {
      text,
      model_type: "all",
    };

    const response = await api.post("", payload);

    return NextResponse.json({
      predictions: response.data.predictions,
      model_used: response.data.model_used,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to classify text" },
      { status: 500 }
    );
  }
}
