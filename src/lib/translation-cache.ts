import { TranslationCache, CacheEntry } from './types';

class TranslationCacheService {
  private cache: TranslationCache = {};
  private readonly MAX_CACHE_SIZE = 1000; // عدد الترجمات المخزنة
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 ساعة بالميلي ثانية

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem('translationCache');
    if (stored) {
      this.cache = JSON.parse(stored);
      this.cleanExpiredEntries();
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('translationCache', JSON.stringify(this.cache));
  }

  private generateCacheKey(text: string, from: string, to: string): string {
    return `${from}:${to}:${text}`;
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    Object.entries(this.cache).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.CACHE_EXPIRY) {
        delete this.cache[key];
      }
    });
    this.saveToLocalStorage();
  }

  private enforceMaxSize() {
    const entries = Object.entries(this.cache);
    if (entries.length > this.MAX_CACHE_SIZE) {
      // حذف أقدم الإدخالات
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToRemove = sortedEntries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      entriesToRemove.forEach(([key]) => delete this.cache[key]);
      this.saveToLocalStorage();
    }
  }

  get(text: string, from: string, to: string): CacheEntry | null {
    const key = this.generateCacheKey(text, from, to);
    const entry = this.cache[key];
    
    if (!entry) return null;

    // التحقق من صلاحية الإدخال
    if (Date.now() - entry.timestamp > this.CACHE_EXPIRY) {
      delete this.cache[key];
      this.saveToLocalStorage();
      return null;
    }

    return entry;
  }

  set(text: string, from: string, to: string, entry: Omit<CacheEntry, 'timestamp'>) {
    const key = this.generateCacheKey(text, from, to);
    this.cache[key] = {
      ...entry,
      timestamp: Date.now()
    };

    this.enforceMaxSize();
    this.saveToLocalStorage();
  }

  clear() {
    this.cache = {};
    this.saveToLocalStorage();
  }
}

export const translationCache = new TranslationCacheService();
