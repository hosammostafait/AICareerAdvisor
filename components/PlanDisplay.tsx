import React, { useState } from 'react';
import { AIPlanResponse, VideoRecommendation, ToolCategory, ToolRecommendation, CourseRecommendation } from '../types';
import { 
    YoutubeIcon, 
    CheckCircleIcon, 
    ArrowLeftIcon, 
    BrainIcon,
    PencilIcon,
    ImageIcon,
    VideoIcon,
    CodeIcon,
    BriefcaseIcon,
    PaletteIcon,
    ExternalLinkIcon,
    CopyIcon,
    SquareCheckIcon,
    ShareIcon,
    AcademicCapIcon,
    BookOpenIcon,
    WhatsappIcon,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon
} from './Icons';

interface PlanDisplayProps {
  plan: AIPlanResponse;
  onReset: () => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset }) => {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [sharedTool, setSharedTool] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleYoutubeClick = (video: VideoRecommendation) => {
    if (video.url) {
        window.open(video.url, '_blank');
    } else {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`;
        window.open(url, '_blank');
    }
  };

  const toggleStep = (idx: number) => {
      setCompletedSteps(prev => 
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
  };

  const getPlanText = () => {
    return `
خطة العمل من "المسار الذكي" 🚀

${plan.greeting}

🛠️ أدوات مقترحة:
${plan.tools.map(t => `- ${t.name} (${t.isPaid ? 'مدفوع' : 'مجاني'}): ${t.description}\n  الرابط: ${t.url}`).join('\n')}

🎓 دورات مقترحة:
${plan.courses.map(c => `- ${c.title} [${c.platform}]: ${c.url}`).join('\n')}

📖 مقالات مقترحة:
${plan.articles.map(a => `- ${a.title}: ${a.url}`).join('\n')}

📺 فيديوهات مقترحة:
${plan.videos.map(v => `- ${v.title}: ${v.url || v.searchQuery}`).join('\n')}

✅ خطوات العمل:
${plan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

💡 نصائح:
${plan.tips.map(t => `- ${t}`).join('\n')}
    `.trim();
  };

  const handleCopyPlan = () => {
      navigator.clipboard.writeText(getPlanText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReport = async () => {
    const text = getPlanText();
    const shareData = {
        title: 'خطتي من المسار الذكي',
        text: text,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error sharing', err);
        }
    } else {
        setShowShareMenu(!showShareMenu);
    }
  };

  const shareOnSocial = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin') => {
      const text = encodeURIComponent(getPlanText());
      const url = encodeURIComponent(window.location.href);
      let shareUrl = '';

      switch (platform) {
          case 'whatsapp':
              shareUrl = `https://wa.me/?text=${text}`;
              break;
          case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('خطتي المهنية من المسار الذكي 🚀')}&url=${url}`;
              break;
          case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
              break;
          case 'linkedin':
              shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
              break;
      }
      window.open(shareUrl, '_blank');
      setShowShareMenu(false);
  };

  const handleShareTool = async (tool: ToolRecommendation) => {
      const shareData = {
          title: tool.name,
          text: `جرب هذه الأداة الرائعة: ${tool.name}\n${tool.description}`,
          url: tool.url,
      };

      try {
          if (navigator.share) {
              await navigator.share(shareData);
          } else {
              const text = `${shareData.text}\n${shareData.url}`;
              await navigator.clipboard.writeText(text);
              setSharedTool(tool.name);
              setTimeout(() => setSharedTool(null), 2000);
          }
      } catch (err) {
          console.error('Error sharing:', err);
      }
  };

  const filteredTools = plan.tools.filter(tool => {
      if (filter === 'free') return !tool.isPaid;
      if (filter === 'paid') return tool.isPaid;
      return true;
  });

  const getCategoryIcon = (category: ToolCategory) => {
      switch (category) {
          case 'writing': return <PencilIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
          case 'image': return <ImageIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
          case 'video': return <VideoIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
          case 'coding': return <CodeIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />;
          case 'productivity': return <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
          case 'design': return <PaletteIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
          default: return <BrainIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      }
  };

  const getCategoryLabel = (category: ToolCategory) => {
     const labels: Record<ToolCategory, string> = {
         writing: 'كتابة وتحرير',
         image: 'صور وجرافيك',
         video: 'فيديو ومونتاج',
         coding: 'برمجة وكود',
         productivity: 'إنتاجية وتنظيم',
         design: 'تصميم وإبداع',
         other: 'عام'
     };
     return labels[category] || 'عام';
  };

  // Group courses by platform
  const coursesByPlatform = plan.courses.reduce((acc, course) => {
      const platform = course.platform;
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(course);
      return acc;
  }, {} as Record<string, CourseRecommendation[]>);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header / Greeting */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <button 
                    type="button"
                    onClick={onReset}
                    className="flex items-center gap-2 text-indigo-100 hover:text-white transition-colors text-sm font-medium bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    بحث جديد
                </button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={handleShareReport}
                            className="flex items-center gap-2 text-indigo-600 bg-white hover:bg-slate-50 transition-colors text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
                        >
                            <ShareIcon className="w-4 h-4" />
                            مشاركة
                        </button>
                        {showShareMenu && (
                            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 flex flex-col gap-1 min-w-[150px] z-20 animate-fade-in">
                                <button onClick={() => shareOnSocial('whatsapp')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium w-full text-right">
                                    <WhatsappIcon className="w-5 h-5 text-green-500" /> واتساب
                                </button>
                                <button onClick={() => shareOnSocial('facebook')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium w-full text-right">
                                    <FacebookIcon className="w-5 h-5 text-blue-600" /> فيسبوك
                                </button>
                                <button onClick={() => shareOnSocial('twitter')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium w-full text-right">
                                    <TwitterIcon className="w-5 h-5 text-sky-500" /> تويتر
                                </button>
                                <button onClick={() => shareOnSocial('linkedin')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium w-full text-right">
                                    <LinkedinIcon className="w-5 h-5 text-blue-700" /> لينكد إن
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={handleCopyPlan}
                        className="flex items-center gap-2 text-indigo-600 bg-white hover:bg-slate-50 transition-colors text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
                    >
                        {copied ? (
                            <>تم النسخ</>
                        ) : (
                            <>
                                <CopyIcon className="w-4 h-4" />
                                نسخ
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 leading-tight">{plan.greeting}</h1>
            <p className="text-indigo-100 opacity-90 text-lg">إليك خطة العمل المخصصة لتعزيز إنتاجيتك.</p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>
      </div>

      {/* 1. Tools Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <BrainIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">أدوات ننصح بها</h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl w-fit">
                {(['all', 'free', 'paid'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            filter === f 
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {f === 'all' ? 'الكل' : f === 'free' ? 'مجاني' : 'مدفوع'}
                    </button>
                ))}
            </div>
        </div>
        
        {filteredTools.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">لا توجد أدوات في هذا التصنيف حالياً.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((tool, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group flex flex-col h-full relative">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-700 ring-1 ring-slate-100 dark:ring-slate-600`}>
                            {getCategoryIcon(tool.category)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.name}</h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getCategoryLabel(tool.category)}</span>
                        </div>
                    </div>
                    {tool.isPaid ? (
                        <span className="px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-700">
                            مدفوع
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-700">
                            مجاني
                        </span>
                    )}
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed flex-grow">{tool.description}</p>
                
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mb-4">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">كيف تستخدمها:</span>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">{tool.usage}</p>
                </div>

                <div className="mt-auto grid grid-cols-[1fr,auto] gap-2">
                    <a 
                        href={tool.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-100 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-600 dark:hover:bg-indigo-600 transition-colors border border-transparent dark:border-slate-600"
                    >
                        زيارة الموقع
                        <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                    <button
                        onClick={() => handleShareTool(tool)}
                        className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-colors"
                        title={sharedTool === tool.name ? "تم النسخ" : "مشاركة"}
                    >
                         {sharedTool === tool.name ? <CheckCircleIcon className="w-4 h-4 text-green-600" /> : <ShareIcon className="w-4 h-4" />}
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
      </section>

      {/* New Professional Courses Section */}
      <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                <AcademicCapIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">دورات احترافية مقترحة</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plan.courses.map((course, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col h-full group">
                    <div className={`h-2 w-full ${
                        course.platform.toLowerCase().includes('udemy') ? 'bg-purple-600' : 
                        course.platform.toLowerCase().includes('coursera') ? 'bg-blue-600' :
                        course.platform.toLowerCase().includes('linkedin') ? 'bg-blue-800' :
                        'bg-indigo-500'
                    }`}></div>
                    <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-3">
                             <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400 rounded">
                                 {course.platform}
                             </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {course.title}
                        </h3>
                        {course.instructor && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                {course.instructor}
                            </p>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed flex-grow">
                            {course.summary}
                        </p>
                        <a 
                            href={course.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-auto w-full py-2.5 rounded-lg border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm text-center transition-all flex items-center justify-center gap-2"
                        >
                            تصفح الدورة
                            <ExternalLinkIcon className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
        {plan.courses.length === 0 && (
            <div className="text-center py-8 text-slate-500">لم يتم العثور على دورات محددة لهذا المجال.</div>
        )}
      </section>

      {/* New Articles Section */}
      <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                <BookOpenIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">مقالات من "اكتب صح"</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
            {plan.articles.map((article, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-4 hover:shadow-md transition-shadow">
                     <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-3 rounded-full flex-shrink-0 mt-1">
                        <BookOpenIcon className="w-6 h-6" />
                    </div>
                    <div>
                         <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">{article.title}</h3>
                         <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{article.summary}</p>
                         <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-600 dark:text-orange-400 text-sm font-bold flex items-center gap-1 hover:underline"
                        >
                            قراءة المقال
                            <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 2. YouTube Learning */}
      <section>
         <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                <YoutubeIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">تعلم من YouTube</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {plan.videos.map((video, idx) => (
            <div 
                key={idx} 
                onClick={() => handleYoutubeClick(video)}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-red-200 dark:hover:border-red-800 hover:ring-2 hover:ring-red-50 dark:hover:ring-red-900/20 transition-all flex items-start gap-4"
            >
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-full flex-shrink-0 mt-1">
                 <YoutubeIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">{video.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{video.summary}</p>
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 hover:underline">
                    شاهد الآن
                    <ArrowLeftIcon className="w-3 h-3 rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Three Step Plan (Interactive Checklist) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                <CheckCircleIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">خطة البداية الفورية</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {plan.steps.map((step, idx) => {
                const isCompleted = completedSteps.includes(idx);
                return (
                <div 
                    key={idx} 
                    onClick={() => toggleStep(idx)}
                    className={`p-6 flex gap-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${idx !== plan.steps.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
                >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                        isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    }`}>
                        {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div className="pt-0.5">
                        <p className={`text-lg leading-relaxed transition-all ${
                            isCompleted 
                            ? 'text-slate-400 dark:text-slate-500 line-through' 
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                            {step}
                        </p>
                        {isCompleted && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold mt-1 block">تم الإنجاز! أحسنت 👏</span>
                        )}
                    </div>
                </div>
            )})}
        </div>
      </section>

      {/* 4. Tips */}
      <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800/50">
        <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-4 text-lg">💡 نصائح ذهبية للتركيز</h3>
        <ul className="space-y-3">
            {plan.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-3 text-amber-900 dark:text-amber-200">
                    <span className="text-amber-500">•</span>
                    {tip}
                </li>
            ))}
        </ul>
      </section>

    </div>
  );
};

export default PlanDisplay;