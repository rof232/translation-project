import React, { useState, useEffect } from 'react';
import { BarChart, Clock, Book, ArrowUp } from 'lucide-react';

interface ProgressStats {
  totalWords: number;
  translatedWords: number;
  timeSpent: number; // in minutes
  chaptersCompleted: number;
  totalChapters: number;
  averageSpeed: number; // words per minute
}

const ProgressTracker: React.FC = () => {
  const [stats, setStats] = useState<ProgressStats>({
    totalWords: 0,
    translatedWords: 0,
    timeSpent: 0,
    chaptersCompleted: 0,
    totalChapters: 0,
    averageSpeed: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const loadStats = () => {
      const savedStats = localStorage.getItem('translationProgress');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    };

    loadStats();
  }, []);

  const updateStats = (newStats: Partial<ProgressStats>) => {
    setStats(prev => {
      const updated = { ...prev, ...newStats };
      localStorage.setItem('translationProgress', JSON.stringify(updated));
      return updated;
    });
  };

  const calculateProgress = () => {
    return (stats.translatedWords / stats.totalWords) * 100 || 0;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
          تتبع التقدم
        </h2>
        <p className="text-gray-400">إحصائيات وتقدم الترجمة</p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-cyan-500/20 text-cyan-400">
                التقدم
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-cyan-400">
                {calculateProgress().toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-white/5">
            <div
              style={{ width: `${calculateProgress()}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-500 to-indigo-500"
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Book className="text-cyan-400" size={20} />
            <span className="text-gray-400">الكلمات</span>
          </div>
          <div className="text-2xl font-semibold text-white">
            {stats.translatedWords.toLocaleString()} / {stats.totalWords.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-cyan-400" size={20} />
            <span className="text-gray-400">الوقت المستغرق</span>
          </div>
          <div className="text-2xl font-semibold text-white">
            {formatTime(stats.timeSpent)}
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="text-cyan-400" size={20} />
            <span className="text-gray-400">الفصول المكتملة</span>
          </div>
          <div className="text-2xl font-semibold text-white">
            {stats.chaptersCompleted} / {stats.totalChapters}
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="text-cyan-400" size={20} />
            <span className="text-gray-400">متوسط السرعة</span>
          </div>
          <div className="text-2xl font-semibold text-white">
            {stats.averageSpeed.toFixed(1)} كلمة/دقيقة
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart would go here */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">تقدم الأسبوع</h3>
        {/* Add chart component here */}
      </div>
    </div>
  );
};

export default ProgressTracker;
