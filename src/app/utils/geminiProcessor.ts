import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({
  model: "models/gemini-1.5-flash-002",
});

const EXTRACTION_PROMPT = `
Please analyze this image and extract any educational questions or assessment items.
Follow these guidelines:
1. Extract complete, well-formed questions only
2. Separate multiple questions into distinct items
3. Preserve the exact wording as shown in the image
4. Include any relevant context or instructions
5. Format each question as a separate array element
6. Ignore incomplete fragments or non-question text

Return the questions in a clear, structured format.
`;

export async function extractTextFromImage(file: File): Promise<string[]> {
  try {
    const imageData = await fileToGenerativePart(file);
    const result = await model.generateContent([
      { text: EXTRACTION_PROMPT },
      imageData,
    ]);

    const response = await result.response;
    const extractedText = response.text();

    // Process the response into individual questions
    const questions = extractedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.length > 10) // Filter out short/empty lines
      .map((question) => question.replace(/^\d+[\).\s]+/, "")); // Remove numbering

    return questions;
  } catch (error) {
    console.error("Image text extraction error:", error);
    throw new Error("Failed to extract text from image");
  }
}

export async function extractTextFromPdf(file: File): Promise<string[]> {
  try {
    const text = await readPdfText(file);
    // Split PDF text into individual questions using similar processing
    const questions = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.length > 10)
      .map((question) => question.replace(/^\d+[\).\s]+/, ""));

    return questions;
  } catch (error) {
    console.error("PDF extraction error:", error);
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
