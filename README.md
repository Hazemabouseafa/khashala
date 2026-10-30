# منصة خُشـاله (Khashala) للإعلانات المبوبة 🌟

منصة إعلانات مبوبة عربية متكاملة وجاهزة للإنتاج (Production-Ready)، مصممة بأعلى معايير الأداء والأمان والتوافق مع بيئات الاستضافة الحديثة (**Coolify**, **VPS**, **Docker**).

---

## 🎨 الهوية البصرية الرسمية
- **الاسم التجاري**: خُشـاله (Khashala)
- **الشعار الرسمي**: أيقونة هندسية فاخرة تدمج حرف "خ" مع حلقة التداول اللانهائية ونجمة الثقة الذهبية.
- **الألوان المعتمدة**: الأزرق الملكي الداكن (`#0f172a` / `#1e3a8a`)، الأزرق المشع (`#2563eb` / `#38bdf8`)، والعنبر الذهبي (`#f59e0b`).
- **الملفات المتجهة**: متوفرة بصيغة SVG فائقة الدقة في `public/logo.svg` ومكون `src/components/ui/KhashalaLogo.tsx`.

---

## 🐳 النشر السريع على Coolify (طريقتان مدعومتان)

### الطريقة الأولى: نشر الحزمة المتكاملة عبر Docker Compose (موصى بها)
1. في لوحة تحكم **Coolify**: اختر **+ Create New Resource** -> **Docker Compose**.
2. اختر مستودع Git الخاص بك أو انسخ محتوى ملف `docker-compose.yml`.
3. اضبط المتغيرات البيئية (Environment Variables) في Coolify:
   ```env
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   JWT_SECRET=اكتب_هنا_مفتاح_سري_عشوائي_طويل_ومشفر
   POSTGRES_USER=khashala_user
   POSTGRES_PASSWORD=كلمة_مرور_قوية_لقاعدة_البيانات
   POSTGRES_DB=khashala_db
   ```
4. اضغط على **Deploy**! ستقوم الحاوية بتشغيل PostgreSQL و Next.js ومزامنة قاعدة البيانات وتجهيز مجلد الصور تلقائياً.

### الطريقة الثانية: نشر تطبيق Next.js مع قاعدة بيانات PostgreSQL خارجية في Coolify
1. أنشئ مورد **PostgreSQL** من Coolify واحصل على رابط الاتصال (`DATABASE_URL`).
2. أضف تطبيقك عبر **Git Source** واختر نوع البناء **Dockerfile**.
3. أضف وحدة تخزين دائمة (Persistent Storage) في قسم Storage داخل التطبيق:
   - **Source Path / Volume Name**: `khashala_uploads`
   - **Destination Path**: `/app/public/uploads`
   *(هذه الخطوة أساسية لضمان عدم ضياع صور الإعلانات عند إعادة بناء الحاوية)*.
4. عيّن المتغيرات البيئية:
   - `DATABASE_URL`: رابط اتصال قاعدة البيانات PostgreSQL
   - `JWT_SECRET`: مفتاح تشفير الجلسات
   - `NEXT_PUBLIC_APP_URL`: رابط موقعك المباشر مع HTTPS
5. اضغط **Deploy**.

---

## 🖥️ النشر المباشر على أي VPS (Ubuntu / Debian)

### باستخدام Docker Compose:
```bash
# 1. استنساخ المستودع
git clone https://github.com/your-repo/khashala.git
cd khashala

# 2. نسخ وضبط ملف الإعدادات
cp .env.production.example .env

# 3. تشغيل الحاويات في الخلفية
docker compose up -d --build

# 4. التحقق من السجلات
docker compose logs -f web
```

---

## 🛡️ إعداد حساب المشرف في بيئة الإنتاج لأول مرة

لإنشاء حساب المشرف الأساسي على السيرفر بعد التشغيل:
```bash
# داخل حاوية التطبيق أو عبر السيرفر:
npm run prisma:seed
```
أو ببساطة قم بالتسجيل من واجهة الموقع `/auth/register` ثم قم بتعديل قيمة `role` في جدول `User` إلى `ADMIN` عبر Prisma Studio أو لوحة قاعدة البيانات.

---

## ⚡ البناء والتشغيل المحلي (Local Development)

```bash
# تثبيت الحزم
npm install

# توليد عميل Prisma
npm run prisma:generate

# تشغيل خادم التطوير
npm run dev
```
الموقع سيعمل محلياً على: `http://localhost:3000`

---

## 🔒 معايير الأمان المطبقة للإنتاج:
- **حاويات Docker آمنة**: تشغيل التطبيق بحساب مستخدم غير جذري (`nextjs:nodejs` UID 1001).
- **ترويسات أمان HTTP (Security Headers)**: مدمجة تلقائياً في `next.config.mjs` (X-Frame-Options, XSS Protection, Content-Type Options).
- **ضغط وتأمين الصور**: معالجة صارمة عبر `sharp` تمنع رفع أي ملفات خبيثة وتحولها لصور WebP نقية بمقاس أقصى 1200px وحجم تحت 300KB.
- **تشفير كلمات المرور**: تشفير أحادي الاتجاه `bcryptjs` بملح قوي مع حماية ملفات تعريف ارتباط المصادقة (HTTP-Only Secure Cookies).
