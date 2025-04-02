import { NextResponse } from "next/server";
import { classifyText } from "@/app/utils/apiClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.text) {
      return NextResponse.json(
        { message: "No text provided" },
        { status: 400 }
      );
    }

    const result = await classifyText(body.text);
    return NextResponse.json({ results: [result] });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { message: "Failed to process classification" },
      { status: 500 }
    );
  }
}
