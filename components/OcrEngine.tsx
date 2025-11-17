import React, { useState, useRef, useCallback } from 'react';
import { extractTextFromImage } from '../services/geminiService';
import { ReceiptScan } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface OcrEngineProps {
    onScanComplete: (scan: ReceiptScan) => void;
    onApiKeyInvalid: () => void;
}

const OcrEngine: React.FC<OcrEngineProps> = ({ onScanComplete, onApiKeyInvalid }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setImagePreview(null);
        setExtractedText(null);
        setIsLoading(false);
        setError(null);
        setIsCopied(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            resetState();
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result as string;
                setImagePreview(previewUrl);
                handleImageProcessing(file, previewUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageProcessing = useCallback(async (file: File, imagePreviewUrl: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const text = await extractTextFromImage(file);
            setExtractedText(text);
            const newScan: ReceiptScan = {
                id: new Date().toISOString(),
                date: new Date().toLocaleString(),
                text: text,
                imagePreviewUrl: imagePreviewUrl,
            };
            onScanComplete(newScan);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            if (errorMessage.includes("Requested entity was not found")) {
                setError("API 키가 잘못되었습니다. 새 키를 선택해 주세요.");
                // Delay to allow user to see the message before UI changes
                setTimeout(() => {
                    onApiKeyInvalid();
                }, 2000);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }, [onScanComplete, onApiKeyInvalid]);

    const handleCopyText = () => {
        if (extractedText) {
            navigator.clipboard.writeText(extractedText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (imagePreview) {
        return (
            <div className="p-4 md:p-6 flex flex-col h-full">
                <div className="flex-shrink-0 mb-4 border border-gray-200 rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Receipt preview" className="w-full h-auto max-h-64 object-contain bg-gray-100" />
                </div>
                
                <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg p-4 overflow-hidden">
                    <h2 className="text-sm font-semibold text-gray-500 mb-2">추출된 텍스트</h2>
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                             <div className="flex flex-col items-center gap-4">
                                <SpinnerIcon className="w-8 h-8 animate-spin text-black" />
                                <p>영수증 분석 중...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center text-center text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <pre className="flex-1 whitespace-pre-wrap break-words overflow-y-auto text-gray-800 text-sm font-mono p-1">{extractedText}</pre>
                    )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    {extractedText && (
                         <button
                            onClick={handleCopyText}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-bold transition-all ${isCopied ? 'bg-green-600' : 'bg-black hover:bg-gray-800'}`}
                            disabled={isCopied}
                        >
                            {isCopied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
                            {isCopied ? '복사 완료!' : '전체 텍스트 복사'}
                        </button>
                    )}
                     <button onClick={resetState} className="w-full px-4 py-3 rounded-lg text-black font-bold bg-gray-200 hover:bg-gray-300 transition-colors">
                        새 영수증 스캔
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                 <CameraIcon className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">영수증 스캔</h2>
            <p className="text-gray-600 mb-8 max-w-xs">영수증 사진을 촬영하거나 업로드하여 텍스트를 추출하세요.</p>
            <button
                onClick={triggerFileInput}
                className="w-full max-w-xs px-6 py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105"
            >
                스캔 시작
            </button>
        </div>
    );
};

export default OcrEngine;
