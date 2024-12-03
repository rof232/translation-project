import { WritingStyle, AutoCorrection } from './types';

export class TextAnalysisService {
  async analyzeWritingStyle(text: string): Promise<WritingStyle> {
    // تحليل النص وتحديد الأسلوب
    const formalityScore = this.calculateFormality(text);
    const toneScore = this.analyzeTone(text);
    const complexityScore = this.calculateComplexity(text);
    const descriptiveScore = this.analyzeDescriptiveness(text);
    const dialogueStyle = this.analyzeDialogueStyle(text);

    return {
      formality: formalityScore > 0.7 ? 'formal' : formalityScore < 0.3 ? 'informal' : 'mixed',
      tone: this.determineTone(toneScore),
      complexity: this.determineComplexity(complexityScore),
      descriptiveness: this.determineDescriptiveness(descriptiveScore),
      dialogueStyle: dialogueStyle
    };
  }

  async autoCorrect(text: string, targetLang: string): Promise<AutoCorrection[]> {
    const corrections: AutoCorrection[] = [];

    // تصحيح القواعد النحوية
    const grammarCorrections = await this.checkGrammar(text, targetLang);
    corrections.push(...grammarCorrections);

    // تصحيح الإملاء
    const spellingCorrections = await this.checkSpelling(text, targetLang);
    corrections.push(...spellingCorrections);

    // تصحيح علامات الترقيم
    const punctuationCorrections = await this.checkPunctuation(text, targetLang);
    corrections.push(...punctuationCorrections);

    return corrections;
  }

  private calculateFormality(text: string): number {
    // حساب درجة الرسمية باستخدام قواعد محددة
    const formalIndicators = [
      /حضرتك|سيادتك|فضيلتك|معالي/g,
      /يرجى|نرجو|نأمل/g,
      /وفقاً لـ|بناءً على/g
    ];

    const informalIndicators = [
      /انت|انتي/g,
      /عايز|عاوز/g,
      /كده|كدا/g
    ];

    let formalCount = formalIndicators.reduce((count, regex) => 
      count + (text.match(regex)?.length || 0), 0);
    let informalCount = informalIndicators.reduce((count, regex) => 
      count + (text.match(regex)?.length || 0), 0);

    const total = formalCount + informalCount;
    return total === 0 ? 0.5 : formalCount / total;
  }

  private analyzeTone(text: string): { [key: string]: number } {
    const toneIndicators = {
      serious: [/للأسف|للاسف|مع الأسف|خطير|هام|ضروري/g],
      humorous: [/هههه|😂|😄|نكتة|مضحك/g],
      dramatic: [/مأساوي|حزين|مؤلم|صادم|مفجع/g],
      neutral: [/يبدو|ربما|من المحتمل|قد/g]
    };

    const scores: { [key: string]: number } = {};
    Object.entries(toneIndicators).forEach(([tone, patterns]) => {
      scores[tone] = patterns.reduce((count, regex) => 
        count + (text.match(regex)?.length || 0), 0);
    });

    return scores;
  }

  private calculateComplexity(text: string): number {
    // حساب تعقيد النص باستخدام عدة معايير
    const sentenceCount = text.split(/[.!?؟]+/).length;
    const wordCount = text.split(/\s+/).length;
    const avgWordLength = text.length / wordCount;
    const avgSentenceLength = wordCount / sentenceCount;

    return (avgWordLength * 0.3 + avgSentenceLength * 0.7) / 10;
  }

  private analyzeDescriptiveness(text: string): number {
    const descriptivePatterns = [
      /وصف|يصف|كأن|مثل|يشبه/g,
      /جميل|رائع|مذهل|ساحر/g,
      /كبير|صغير|طويل|قصير/g
    ];

    return descriptivePatterns.reduce((score, pattern) => 
      score + (text.match(pattern)?.length || 0), 0) / text.length;
  }

  private analyzeDialogueStyle(text: string): 'direct' | 'indirect' | 'mixed' {
    const directDialogue = (text.match(/[""].*?[""]|[''].*?['']/g)?.length || 0);
    const indirectDialogue = (text.match(/قال|أخبر|ذكر|أجاب/g)?.length || 0);

    if (directDialogue > indirectDialogue * 2) return 'direct';
    if (indirectDialogue > directDialogue * 2) return 'indirect';
    return 'mixed';
  }

  private determineTone(scores: { [key: string]: number }): WritingStyle['tone'] {
    const maxTone = Object.entries(scores).reduce((max, [tone, score]) => 
      score > max.score ? { tone, score } : max, { tone: 'neutral', score: -1 });
    return maxTone.tone as WritingStyle['tone'];
  }

  private determineComplexity(score: number): WritingStyle['complexity'] {
    if (score < 0.4) return 'simple';
    if (score < 0.7) return 'moderate';
    return 'complex';
  }

  private determineDescriptiveness(score: number): WritingStyle['descriptiveness'] {
    if (score < 0.1) return 'minimal';
    if (score < 0.2) return 'moderate';
    return 'detailed';
  }

  private async checkGrammar(text: string, lang: string): Promise<AutoCorrection[]> {
    // هنا يمكن استخدام مكتبة خارجية أو API للتحقق من القواعد النحوية
    // مثال بسيط للتوضيح
    const corrections: AutoCorrection[] = [];
    const commonErrors = [
      { pattern: /كان سوف/g, replacement: 'سوف', type: 'grammar' },
      { pattern: /قد سوف/g, replacement: 'سوف', type: 'grammar' }
    ];

    commonErrors.forEach(({ pattern, replacement, type }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          corrections.push({
            original: match,
            corrected: replacement,
            type: 'grammar',
            confidence: 0.9
          });
        });
      }
    });

    return corrections;
  }

  private async checkSpelling(text: string, lang: string): Promise<AutoCorrection[]> {
    // يمكن استخدام قاموس أو API للتحقق من الإملاء
    const corrections: AutoCorrection[] = [];
    // إضافة منطق التحقق من الإملاء هنا
    return corrections;
  }

  private async checkPunctuation(text: string, lang: string): Promise<AutoCorrection[]> {
    const corrections: AutoCorrection[] = [];
    const rules = [
      { pattern: /\s+[،,]\s*/g, replacement: '، ', type: 'punctuation' },
      { pattern: /\s+[.]\s*/g, replacement: '. ', type: 'punctuation' },
      { pattern: /\s+[؟?]\s*/g, replacement: '؟ ', type: 'punctuation' }
    ];

    rules.forEach(({ pattern, replacement, type }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          corrections.push({
            original: match,
            corrected: replacement,
            type: 'punctuation',
            confidence: 0.95
          });
        });
      }
    });

    return corrections;
  }
}

export const textAnalysis = new TextAnalysisService();
