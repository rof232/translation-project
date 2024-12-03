import React from 'react';
import { BarChart, Clock, BookOpen, CheckCircle } from 'lucide-react';

interface ChapterProgress {
  chapterNumber: number;
  title: string;
  wordCount: number;
  translatedWordCount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewing';
  lastEdited: string;
}

const ProgressTracker: React.FC = () => {
  const [chapters, setChapters] = React.useState<ChapterProgress[]>([]);
  const [timeRange, setTimeRange] = React.useState<'day' | 'week' | 'month'>('week');

  const calculateProgress = (chapter: ChapterProgress) => {
    return (chapter.translatedWordCount / chapter.wordCount) * 100;
  };

  const getTotalProgress = () => {
    const totalWords = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
    const totalTranslated = chapters.reduce((sum, chapter) => sum + chapter.translatedWordCount, 0);
    return totalWords > 0 ? (totalTranslated / totalWords) * 100 : 0;
  };

  const getStatusColor = (status: ChapterProgress['status']) => {
    const colors = {
      pending: 'bg-gray-200',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      reviewing: 'bg-yellow-500'
    };
    return colors[status];
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">إجمالي التقدم</h3>
            <BarChart className="text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${getTotalProgress()}%` }}
              ></div>
            </div>
            <p className="text-2xl font-bold mt-2">{getTotalProgress().toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">الفصول المكتملة</h3>
            <CheckCircle className="text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {chapters.filter(c => c.status === 'completed').length} / {chapters.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">معدل الترجمة اليومي</h3>
            <Clock className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {/* Calculate average daily word count */}
            1,234 كلمة
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <BookOpen className="mr-2" />
            تقدم الفصول
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <div key={chapter.chapterNumber} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">
                    الفصل {chapter.chapterNumber}: {chapter.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(chapter.status)}`}>
                    {chapter.status === 'completed' ? 'مكتمل' : 
                     chapter.status === 'in_progress' ? 'قيد التنفيذ' :
                     chapter.status === 'reviewing' ? 'قيد المراجعة' : 'معلق'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${calculateProgress(chapter)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{chapter.translatedWordCount} / {chapter.wordCount} كلمة</span>
                  <span>آخر تعديل: {chapter.lastEdited}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
