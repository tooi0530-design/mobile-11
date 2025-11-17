import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This case should be rare since the UI waits for a key, but it's good practice.
        throw new Error("API 키를 찾을 수 없습니다. API 키를 선택했는지 확인하세요.");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Converts a File object to a GoogleGenerativeAI.Part object.
 * @param file The image file to convert.
 * @returns A promise that resolves to a generative part object.
 */
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

/**
 * Extracts text from an image file using the Gemini API.
 * @param imageFile The image file of the receipt.
 * @returns A promise that resolves to the extracted text.
 */
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
    try {
        const ai = getGeminiClient();
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = {
            text: "Extract all text from this receipt. Present it as a single block of text with line breaks where appropriate. Do not add any formatting like markdown or headers."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // Fix: The 'contents' property expects an array of Content objects.
            // The Content object containing the parts is now correctly wrapped in an array.
            contents: [{ parts: [imagePart, textPart] }],
        });
        
        const text = response.text;

        if (!text) {
          throw new Error("이미지에서 텍스트를 추출하는 데 실패했습니다.");
        }
        
        return text.trim();
    } catch (error) {
        console.error("Error extracting text from image:", error);
        // Re-throw original error to be handled by the component
        if (error instanceof Error) {
           throw error;
        }
        // Fallback for non-Error types
        throw new Error("영수증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
};
