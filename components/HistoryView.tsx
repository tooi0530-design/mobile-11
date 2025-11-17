import React, { useState } from 'react';
import { ReceiptScan } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckIcon } from './icons/CheckIcon';

interface HistoryViewProps {
    scans: ReceiptScan[];
    onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ scans }) => {
    const [selectedScan, setSelectedScan] = useState<ReceiptScan | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (selectedScan) {
        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <button onClick={() => { setSelectedScan(null); setIsCopied(false); }} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black">
                        <ArrowLeftIcon className="w-4 h-4" />
                        목록으로 돌아가기
                    </button>
                    <p className="text-xs text-gray-500 mt-2">{selectedScan.date}에 스캔됨</p>
                </div>
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                     <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                        <img src={selectedScan.imagePreviewUrl} alt="Saved receipt" className="w-full h-auto max-h-64 object-contain bg-gray-100" />
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-gray-800 text-sm font-mono">{selectedScan.text}</pre>
                </div>
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                     <button
                        onClick={() => handleCopyText(selectedScan.text)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-bold transition-all ${isCopied ? 'bg-green-600' : 'bg-black hover:bg-gray-800'}`}
                        disabled={isCopied}
                    >
                        {isCopied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
                        {isCopied ? '복사 완료!' : '전체 텍스트 복사'}
                    </button>
                </div>
            </div>
        );
    }
    
    if (scans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-xl font-bold text-black">스캔 기록이 없습니다</h2>
                <p className="text-gray-600 mt-2">스캔한 영수증은 여기에 저장됩니다.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200">
            {scans.map((scan) => (
                <button
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className="w-full text-left p-4 hover:bg-gray-100 transition-colors"
                >
                    <p className="text-sm font-semibold text-black">{scan.date}</p>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                        {scan.text.split('\n').filter(line => line.trim()).slice(0, 2).join(' / ') || '추출된 텍스트 없음'}
                    </p>
                </button>
            ))}
        </div>
    );
};

export default HistoryView;