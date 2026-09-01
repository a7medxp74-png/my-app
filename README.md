# Commit — Study. Prove. Grow.

Commit هو Web App عربي RTL للمذاكرة والانضباط: المستخدم يحدد جلسة، يبدأ مؤقتًا حقيقيًا يعتمد على وقت السيرفر، وبعد انتهاء الوقت يرفع صورة إثبات. Backend يرسل الصورة إلى Vision AI حقيقي، وعند قبولها تُمنح النقاط وXP من السيرفر فقط.

## Stack

- Next.js App Router + React + TypeScript
- Auth.js / NextAuth مع Google OAuth
- Prisma + PostgreSQL (Neon أو أي PostgreSQL متوافق مع Vercel)
- Vercel Blob لصور الإثبات
- OpenAI Responses API للـVision
- CSS Design System مخصص، RTL، Mobile-first، PWA

> تم اختيار OpenAI لأن نماذج OpenAI الحديثة تدعم إدخال الصور عبر Responses API. الخدمة ليست مجانية بالضرورة؛ تكلفة الاستخدام تعتمد على حسابك/خطة API والأسعار الحالية. راجع صفحة النماذج الرسمية قبل التشغيل التجاري.

## المتطلبات

- Node.js 20+
- PostgreSQL
- Google Cloud OAuth Client
- OpenAI API key
- Vercel Blob store عند النشر على Vercel

## Environment Variables

انسخ `.env.example` إلى `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
OWNER_EMAILS="owner@example.com"
OPENAI_API_KEY="sk-..."
OPENAI_VISION_MODEL="gpt-5.6-luna"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### شرح المتغيرات

- `DATABASE_URL`: رابط PostgreSQL.
- `AUTH_SECRET`: سر طويل عشوائي لجلسات Auth.js.
- `AUTH_URL`: عنوان التطبيق. محليًا `http://localhost:3000`، وفي الإنتاج استخدم نطاقك.
- `GOOGLE_CLIENT_ID` و`GOOGLE_CLIENT_SECRET`: بيانات OAuth من Google Cloud.
- `OWNER_EMAILS`: بريد/عناوين Google التي تحصل على `OWNER` عند تسجيل الدخول. لا يوجد Owner password داخل الكود.
- `OPENAI_API_KEY`: مفتاح OpenAI، Backend فقط.
- `OPENAI_VISION_MODEL`: موديل Vision قابل للإدخال البصري. يمكن تغييره لموديل متاح في حسابك.
- `BLOB_READ_WRITE_TOKEN`: Token الخاص بـ Vercel Blob.
- `NEXT_PUBLIC_APP_URL`: عنوان التطبيق العام.

لا تضع أي قيمة سرية في GitHub.

## التشغيل محليًا

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

ثم افتح `http://localhost:3000`.

للتأكد من TypeScript:

```bash
npm run typecheck
```

للبناء:

```bash
npm run build
```

## Google OAuth

1. افتح Google Cloud Console.
2. أنشئ Project أو استخدم مشروعًا موجودًا.
3. فعّل Google OAuth / Google Identity حسب الواجهة الحالية في Google Cloud.
4. أنشئ OAuth Client من نوع Web application.
5. أضف Authorized JavaScript origin محليًا: `http://localhost:3000`.
6. أضف Authorized redirect URI محليًا: `http://localhost:3000/api/auth/callback/google`.
7. في Vercel أضف نفس القيم لكن باستخدام دومين الإنتاج، مثل: `https://YOUR-DOMAIN/api/auth/callback/google`.
8. ضع Client ID في `GOOGLE_CLIENT_ID` وClient Secret في `GOOGLE_CLIENT_SECRET`.

Auth.js يدير جلسات الدخول، وحساب Google، وحماية الصفحات مع Prisma Adapter.

## Database

Prisma schema موجود في `prisma/schema.prisma` ويحتوي على:

- `User`
- `Account`
- `AuthSession`
- `VerificationToken`
- `StudySession`
- `AIVerification`
- `AppSetting`
- `AuditLog`

في الإنتاج، أنشئ PostgreSQL من Neon أو مزود PostgreSQL متوافق مع Vercel ثم ضع `DATABASE_URL` في Vercel Environment Variables.

بعد أول ربط:

```bash
npm run db:push
npm run db:seed
```

أو استخدم migrations في دورة التطوير:

```bash
npm run db:migrate
```

## Owner

لا يوجد Owner password.

ضع بريد Google الذي تريد منحه صلاحية المالك في:

```env
OWNER_EMAILS="you@example.com"
```

ثم سجّل الدخول بهذا البريد. الـcallback يعيّن `role=OWNER` في قاعدة البيانات. ويمكن أيضًا تشغيل:

```bash
npm run db:seed
```

بعد وجود المستخدم في قاعدة البيانات.

صلاحيات Owner يتم التحقق منها Server-side في كل Owner API، وليس بإخفاء زر فقط.

## AI Vision

التدفق الحقيقي:

