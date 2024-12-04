import React, { useState, useEffect } from 'react';
import { Book, Search, Plus, Edit, Trash } from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  translation: string;
  context?: string;
  category?: string;
  notes?: string;
}

const NovelGlossary: React.FC = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Load terms from local storage or API
    const loadTerms = async () => {
      try {
        const storedTerms = localStorage.getItem('novelGlossaryTerms');
        if (storedTerms) {
          setTerms(JSON.parse(storedTerms));
        }
      } catch (error) {
        console.error('Error loading terms:', error);
      }
    };

    loadTerms();
  }, []);

  const addTerm = (newTerm: GlossaryTerm) => {
    setTerms(prev => {
      const updated = [...prev, newTerm];
      localStorage.setItem('novelGlossaryTerms', JSON.stringify(updated));
      return updated;
    });
  };

  const updateTerm = (id: string, updatedTerm: Partial<GlossaryTerm>) => {
    setTerms(prev => {
      const updated = prev.map(term => 
        term.id === id ? { ...term, ...updatedTerm } : term
      );
      localStorage.setItem('novelGlossaryTerms', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTerm = (id: string) => {
    setTerms(prev => {
      const updated = prev.filter(term => term.id !== id);
      localStorage.setItem('novelGlossaryTerms', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
          قاموس المصطلحات
        </h2>
        <p className="text-gray-400">إدارة مصطلحات الرواية وترجماتها</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث في المصطلحات..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">جميع الفئات</option>
          <option value="characters">شخصيات</option>
          <option value="places">أماكن</option>
          <option value="items">أغراض</option>
          <option value="skills">مهارات</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      {/* Terms List */}
      <div className="space-y-4">
        {filteredTerms.map(term => (
          <div
            key={term.id}
            className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">{term.term}</h3>
                <p className="text-cyan-400">{term.translation}</p>
                {term.context && (
                  <p className="text-sm text-gray-400 mt-1">{term.context}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateTerm(term.id, {})}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={() => deleteTerm(term.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Trash size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Term Button */}
      <button
        className="mt-6 w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        onClick={() => {
          addTerm({
            id: Date.now().toString(),
            term: '',
            translation: '',
            category: 'other'
          });
        }}
      >
        <Plus size={20} />
        إضافة مصطلح جديد
      </button>
    </div>
  );
};

export default NovelGlossary;
