import React, { useState } from 'react';
import { Book, Tag, Search, Plus, Filter, ArrowUpDown, Edit2, Trash2 } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  translation: string;
  novelType: string[];
  context?: string;
  usage_count: number;
  lastUsed?: string;
}

const NovelGlossary: React.FC = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNovelType, setSelectedNovelType] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'usage' | 'recent'>('usage');

  const novelTypes = [
    { id: 'cultivation', name: 'تطور القوى', color: 'bg-red-500' },
    { id: 'martial', name: 'فنون قتالية', color: 'bg-orange-500' },
    { id: 'fantasy', name: 'خيال', color: 'bg-blue-500' },
    { id: 'romance', name: 'رومانسي', color: 'bg-pink-500' },
    { id: 'modern', name: 'معاصر', color: 'bg-green-500' },
    { id: 'historical', name: 'تاريخي', color: 'bg-purple-500' }
  ];

  const addTerm = (newTerm: GlossaryTerm) => {
    setTerms([...terms, newTerm]);
    setShowAddModal(false);
  };

  const searchTerms = () => {
    return terms
      .filter(term => 
        (term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.translation.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedNovelType.length === 0 || term.novelType.some(type => selectedNovelType.includes(type)))
      )
      .sort((a, b) => {
        if (sortBy === 'usage') {
          return b.usage_count - a.usage_count;
        } else {
          return new Date(b.lastUsed || '').getTime() - new Date(a.lastUsed || '').getTime();
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-3">
                <Book className="h-8 w-8" />
                قاموس المصطلحات
              </h1>
              <p className="text-gray-400 mt-2">إدارة وتنظيم مصطلحات روايات الويب</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              إضافة مصطلح جديد
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Search */}
            <div className="col-span-1">
              <div className="relative">
                <Search className="absolute right-4 top-3.5 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="البحث في المصطلحات..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-900/50 text-gray-200 rounded-xl border border-white/10 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Novel Types Filter */}
            <div className="col-span-2">
              <div className="flex flex-wrap gap-2">
                {novelTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      if (selectedNovelType.includes(type.id)) {
                        setSelectedNovelType(selectedNovelType.filter(t => t !== type.id));
                      } else {
                        setSelectedNovelType([...selectedNovelType, type.id]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                      selectedNovelType.includes(type.id)
                        ? `${type.color} text-white`
                        : 'bg-slate-900/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Tag className="h-4 w-4" />
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-4 bg-slate-900/50 rounded-lg p-2">
              <button
                onClick={() => setSortBy('usage')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  sortBy === 'usage' ? 'bg-white/10 text-cyan-400' : 'text-gray-400'
                }`}
              >
                <Filter className="h-4 w-4" />
                الأكثر استخداماً
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  sortBy === 'recent' ? 'bg-white/10 text-cyan-400' : 'text-gray-400'
                }`}
              >
                <ArrowUpDown className="h-4 w-4" />
                الأحدث
              </button>
            </div>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchTerms().map((term, index) => (
              <div
                key={index}
                className="group bg-slate-900/50 rounded-xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-200">{term.term}</h3>
                    <p className="text-cyan-400 mt-1">{term.translation}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-400">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {term.context && (
                  <p className="text-gray-400 text-sm mb-4">{term.context}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {term.novelType.map(type => {
                    const typeInfo = novelTypes.find(t => t.id === type);
                    return (
                      <span
                        key={type}
                        className={`px-3 py-1 rounded-full text-xs ${typeInfo?.color} bg-opacity-20 text-white`}
                      >
                        {typeInfo?.name}
                      </span>
                    );
                  })}
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>استخدم {term.usage_count} مرة</span>
                  {term.lastUsed && (
                    <span>آخر استخدام: {new Date(term.lastUsed).toLocaleDateString('ar-SA')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelGlossary;
