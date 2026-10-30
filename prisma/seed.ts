import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Khashala Database Seeding ---');

  // Ensure public/uploads/ads directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate a simple lightweight 1x1 WebP placeholder file for seed ads if needed
  const placeholderPath = path.join(uploadDir, 'placeholder.webp');
  if (!fs.existsSync(placeholderPath)) {
    const webpBuffer = Buffer.from(
      'UklGRkAAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAIAAAAAAFZQOCAYAAAAMAEAnQEqAQABAAFAJiWkAANwAP7/4AAA',
      'base64'
    );
    fs.writeFileSync(placeholderPath, webpBuffer);
  }

  // Clear existing data safely
  try {
    await prisma.ad.deleteMany();
    await prisma.report.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.platformSetting.deleteMany();
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Tables may be empty, proceeding...');
  }

  // 1. Create Default Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'مشرف خشاله',
      email: 'admin@khashala.com',
      phone: '+966500000001',
      password: adminPasswordHash,
      role: 'ADMIN' as any,
    },
  });
  console.log('✓ Admin user created: admin@khashala.com');

  const regularUser = await prisma.user.create({
    data: {
      name: 'سعود المنصور',
      email: 'user@khashala.com',
      phone: '+966555123456',
      password: userPasswordHash,
      role: 'USER' as any,
    },
  });
  console.log('✓ Regular user created: user@khashala.com');

  // 2. Create Categories & Subcategories with Icons
  const categoriesData = [
    {
      name: 'سيارات ومركبات',
      slug: 'vehicles',
      icon: 'Car',
      subs: [
        { name: 'تويوتا', slug: 'vehicles-toyota', icon: 'Car' },
        { name: 'مرسيدس بنز', slug: 'vehicles-mercedes', icon: 'Car' },
        { name: 'بورش ورياضية', slug: 'vehicles-porsche', icon: 'Sparkles' },
        { name: 'هيونداي وكيا', slug: 'vehicles-hyundai', icon: 'Car' },
        { name: 'قطع غيار وإكسسوارات', slug: 'vehicles-parts', icon: 'Wrench' },
        { name: 'دراجات نارية وقوارب', slug: 'vehicles-bikes', icon: 'Compass' },
      ],
    },
    {
      name: 'عقارات',
      slug: 'real-estate',
      icon: 'Building2',
      subs: [
        { name: 'شقق للإيجار', slug: 're-apartments-rent', icon: 'Building2' },
        { name: 'شقق للبيع', slug: 're-apartments-sale', icon: 'Home' },
        { name: 'فلل وقصور', slug: 're-villas', icon: 'Sparkles' },
        { name: 'شاليهات واستراحات', slug: 're-chalets', icon: 'Compass' },
        { name: 'أراضي ومزارع', slug: 're-lands', icon: 'Layers' },
        { name: 'مكاتب وعقارات تجارية', slug: 're-commercial', icon: 'Briefcase' },
      ],
    },
    {
      name: 'إلكترونيات وأجهزة',
      slug: 'electronics',
      icon: 'Smartphone',
      subs: [
        { name: 'هواتف ذكية', slug: 'elec-phones', icon: 'Smartphone' },
        { name: 'لابتوب وكمبيوتر', slug: 'elec-laptops', icon: 'Laptop' },
        { name: 'ألعاب وبلايستيشن', slug: 'elec-gaming', icon: 'Gamepad2' },
        { name: 'تلفزيونات وصوتيات', slug: 'elec-tv', icon: 'Tv' },
        { name: 'أجهزة منزلية', slug: 'elec-appliances', icon: 'Zap' },
        { name: 'كاميرات وتصوير', slug: 'elec-cameras', icon: 'Camera' },
      ],
    },
    {
      name: 'أثاث وديكور',
      slug: 'furniture',
      icon: 'Sofa',
      subs: [
        { name: 'مجالس وصالونات', slug: 'furn-living', icon: 'Sofa' },
        { name: 'غرف نوم', slug: 'furn-bedroom', icon: 'Home' },
        { name: 'طاولات وكراسي', slug: 'furn-tables', icon: 'Layers' },
        { name: 'مطابخ وخزائن', slug: 'furn-kitchen', icon: 'Wrench' },
        { name: 'سجاد ومفروشات', slug: 'furn-carpets', icon: 'Sparkles' },
      ],
    },
    {
      name: 'أزياء وموضة',
      slug: 'fashion',
      icon: 'Shirt',
      subs: [
        { name: 'ساعات فاخرة', slug: 'fash-watches', icon: 'Watch' },
        { name: 'ملابس رجالية', slug: 'fash-men', icon: 'Shirt' },
        { name: 'ملابس نسائية', slug: 'fash-women', icon: 'ShoppingBag' },
        { name: 'أحذية وحقائب', slug: 'fash-bags', icon: 'ShoppingBag' },
        { name: 'عطور ومستحضرات', slug: 'fash-perfumes', icon: 'Sparkles' },
      ],
    },
    {
      name: 'وظائف ومهن',
      slug: 'jobs',
      icon: 'Briefcase',
      subs: [
        { name: 'تقنية وبرمجة', slug: 'jobs-it', icon: 'Laptop' },
        { name: 'تسويق ومبيعات', slug: 'jobs-marketing', icon: 'Sparkles' },
        { name: 'هندسة ومقاولات', slug: 'jobs-engineering', icon: 'Wrench' },
        { name: 'محاسبة وإدارة', slug: 'jobs-finance', icon: 'Briefcase' },
        { name: 'توصيل وخدمات', slug: 'jobs-delivery', icon: 'Car' },
      ],
    },
    {
      name: 'خدمات وأعمال',
      slug: 'services',
      icon: 'Wrench',
      subs: [
        { name: 'نقل عفش وتخزين', slug: 'srv-moving', icon: 'Car' },
        { name: 'صيانة وترميم', slug: 'srv-maintenance', icon: 'Wrench' },
        { name: 'تنظيف وتعقيم', slug: 'srv-cleaning', icon: 'Sparkles' },
        { name: 'تصميم وتسويق رقمي', slug: 'srv-design', icon: 'Laptop' },
        { name: 'دروس وتدريب', slug: 'srv-tutoring', icon: 'Briefcase' },
      ],
    },
    {
      name: 'حيوانات ومستلزمات',
      slug: 'pets',
      icon: 'Dog',
      subs: [
        { name: 'قطط أليفة', slug: 'pets-cats', icon: 'Dog' },
        { name: 'طيور وحمام', slug: 'pets-birds', icon: 'Sparkles' },
        { name: 'خيول وإبل', slug: 'pets-horses', icon: 'Compass' },
        { name: 'مستلزمات وأعلاف', slug: 'pets-supplies', icon: 'ShoppingBag' },
      ],
    },
  ];

  const categoryMap = new Map<string, any>();

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        subcategories: {
          create: cat.subs.map((s) => ({
            name: s.name,
            slug: s.slug,
            icon: s.icon,
          })),
        },
      },
      include: { subcategories: true },
    });
    categoryMap.set(cat.slug, createdCat);
  }
  console.log('✓ Categories & Subcategories seeded with icons');

  // 3. Seed Sample Ads (Realistic Classifieds in Arabic with Subcategories)
  const sampleAds = [
    {
      title: 'تويوتا كامري 2023 فل كامل بحالة الوكالة',
      description: 'سيارة تويوتا كامري GLX موديل 2023، الممشى 28,000 كم فقط، صيانة دورية بالوكالة، فتحة سقف، جلد، شاشة ملاحة وكاميرا خلفية. السيارة خالية تماماً من الرش والحوادث. السعر قابل للتفاوض البسيط للجادين.',
      price: 95000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-toyota',
      city: 'الرياض',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'شقة فاخرة للإيجار السنوي - حي النرجس بالرياض',
      description: 'شقة بتشطيب مودرن حديث مؤلفة من 3 غرف نوم، صالة واسعة، مطبخ راكب مع الأجهزة، و 3 دورات مياه. يوجد مصعد وموقف خاص مغطى. قريبة من جميع الخدمات وطريق الملك فهد.',
      price: 65000,
      categorySlug: 'real-estate',
      subSlug: 're-apartments-rent',
      city: 'الرياض',
      condition: 'NEW',
      isFeatured: true,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'أبل آيفون 15 برو ماكس 256 جيجابايت - تيتانيوم طبيعي',
      description: 'جهاز iPhone 15 Pro Max سعة 256GB اللون تيتانيوم طبيعي، نسبة البطارية 99%، خالي من أي خدوش مع الكرتون وجميع الملحقات الأصلية وفاتورة الشراء وضمان حاسبات العرب ساري.',
      price: 4300,
      categorySlug: 'electronics',
      subSlug: 'elec-phones',
      city: 'جدة',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'طقم كنب تركي فاخر يتسع لـ 9 أشخاص مع طاولة وسط',
      description: 'طقم كنب مجلس تم استخدامه لمدة 6 أشهر فقط بحالة ممتازة كالجديد، قماش مخملي إيطالي معالج ضد السوائل وخشب زان طبيعي متين. يشمل طاولة قهوة كبيرة و 2 طاولة جانبية.',
      price: 3200,
      categorySlug: 'furniture',
      subSlug: 'furn-living',
      city: 'الدمام',
      condition: 'USED_GOOD',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'ساعة رولكس صبمارينر Rolex Submariner أصلية مع الصندوق',
      description: 'ساعة رولكس سبمارينر ديت ستيل، كلاسيكية راقية، مع العلبة والشهادة الأصلية، تم فحصها لدى الوكيل، مناسبة لجامعي الساعات الفاخرة.',
      price: 48000,
      categorySlug: 'fashion',
      subSlug: 'fash-watches',
      city: 'دبي',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'فيلا مودرن للبيع - حي الشاطئ بجدة مسبح ومصعد',
      description: 'فيلا مستقلة مساحة 450م² زاوية على شارعين، تصميم معماري حديث، 5 أجنحة نوم، صالونات مفتوحة، مسبح خاص وحديقة، مصعد إيطالي، وتكييف مركزي بالكامل. بناء شخصي بأعلى معايير الجودة.',
      price: 3850000,
      categorySlug: 'real-estate',
      subSlug: 're-villas',
      city: 'جدة',
      condition: 'NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مطلوب مهندس برمجيات Full-Stack React & Node.js',
      description: 'تعلن شركة تقنية رائدة بالرياض عن حاجتها لمهندس برمجيات يمتلك خبرة لا تقل عن 3 سنوات في React, Next.js, TypeScript, PostgreSQL. راتب مجزي وتأمين صحي VIP وبيئة عمل مرنة.',
      price: 14000,
      categorySlug: 'jobs',
      subSlug: 'jobs-it',
      city: 'الرياض',
      condition: 'NA',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'قط فارسي (شيرازي) أبيض عيون زرقاء مطعم',
      description: 'قط شيرازي أصيل بيور، عمره 4 أشهر، لعوب ونظيف جداً ومتعلم على الليتر بوكس، حاصل على جميع التطعيمات ودفتر التحصين الصحي.',
      price: 1200,
      categorySlug: 'pets',
      subSlug: 'pets-cats',
      city: 'مكة المكرمة',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'PENDING',
    },
    {
      title: 'مرسيدس E300 موديل 2021 باقة AMG فل أوبشن',
      description: 'مرسيدس E-Class 2021 رمادي سيلينيت، وارد الجفالي، رادار، كاميرات 360، بروجكتر، مقاعد مساج، الممشى 45 ألف كم، تحت الضمان.',
      price: 215000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-mercedes',
      city: 'الرياض',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'PENDING',
    },
    {
      title: 'شقة فاخرة للبيع في التجمع الخامس - القاهرة الجديدة',
      description: 'شقة 220 متر نصف تشطيب في كمبوند راقي، 3 غرف نوم منها ماستر مع دريسنج، ريسبشن 4 قطع، 3 حمام وتراس فيو بحيرات وحدائق. السعر قابل للتفاوض مع تسهيلات بالسداد.',
      price: 4500000,
      categorySlug: 'real-estate',
      subSlug: 're-apartments-sale',
      city: 'القاهرة',
      condition: 'NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'ماك بوك برو M3 Max شاشة 16 بوصة رمادي فلكي',
      description: 'MacBook Pro M3 Max رامات 36 جيجا وهارد 1 تيرا SSD، بحالة الزيرو تماماً استخدام أسبوعين فقط مع الفاتورة والضمان الدولي.',
      price: 110000,
      categorySlug: 'electronics',
      subSlug: 'elec-laptops',
      city: 'الإسكندرية',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'بورش كايين GTS موديل 2022 وكالة الكويت',
      description: 'Porsche Cayenne GTS قاطع 32 ألف كم، كامل المواصفات بانوراما وسستم عادم رياضي، حماية كاملة وتظليل حراري، سيرفيس منتظم بالوكالة.',
      price: 24500,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-porsche',
      city: 'مدينة الكويت',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'شاليه مودرن على البحر مباشرة للبيع في لوسيل',
      description: 'شاليه فندقي بإطلالة بانورامية مباشرة على البحر في مدينة لوسيل، تشطيب ديلوكس مفروش بالكامل بأثاث أوروبي راقي مع مسبح خاص.',
      price: 2800000,
      categorySlug: 'real-estate',
      subSlug: 're-chalets',
      city: 'الدوحة',
      condition: 'NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مطلوب مدير تسويق رقمي وإعلانات ممولة في عمان',
      description: 'شركة تسويق كبرى في الأردن تبحث عن خبير في إعلانات Meta و Google Ads و TikTok Ads، خبرة لا تقل عن 4 سنوات، راتب مميز وحوافز سنوية.',
      price: 1200,
      categorySlug: 'jobs',
      subSlug: 'jobs-marketing',
      city: 'عمان',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'صالون مغربي تقليدي فاخر خشب أرز منقوش يدوياً',
      description: 'صالون مغربي أصيل مصنوع من خشب الأرز الأطلسي الفاخر مع حفر ونقش يدوي متقن ومفروشات مخملية مطرزة بالحرير، يتسع لـ 14 شخصاً.',
      price: 18000,
      categorySlug: 'furniture',
      subSlug: 'furn-living',
      city: 'الدار البيضاء',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'سوني بلايستيشن 5 إصدار الأقراص مع يدين و 3 ألعاب',
      description: 'جهاز PlayStation 5 Slim النسخة الأوروبية مع ذراعين تحكم أصليين و 3 ألعاب أصلية (FC 24, Spider-Man 2, GTA V)، استخدام خفيف جداً.',
      price: 680000,
      categorySlug: 'electronics',
      subSlug: 'elec-gaming',
      city: 'بغداد',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
  ];

  for (const adData of sampleAds) {
    const category = categoryMap.get(adData.categorySlug);
    if (!category) continue;

    const matchedSub = category.subcategories?.find((s: any) => s.slug === adData.subSlug);
    const authorId = adData.status === 'PENDING' ? regularUser.id : admin.id;
    const isSqlite = (process.env.DATABASE_URL || '').includes('file:');
    const imagePayload = isSqlite ? JSON.stringify(adData.images) : (adData.images as any);

    await prisma.ad.create({
      data: {
        title: adData.title,
        description: adData.description,
        price: adData.price,
        categoryId: category.id,
        subcategoryId: matchedSub ? matchedSub.id : null,
        city: adData.city,
        userId: authorId,
        images: imagePayload,
        status: adData.status as any,
        condition: adData.condition,
        isFeatured: adData.isFeatured,
        isUrgent: adData.isUrgent,
        isNegotiable: adData.isNegotiable,
        views: Math.floor(Math.random() * 350) + 25,
      },
    });
  }

  console.log(`✓ Seeded ${sampleAds.length} sample ads with Subcategories & Featured VIP status`);

  // 4. Seed Platform Settings
  const settings = [
    { key: 'siteName', value: 'خشاله - Khashala' },
    { key: 'supportEmail', value: 'support@khashala.com' },
    { key: 'supportPhone', value: '+966500000001' },
    { key: 'autoApproveAds', value: 'false' },
    { key: 'announcementActive', value: 'true' },
    { key: 'announcementText', value: 'مرحباً بكم في منصة خُشـاله! تم إطلاق الهوية الجديدة ومميزات الترقية وتمييز الإعلانات 🚀' },
    { key: 'maintenanceMode', value: 'false' },
    // Paymob Payment Gateway Settings
    { key: 'paymobEnabled', value: 'true' },
    { key: 'featuredAdPrice', value: '150' },
    { key: 'featuredAdCurrency', value: 'EGP' },
    { key: 'featuredDurationDays', value: '30' },
    { key: 'paymobSandbox', value: 'true' },
    { key: 'paymobApiKey', value: '' },
    { key: 'paymobIntegrationId', value: '' },
    { key: 'paymobIframeId', value: '' },
    { key: 'paymobHmac', value: '' },
  ];

  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✓ Seeded platform & Paymob settings');

  // 5. Seed Sample Reports for Admin Testing
  const firstAd = await prisma.ad.findFirst();
  if (firstAd) {
    await prisma.report.create({
      data: {
        adId: firstAd.id,
        reason: 'WRONG_CATEGORY',
        details: 'السلعة معروضة في قسم غير مناسب يرجى مراجعة القسم',
        reporterName: 'عبدالله القحطاني',
        reporterPhone: '+966501234567',
        status: 'PENDING',
      },
    });

    await prisma.report.create({
      data: {
        adId: firstAd.id,
        reason: 'FRAUD',
        details: 'اشتباه في تكرار صور السلعة من موقع آخر بسعر منخفض جداً',
        reporterName: 'سارة الشمري',
        reporterPhone: '+966509876543',
        status: 'PENDING',
      },
    });
    console.log('✓ Seeded sample reports for moderation testing');
  }

  // 6. Seed Sample Admin Logs
  const sampleLogs = [
    { adminName: 'مشرف خشاله', action: 'APPROVE_AD', target: 'تويوتا لاندكروزر 2024 VXR', details: 'تمت مراجعة الإعلان والموافقة عليه وتفعيله' },
    { adminName: 'مشرف خشاله', action: 'FEATURE_AD', target: 'فيلا مودرن فاخرة بحي الملقا', details: 'تم تمييز الإعلان في صدارة نتائج البحث' },
    { adminName: 'مشرف خشاله', action: 'ADD_SUBCATEGORY', target: 'سيارات كهربائية', details: 'تمت إضافة قسم فرعي جديد داخل قسم سيارات ومركبات' },
    { adminName: 'مشرف خشاله', action: 'SYSTEM_SETTINGS', target: 'إعدادات المنصة', details: 'تم ضبط بوابة الدفع Paymob والشريط الإعلاني' },
  ];

  for (const log of sampleLogs) {
    await prisma.adminLog.create({ data: log });
  }
  console.log('✓ Seeded sample admin audit logs');

  console.log('--- Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
