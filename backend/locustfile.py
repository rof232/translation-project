from locust import HttpUser, task, between

class TranslatorUser(HttpUser):
    # وقت الانتظار بين كل طلب وآخر (1-3 ثواني)
    wait_time = between(1, 3)
    
    @task(1)
    def test_translate(self):
        # اختبار نقطة النهاية للترجمة
        payload = {
            "text": "Hello, how are you?",
            "source_lang": "en",
            "target_lang": "ar"
        }
        self.client.post("/translate", json=payload)
    
    @task(2)
    def test_home(self):
        # اختبار الصفحة الرئيسية
        self.client.get("/")

    def on_start(self):
        """
        تشغيل عند بدء كل مستخدم محاكى
        يمكنك إضافة عمليات تسجيل الدخول هنا إذا كنت تحتاج إليها
        """
        pass
