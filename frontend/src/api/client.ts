import axios from 'axios';

// بنبني عنوان الباك اند من نفس عنوان السيرفر اللي فاتح منه الفرونت اند (مش localhost ثابت)
// عشان لو حد فتح البرنامج من جهاز تاني في نفس الشبكة (زي http://192.168.1.5:5173)
// الطلبات تروح لـ http://192.168.1.5:3000/api صح، مش لجهازه هو بالغلط
const backendHost = window.location.hostname;

export const api = axios.create({
  baseURL: `${window.location.protocol}//${backendHost}:3000/api`,
});

// إرفاق توكن الدخول تلقائيًا مع كل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('khazina_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// لو التوكن انتهى أو غير صالح، نرجّع المستخدم لصفحة الدخول
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('khazina_token');
      localStorage.removeItem('khazina_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
