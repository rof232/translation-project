import { useEffect } from 'react';

const ADMIN_PASSWORD = 'admin123'; // في البيئة الحقيقية، يجب تخزين هذا في مكان آمن

const AdminControl = () => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // التحقق من ضغط CTRL + Q
      if (event.ctrlKey && event.key === 'q') {
        event.preventDefault();
        
        // طلب كلمة المرور
        const password = prompt('أدخل كلمة مرور المشرف:');
        
        if (password === ADMIN_PASSWORD) {
          // إغلاق النافذة
          window.close();
          
          // في حالة عدم دعم window.close(), نستخدم طريقة بديلة
          if (!window.closed) {
            alert('تم تسجيل الخروج. يمكنك إغلاق النافذة يدوياً.');
          }
        } else {
          alert('كلمة المرور غير صحيحة!');
        }
      }
    };

    // إضافة event listener
    window.addEventListener('keydown', handleKeyPress);

    // تنظيف event listener عند إزالة المكون
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return null; // هذا المكون لا يحتاج إلى عرض أي شيء
};

export default AdminControl;