1. يبدأ المستخدم جلسة.
2. `startedAt` و`expectedEndAt` ينشآن على السيرفر.
3. السيرفر يمنع إنهاء الجلسة قبل `expectedEndAt`.
4. بعد انتهاء الوقت تصبح الجلسة `AWAITING_PROOF`.
5. الصورة ترفع إلى Backend ثم Vercel Blob.
6. Backend يجلب الصورة ويحوّلها إلى data URL ويرسلها إلى OpenAI Responses API كـimage input.
7. نتيجة AI تحفظ في `AIVerification`.
8. عند `ACCEPTED` فقط تتم معاملة النقاط وXP داخل transaction مع تحديث المستخدم والجلسة.
9. عند الرفض لا توجد مكافأة.

مهم: AI لا يثبت أن الشخص نفسه هو صاحب الصورة، ولا يجب استخدامه لاتخاذ قرارات هوية حساسة. دوره هنا فحص سياق صورة المذاكرة وفق قواعد Commit.

OpenAI API مدفوع حسب الاستخدام؛ لا يعتبر هذا المشروع الخدمة مجانية.

## Vercel Blob

أنشئ Blob store من Vercel Storage ثم أضف `BLOB_READ_WRITE_TOKEN` إلى Environment Variables. التطبيق يرفض الأنواع غير المسموحة ويحدد حجم الصورة إلى 5MB. صور الإثبات تُحفظ في مسار مرتبط بمعرف المستخدم وUUID عشوائي.

لأعلى مستوى خصوصية في مشروع تجاري، يُفضّل تحويل التخزين إلى private Blob delivery/proxy بعد تفعيل private blob في بيئة Vercel الخاصة بك؛ كود Commit حاليًا يحتاج URL قابلًا للجلب من Backend كي يستطيع Vision AI تحليل الصورة.

## Points + XP + Levels

الإعدادات الافتراضية:

- 2 نقطة لكل دقيقة.
- 3 XP لكل دقيقة.
- Bonus = 10 نقاط + 25 XP.
- الحد الأدنى = 5 دقائق.
- الحد الأقصى = 180 دقيقة.
- XP المستوى الأول = 100، والنمو = 1.35.

كلها في `AppSetting` ويمكن للمالك تعديلها من Owner Dashboard. المكافآت تُحسب server-side.

## Timer / Anti-cheat

المتصفح لا يحدد وقت الانتهاء الحقيقي. `startedAt` و`expectedEndAt` مصدر الحقيقة في PostgreSQL. Refresh لا يعيد الجلسة، وتغيير وقت الجهاز لا يؤثر على الحساب. Endpoint الإنهاء يفحص الوقت على السيرفر، وإذا حاول المستخدم الإنهاء مبكرًا تُسجّل `FAILED`.

واجهة المؤقت تعرض countdown للراحة فقط؛ القرار النهائي للسيرفر.

## PWA / Mobile-first

التطبيق يحتوي على:

- Web App Manifest
- Icons
- Service Worker محدود وآمن نسبيًا
- Mobile-first CSS
- Bottom navigation للموبايل
- Touch-friendly controls
- رفع صورة مباشرة من كاميرا الهاتف عبر `capture="environment"`
- Dark mode

الـService Worker لا يخزن API responses ولا مسارات الجلسات، حتى لا يتداخل مع Authentication أو بيانات المستخدم.

## Vercel Deployment

1. ارفع المشروع إلى GitHub.
2. استورد repository في Vercel.
3. أضف كل Environment Variables الموجودة في `.env.example`.
4. أنشئ/اربط PostgreSQL.
5. أنشئ Vercel Blob store وأضف token.
6. أضف Google redirect URI للإنتاج.
7. تأكد من `NEXT_PUBLIC_APP_URL` و`AUTH_URL`.
8. Deploy.

Build command:

```bash
npm run build
```

## Routes المهمة

### Client

- `/dashboard`
- `/session/new`
- `/session/[id]`
- `/leaderboard`
- `/profile`
- `/settings`

### Owner

- `/owner`
- `/owner/users`
- `/owner/users/[id]`
- `/owner/sessions`
- `/owner/verifications`
- `/owner/settings`
- `/owner/leaderboard`
- `/owner/audit-logs`

### API

- `/api/auth/*`
- `/api/me`
- `/api/sessions`
- `/api/sessions/start`
- `/api/sessions/[id]`
- `/api/sessions/[id]/finish`
- `/api/sessions/[id]/verify`
- `/api/upload`
- `/api/leaderboard`
- `/api/owner/*`

## Security notes

- Secrets server-only.
- Prisma database is the source of truth.
- User APIs verify authenticated user ID.
- Owner APIs verify `OWNER`/`ADMIN` server-side.
- Uploads have MIME and size checks.
- AI endpoint has a per-user daily verification cap (20 attempts/24h) backed by DB data.
- Reward mutation happens server-side and in a database transaction.
- Audit logs record administrative settings and user-status changes.

قبل إطلاق نسخة تجارية، أضف WAF/rate limiting موزعًا مثل Upstash/Vercel WAF، وprivate blob delivery، ومراقبة الإنفاق في OpenAI/Vercel.

## License

Private project template. أضف الترخيص المناسب قبل النشر العام.
