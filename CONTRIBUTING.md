# دليل المساهمة في المترجم الذكي 🌟

نحن سعداء جداً باهتمامك بالمساهمة في مشروع المترجم الذكي! هذا الدليل سيساعدك في عملية المساهمة.

## 🚀 كيفية البدء

1. **تجهيز بيئة التطوير**
   ```bash
   # نسخ المشروع
   git clone https://github.com/yourusername/ai-translator.git
   cd ai-translator

   # تثبيت اعتمادات الواجهة الأمامية
   npm install

   # تثبيت اعتمادات الخلفية
   python -m venv .venv
   source .venv/bin/activate  # أو `.venv\Scripts\activate` في Windows
   cd backend
   pip install -r requirements.txt
   ```

2. **إنشاء فرع جديد**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 معايير الكود

### الواجهة الأمامية (TypeScript/React)
- استخدم TypeScript لجميع الملفات الجديدة
- اتبع معايير ESLint المحددة
- اكتب تعليقات توضيحية للوظائف المعقدة
- استخدم أسماء وصفية للمتغيرات والوظائف
- قم بتنظيم المكونات في مجلدات منطقية

### الخلفية (Python/FastAPI)
- اتبع معايير PEP 8
- وثق جميع الوظائف والفئات باستخدام docstrings
- استخدم Type Hints
- اكتب اختبارات لكل وظيفة جديدة

## ✅ الاختبارات

### اختبارات الواجهة الأمامية
```bash
# تشغيل اختبارات Vitest
npm run test

# فحص أنواع TypeScript
npm run typecheck
```

### اختبارات الخلفية
```bash
# في مجلد backend
pytest tests/
```

## 📚 التوثيق

- أضف تعليقات توضيحية للكود
- حدّث README.md إذا أضفت ميزات جديدة
- وثق أي تغييرات في API في الوثائق
- أضف تغييراتك إلى CHANGELOG.md

## 🔄 عملية المساهمة

1. **تحديث فرعك**
   ```bash
   git fetch origin
   git rebase origin/master
   ```

2. **اختبار التغييرات**
   - تأكد من اجتياز جميع الاختبارات
   - اختبر الميزات يدوياً
   - تأكد من عدم وجود أخطاء TypeScript

3. **تقديم التغييرات**
   ```bash
   git add .
   git commit -m "وصف واضح للتغييرات"
   git push origin feature/your-feature-name
   ```

4. **إنشاء Pull Request**
   - استخدم عنواناً وصفياً
   - اشرح التغييرات بالتفصيل
   - أضف صور للتغييرات المرئية إن وجدت

## 🐛 الإبلاغ عن المشاكل

عند الإبلاغ عن مشكلة، يرجى تضمين:
- خطوات إعادة إنتاج المشكلة
- السلوك المتوقع والفعلي
- رسائل الخطأ وسجلات التصحيح
- بيئة التشغيل (المتصفح، نظام التشغيل، الإصدارات)

## 📖 موارد مفيدة

- [وثائق FastAPI](https://fastapi.tiangolo.com/)
- [وثائق React](https://react.dev/)
- [وثائق TypeScript](https://www.typescriptlang.org/docs/)
- [معايير PEP 8](https://peps.python.org/pep-0008/)

## 🤝 مدونة السلوك

نتوقع من جميع المساهمين:
- احترام الآخرين وآرائهم
- تقديم نقد بناء
- التركيز على ما هو أفضل للمجتمع
- إظهار التعاطف تجاه المساهمين الآخرين

## 📄 الترخيص

بالمساهمة في هذا المشروع، فإنك توافق على ترخيص مساهمتك تحت نفس [ترخيص MIT](LICENSE).
