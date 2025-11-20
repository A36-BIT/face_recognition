
import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, ScanFace, Loader2, AlertCircle, Sparkles, User, Calendar, Users } from 'lucide-react';
import { analyzeImage } from './geminiService';
import { AnalysisResult, AnalysisState } from './types';
import { ScannerEffect } from './ScannerEffect';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [status, setStatus] = useState<AnalysisState>(AnalysisState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    event.target.value = ''; 
  };

  const processFile = (file: File) => {
    setStatus(AnalysisState.IDLE);
    setResults([]);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Analysis
  const handleAnalyze = async () => {
    if (!image) return;
    
    setStatus(AnalysisState.ANALYZING);
    setErrorMessage(null);
    setResults([]);
    
    try {
      const data = await analyzeImage(image);
      setResults(data);
      setStatus(AnalysisState.SUCCESS);
    } catch (err) {
      setErrorMessage("无法分析图片，请稍后重试或更换图片。");
      setStatus(AnalysisState.ERROR);
    }
  };

  // Render UI
  return (
    <div className="flex flex-col min-h-screen bg-dark text-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 pt-10 flex flex-col items-center z-10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> FaceInsight
        </h1>
        <p className="text-slate-400 text-sm mt-1">智能人像检测</p>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 flex flex-col items-center px-4 pb-24 overflow-y-auto z-10 w-full max-w-2xl mx-auto">
        
        {/* Image Display Container */}
        <div className="relative w-full aspect-[3/4] max-h-[50vh] bg-surface rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-6 transition-all duration-500 shrink-0">
          {image ? (
            <img 
              src={image} 
              alt="Target" 
              className="w-full h-full object-contain bg-black/50" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <Users className="w-20 h-20 mb-4 opacity-30" />
              <p>请拍摄或上传包含人物的照片</p>
            </div>
          )}

          {/* Scanning Overlay */}
          {status === AnalysisState.ANALYZING && <ScannerEffect />}
        </div>

        {/* Results Display */}
        {status === AnalysisState.SUCCESS && (
          <div className="w-full animate-slide-up space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> 
                检测结果 ({results.length}人)
              </h2>
            </div>
            
            {results.map((person, index) => (
              <div key={index} className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg transform transition-all hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-xs font-bold flex items-center justify-center text-slate-300">
                      #{index + 1}
                    </div>
                    <span className="text-sm text-slate-300 font-medium">{person.description}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark/50 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">性别</div>
                      <div className="text-lg font-bold text-white">{person.gender}</div>
                    </div>
                  </div>
                  <div className="bg-dark/50 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-secondary">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">年龄</div>
                      <div className="text-lg font-bold text-white">{person.age}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <div className="bg-surface/50 border border-white/10 rounded-2xl p-8 text-center text-slate-400">
                <p>未检测到清晰的人脸信息</p>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {status === AnalysisState.ERROR && (
          <div className="w-full animate-slide-up bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-200">
            <AlertCircle className="shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </main>

      {/* Bottom Control Bar (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark/90 backdrop-blur-lg border-t border-white/5 p-6 z-50 pb-8">
        <div className="flex justify-between items-center max-w-md mx-auto gap-4">
          
          {/* Hidden Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          {/* Button: Camera */}
          <button 
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors w-16"
            disabled={status === AnalysisState.ANALYZING}
          >
            <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Camera size={24} />
            </div>
            <span className="text-xs font-medium">拍照</span>
          </button>

          {/* Button: Detect (Main Action) */}
          <button
            onClick={handleAnalyze}
            disabled={!image || status === AnalysisState.ANALYZING}
            className={`
              flex-1 h-14 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
              ${!image || status === AnalysisState.ANALYZING
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary to-secondary text-white shadow-primary/25 hover:shadow-primary/40'
              }
            `}
          >
            {status === AnalysisState.ANALYZING ? (
              <>
                <Loader2 className="animate-spin" /> 分析中...
              </>
            ) : (
              <>
                <ScanFace /> 检测
              </>
            )}
          </button>

          {/* Button: Gallery */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors w-16"
            disabled={status === AnalysisState.ANALYZING}
          >
             <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <ImageIcon size={24} />
            </div>
            <span className="text-xs font-medium">相册</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
