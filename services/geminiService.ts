import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // In a real app, you might show a more user-friendly error
    // or disable functionality. For this example, we throw an error.
    console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
    if (!API_KEY) {
        return Promise.reject(new Error("API 키가 설정되지 않아 이미지를 처리할 수 없습니다."));
    }
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = {
            text: "Extract all text from this receipt. Present it as a single block of text with line breaks where appropriate. Do not add any formatting like markdown or headers."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        const text = response.text;

        if (!text) {
          throw new Error("이미지에서 텍스트를 추출하는 데 실패했습니다.");
        }
        
        return text.trim();
    } catch (error) {
        console.error("Error extracting text from image:", error);
        throw new Error("영수증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
};