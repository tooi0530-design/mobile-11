import React from 'react';

interface ApiKeySelectorProps {
    onSelectKey: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4 font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl text-center">
                <h1 className="text-2xl font-bold text-black mb-3">API 키 필요</h1>
                <p className="text-gray-600 mb-6">
                    'VibeReceipt OCR'을 사용하려면 Gemini API 키를 선택해야 합니다. 프로젝트에 결제가 활성화되어 있는지 확인하세요.
                </p>
                <button
                    onClick={onSelectKey}
                    className="w-full px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                    API 키 선택
                </button>
                 <p className="text-xs text-gray-500 mt-4">
                    API 키 사용에 대한 자세한 내용은{' '}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-black"
                    >
                        결제 문서
                    </a>
                    를 참조하세요.
                </p>
            </div>
        </div>
    );
};

export default ApiKeySelector;
