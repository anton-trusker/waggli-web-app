import React, { useState, useRef, useEffect } from 'react';
import { useFeature } from '../context/FeatureFlagContext';
import { useLocalization } from '../context/LocalizationContext';

const AIAssistant: React.FC = () => {
    const { isEnabled } = useFeature('ai_features');
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: "Hi! I'm your Waggly AI assistant. How can I help you with your pet today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response for now (real integration would go here)
        setTimeout(() => {
            const responses = [
                "That's a great question about pet health. Based on general guidelines, it's best to consult your vet for specific symptoms.",
                "I can help track that! Go to the 'Add Record' page to log this health event.",
                "For vaccinations, core vaccines include Rabies and DHPP for dogs.",
                "Need to find a vet? Check out the Services tab to find providers near you."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, { role: 'assistant', text: randomResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    if (!isEnabled) return null;

    return (
        <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none`}>
            {/* Chat Window */}
            <div className={`bg-white dark:bg-surface-dark w-[90vw] md:w-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto mb-4 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-10 pointer-events-none h-0'}`}>
                <div className="bg-gradient-to-r from-primary to-primary-dark p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white">
                        <span className="material-icons-round">smart_toy</span>
                        <span className="font-bold">Waggly AI</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm'
                                }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef}></div>
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-surface-dark flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about pet health..."
                        className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 bg-primary text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-primary-hover transition-colors"
                    >
                        <span className="material-icons-round">send</span>
                    </button>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
            >
                <span className="material-icons-round text-3xl">{isOpen ? 'close' : 'smart_toy'}</span>
            </button>
        </div>
    );
};

export default AIAssistant;
