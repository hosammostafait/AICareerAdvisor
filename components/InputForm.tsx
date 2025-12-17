import React, { useState } from 'react';
import { UserInput, ExperienceLevel } from '../types';
import { SparklesIcon } from './Icons';

const StepIcon = ({ number }: { number: string }) => (
  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 font-bold text-xl shadow-sm border border-indigo-200 dark:border-indigo-800">
    {number}
  </div>
);

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [profession, setProfession] = useState('');
  const [tasks, setTasks] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.BEGINNER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profession.trim() && tasks.trim()) {
      onSubmit({ profession, tasks, experience });
    }
  };

  const suggestions = [
      { label: '👨‍🏫 معلم', prof: 'معلم مدرسي', task: 'تحضير الدروس، إنشاء اختبارات، متابعة الطلاب' },
      { label: '📈 مسوق', prof: 'مسوق رقمي', task: 'كتابة محتوى إعلاني، تحليل الحملات، تصميم بوستات' },
      { label: '💰 محاسب', prof: 'محاسب مالي', task: 'إعداد القوائم المالية، تحليل البيانات، إدخال الفواتير' },
      { label: '💻 مبرمج', prof: 'مطور واجهات', task: 'كتابة كود نظيف، تصحيح الأخطاء، توثيق البرمجيات' },
  ];

  const handleSuggestionClick = (s: typeof suggestions[0]) => {
      setProfession(s.prof);
      setTasks(s.task);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg shadow-indigo-500/20">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">مساعدك الذكي للتميز المهني</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            اكتشف كيف يمكن للذكاء الاصطناعي أن يسهل عملك اليومي ويزيد إنتاجيتك بخطوات بسيطة ومخصصة لك.
          </p>
        </div>

        {/* Steps Section - Moved to Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-12 border-b border-slate-100 dark:border-slate-700 pb-10">
            <div className="p-2">
            <StepIcon number="1" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">أدخل بياناتك</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                اكتب مهنتك والمهام التي تشغلك وسنقوم بتحليل احتياجاتك بدقة.
            </p>
            </div>
            <div className="p-2 relative">
             {/* Connector Line for Desktop */}
            <div className="hidden md:block absolute top-6 -right-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent z-0"></div>
            <div className="relative z-10">
                <StepIcon number="2" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">حلل بذكاء</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    محركنا الذكي يختار لك أفضل الأدوات والفيديوهات التعليمية المناسبة لمستواك.
                </p>
            </div>
            </div>
            <div className="p-2">
            <StepIcon number="3" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">انطلق فوراً</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                احصل على خطة عملية وخطوات واضحة للتطبيق في عملك من اليوم.
            </p>
            </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
              {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800/50"
                  >
                      {s.label}
                  </button>
              ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="profession" className="block text-sm font-bold text-slate-700 dark:text-slate-200">
              ما هي مهنتك الحالية؟
            </label>
            <input
              id="profession"
              type="text"
              required
              className="w-full px-5 py-4 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
              placeholder="مثال: معلم لغة عربية، محاسب، صانع محتوى..."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tasks" className="block text-sm font-bold text-slate-700 dark:text-slate-200">
               ما المهام التي تريد إنجازها بذكاء؟
            </label>
            <textarea
              id="tasks"
              required
              className="w-full px-5 py-4 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 min-h-[120px] shadow-sm resize-none"
              placeholder="مثال: تحضير الدروس، كتابة تقارير، تصميم صور، تلخيص اجتماعات..."
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
              مستوى خبرتك التقنية
            </label>
            <div className="grid grid-cols-3 gap-4">
              {Object.values(ExperienceLevel).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all duration-200 ${
                    experience === level
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 transform -translate-y-0.5'
                      : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setExperience(level)}
                  disabled={isLoading}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !profession.trim() || !tasks.trim()}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                جار إعداد خطتك...
              </>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                اصنع خطتي الآن
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;