
import React, { useState, useRef } from 'react';
import { analyzeSymptoms } from '../services/gemini';
import { useApp } from '../context/AppContext';

interface HealthAnalyzerProps {
  onClose: () => void;
  petName?: string;
  petId?: string; // Need petId to save
}

const HealthAnalyzer: React.FC<HealthAnalyzerProps> = ({ onClose, petName, petId }) => {
  const { saveHealthRecord, pets } = useApp();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback if petId not passed, assume first pet (in single mode this usually has id)
  const effectivePetId = petId || pets[0]?.id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!description.trim() && !image) return;
    
    setIsLoading(true);
    let base64 = undefined;
    if (image) {
        base64 = image.split(',')[1];
    }

    const analysis = await analyzeSymptoms(description, base64, imageFile?.type);
    setResult(analysis);
    
    // Save to DB immediately
    if (effectivePetId && analysis) {
        await saveHealthRecord(effectivePetId, 'symptom_analysis', analysis.conditionName || 'Health Check', analysis);
    }

    setIsLoading(false);
  };

  const getSeverityColor = (severity: string) => {
      switch(severity?.toLowerCase()) {
          case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
          case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
          case 'high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
          case 'critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <span className="material-icons-round text-2xl">health_and_safety</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Health Analyzer</h2>
                            <p className="text-white/80 text-xs">AI Symptom Checker for {petName || 'your pet'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!result ? (
                    <>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Describe Symptoms</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none text-sm dark:text-white"
                                placeholder="e.g. Limping on left leg, not eating dinner, lethargic..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Photo (Optional)</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {image ? (
                                    <div className="relative w-full h-40">
                                        <img src={image} alt="Symptom" className="w-full h-full object-contain rounded-lg" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setImage(null); setImageFile(null); }}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <span className="material-icons-round text-sm">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="material-icons-round text-gray-400 text-3xl mb-2">add_a_photo</span>
                                        <p className="text-xs text-gray-500">Upload a clear photo of the issue</p>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                            <span className="material-icons-round text-blue-500">info</span>
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                <strong>Disclaimer:</strong> This tool uses AI to provide information, not a medical diagnosis. Always consult a veterinarian for serious concerns.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Result Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.conditionName || "Analysis Complete"}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(result.severity)}`}>
                                {result.severity} Severity
                            </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.explanation}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="material-icons-round text-primary text-lg">medical_services</span> Recommended Actions
                            </h4>
                            <ul className="space-y-2">
                                {result.immediateActions?.map((action: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="material-icons-round text-green-500 text-sm mt-0.5">check_circle</span>
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {result.shouldSeeVet && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-red-900/30 rounded-full text-red-500 shadow-sm">
                                    <span className="material-icons-round">emergency</span>
                                </div>
                                <div>
                                    <p className="font-bold text-red-700 dark:text-red-400 text-sm">Vet Visit Recommended</p>
                                    <p className="text-xs text-red-600 dark:text-red-300">Based on the severity, professional care is advised.</p>
                                </div>
                            </div>
                        )}
                        
                        <p className="text-[10px] text-gray-400 text-center italic mt-4">{result.disclaimer}</p>
                        <div className="text-center mt-2">
                            <span className="text-xs text-green-600 font-bold flex items-center justify-center gap-1">
                                <span className="material-icons-round text-sm">save</span> Saved to Health Records
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
                {!result ? (
                    <button 
                        onClick={handleAnalyze}
                        disabled={isLoading || (!description && !image)}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round">analytics</span> Analyze Symptoms
                            </>
                        )}
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={() => setResult(null)} className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Check Again
                        </button>
                        <button onClick={onClose} className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-colors">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default HealthAnalyzer;
