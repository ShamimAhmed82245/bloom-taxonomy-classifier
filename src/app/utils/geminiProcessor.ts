import { GoogleGenerativeAI } from "@google/generative-ai";

// We'll dynamically import pdfjs only on the client side
let pdfjs: typeof import("pdfjs-dist");

// Initialize PDF.js worker only on client side
async function initPdfJs() {
  if (typeof window !== "undefined") {
    pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
}

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({
  model: "models/gemini-1.5-flash-002",
});

const IMAGE_EXTRACTION_PROMPT = `
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

const PDF_EXTRACTION_PROMPT = `
Please analyze this text extracted from a PDF and extract all educational questions or assessment items.
Follow these guidelines:
1. Extract complete, well-formed questions only
2. Separate multiple questions into distinct items
3. Preserve the exact wording as shown in the text
4. Include any relevant context or instructions
5. Format each question as a separate array element
6. Ignore incomplete fragments or non-question text

Return the questions as an array, with each question as a separate element.
`;

export async function extractTextFromImage(file: File): Promise<string[]> {
  try {
    const imageData = await fileToGenerativePart(file);
    const result = await model.generateContent([
      { text: IMAGE_EXTRACTION_PROMPT },
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
    if (!pdfjs) {
      await initPdfJs();
    }

    // First extract raw text from PDF
    const rawText = await readPdfText(file);

    // Use Gemini AI to extract questions from the text
    const result = await model.generateContent([
      { text: PDF_EXTRACTION_PROMPT },
      { text: rawText },
    ]);

    const response = await result.response;
    const extractedText = response.text();

    // Process the response into individual questions
    const questions = extractedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.length > 10)
      .map((question) => question.replace(/^\d+[\).\s]+/, "")); // Remove numbering

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
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only available in the browser");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}
