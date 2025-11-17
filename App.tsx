import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ReceiptScan } from './types';
import OcrEngine from './components/OcrEngine';
import HistoryView from './components/HistoryView';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';

type View = 'ocr' | 'history';

const App: React.FC = () => {
    const [view, setView] = useState<View>('ocr');
    const [history, setHistory] = useLocalStorage<ReceiptScan[]>('receipt-history', []);

    const addScanToHistory = useCallback((scan: ReceiptScan) => {
        setHistory(prevHistory => [scan, ...prevHistory]);
    }, [setHistory]);

    const Header = () => (
        <header className="bg-black text-white p-4 flex items-center justify-between shadow-md z-10">
            {view === 'history' ? (
                <button onClick={() => setView('ocr')} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            ) : (
                <div className="w-10"></div> // Placeholder for alignment
            )}
            <h1 className="text-xl font-bold tracking-wider">VibeReceipt OCR</h1>
            {view === 'ocr' ? (
                 <button onClick={() => setView('history')} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <HistoryIcon className="w-6 h-6" />
                </button>
            ) : (
                <div className="w-10"></div> // Placeholder for alignment
            )}
        </header>
    );

    return (
        <div className="max-w-md mx-auto bg-white shadow-2xl h-screen md:h-[95vh] md:max-h-[800px] md:my-4 md:rounded-lg overflow-hidden flex flex-col font-sans">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {view === 'ocr' && <OcrEngine onScanComplete={addScanToHistory} />}
                {view === 'history' && <HistoryView scans={history} onBack={() => setView('ocr')} />}
            </main>
        </div>
    );
};

export default App;
