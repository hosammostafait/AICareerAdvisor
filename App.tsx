
import React, { useState, useEffect } from 'react';
import { AppState, UserInput, AIPlanResponse } from './types';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';
import { generatePlan } from './services/geminiService';
import { BrainIcon, SunIcon, MoonIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [plan, setPlan] = useState<AIPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleFormSubmit = async (data: UserInput) => {
    setAppState('loading');
    setError(null);
    try {
      const generatedPlan = await generatePlan(data);
      setPlan(generatedPlan);
      setAppState('results');
    } catch (err: any) {
      console.error(err);
      if (err.message === "MISSING_KEY") {
        setError("مفتاح الـ API غير مفعّل. إذا كنت صاحب الموقع، تأكد من إضافة API_KEY في إعدادات Netlify.");
      } else if (err.message === "INVALID_KEY") {
        setError("مفتاح الـ API غير صالح أو محظور. يرجى التأكد من صلاحية المفتاح في Google AI Studio.");
      } else {
        setError("حدث خطأ أثناء التواصل مع المساعد الذكي. يرجى المحاولة مرة أخرى لاحقاً.");
      }
      setAppState('error');
    }
  };

  const handleReset = () => {
    setPlan(null);
    setAppState('input');
    setError(null);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 no-print transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={handleReset}>
            <BrainIcon className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">المسار الذكي</span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
             </button>
             <div className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">نسخة تجريبية</div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
        {appState === 'input' && <InputForm onSubmit={handleFormSubmit} isLoading={false} />}

        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-6 relative animate-pulse">
                <BrainIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
             </div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">جار تحضير خطتك...</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-sm">نحلل الآن بياناتك لتقديم أفضل النصائح المخصصة.</p>
          </div>
        )}

        {appState === 'results' && plan && <PlanDisplay plan={plan} onReset={handleReset} />}

        {appState === 'error' && (
           <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-center max-w-md border border-red-100 dark:border-red-900/30">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">تنبيه</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{error}</p>
              <button onClick={() => setAppState('input')} className="w-full bg-slate-800 dark:bg-slate-700 text-white py-3 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors font-semibold">حاول مرة أخرى</button>
           </div>
        )}
      </main>
      
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-auto transition-colors">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
            <p className="mb-2">مبادرة الذكاء الاصطناعي ببساطة 2025 - برومبت وتصميم حسام مصطفى إبراهيم</p>
            <p className="text-xs opacity-75">تم التطوير بواسطة Google Gemini API</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
