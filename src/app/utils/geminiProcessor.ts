import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const imageData = await fileToGenerativePart(file);
    const result = await model.generateContent([imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error("Failed to extract text from image");
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // For PDF, we'll need to convert to text first
    const text = await readPdfText(file);
    return text;
  } catch (error) {
    throw new Error("Failed to extract text from PDF");
  }
}

async function fileToGenerativePart(file: File) {
  const buffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType: file.type,
    },
  };
}

async function readPdfText(file: File): Promise<string> {
  // Placeholder for PDF processing
  // You may want to use a PDF library here
  return "Extracted text from PDF";
}
