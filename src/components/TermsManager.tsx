import React, { useState, useEffect } from 'react';

interface Term {
  id: string;
  original: string;
  translation: string;
  category: string; // مثل: اسم_شخصية، مكان، مهارة
  notes?: string;
}

interface TermsManagerProps {
  onTermAdd: (term: Term) => void;
  onTermUpdate: (term: Term) => void;
  onTermDelete: (id: string) => void;
  terms: Term[];
}

export const TermsManager: React.FC<TermsManagerProps> = ({
  onTermAdd,
  onTermUpdate,
  onTermDelete,
  terms
}) => {
  const [newTerm, setNewTerm] = useState<Partial<Term>>({
    original: '',
    translation: '',
    category: 'اسم_شخصية',
    notes: ''
  });

  const categories = [
    { id: 'اسم_شخصية', label: 'اسم شخصية' },
    { id: 'مكان', label: 'مكان' },
    { id: 'مهارة', label: 'مهارة' },
    { id: 'آخر', label: 'آخر' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTerm.original && newTerm.translation) {
      onTermAdd({
        ...newTerm,
        id: Date.now().toString()
      } as Term);
      setNewTerm({
        original: '',
        translation: '',
        category: 'اسم_شخصية',
        notes: ''
      });
    }
  };

  return (
    <div className="bg-[#24283b] rounded-xl p-6 shadow-lg border border-[#414868]">
      <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
        إدارة المصطلحات
      </h2>

      {/* نموذج إضافة مصطلح جديد */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={newTerm.original}
            onChange={(e) => setNewTerm({ ...newTerm, original: e.target.value })}
            placeholder="النص الأصلي"
            className="bg-[#1a1b26] text-gray-200 rounded-lg p-2 border border-[#414868] focus:outline-none focus:border-blue-400"
          />
          <input
            type="text"
            value={newTerm.translation}
            onChange={(e) => setNewTerm({ ...newTerm, translation: e.target.value })}
            placeholder="الترجمة"
            className="bg-[#1a1b26] text-gray-200 rounded-lg p-2 border border-[#414868] focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={newTerm.category}
            onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
            className="bg-[#1a1b26] text-gray-200 rounded-lg p-2 border border-[#414868] focus:outline-none focus:border-blue-400"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newTerm.notes}
            onChange={(e) => setNewTerm({ ...newTerm, notes: e.target.value })}
            placeholder="ملاحظات (اختياري)"
            className="bg-[#1a1b26] text-gray-200 rounded-lg p-2 border border-[#414868] focus:outline-none focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 transition-colors"
        >
          إضافة مصطلح
        </button>
      </form>

      {/* قائمة المصطلحات */}
      <div className="space-y-4">
        {terms.map((term) => (
          <div
            key={term.id}
            className="bg-[#1a1b26] rounded-lg p-4 border border-[#414868]"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <span className="text-blue-400">{term.original}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-400">{term.translation}</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  <span className="bg-[#414868] px-2 py-0.5 rounded text-xs">
                    {categories.find(cat => cat.id === term.category)?.label}
                  </span>
                  {term.notes && <span className="mr-2">{term.notes}</span>}
                </div>
              </div>
              <button
                onClick={() => onTermDelete(term.id)}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermsManager;
