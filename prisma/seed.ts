import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Khashala Comprehensive Database Seeding (Non-Financial Data Only) ---');

  // Ensure public/uploads/ads and branding directories exist
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ads');
    const brandingDir = path.join(process.cwd(), 'public', 'uploads', 'branding');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(brandingDir)) {
      fs.mkdirSync(brandingDir, { recursive: true });
    }

    // Generate a lightweight 1x1 WebP placeholder file if needed
    const placeholderPath = path.join(uploadDir, 'placeholder.webp');
    if (!fs.existsSync(placeholderPath)) {
      const webpBuffer = Buffer.from(
        'UklGRkAAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAIAAAAAAFZQOCAYAAAAMAEAnQEqAQABAAFAJiWkAANwAP7/4AAA',
        'base64'
      );
      fs.writeFileSync(placeholderPath, webpBuffer);
    }
  } catch {
    // Ignore non-fatal filesystem permission errors when seeding inside restricted containers
  }

  // 1. Upsert Admin & Realistic Dummy Users (NO financial/payment records!)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@khashala.com' },
    update: {},
    create: {
      name: 'مشرف خشاله',
      email: 'admin@khashala.com',
      phone: '+966500000001',
      password: adminPasswordHash,
      role: 'ADMIN' as any,
    },
  });

  const dummyUsersData = [
    { name: 'سعود المنصور', email: 'user@khashala.com', phone: '+966555123456' },
    { name: 'أحمد الحسيني', email: 'ahmed.husseini@khashala.com', phone: '+201012345678' },
    { name: 'خالد العتيبي', email: 'khaled.otaibi@khashala.com', phone: '+966504433221' },
    { name: 'محمد الشامسي', email: 'mohammed.shamsi@khashala.com', phone: '+971506543210' },
    { name: 'طارق الكواري', email: 'tarek.kuwari@khashala.com', phone: '+97455112233' },
    { name: 'ياسر المطيري', email: 'yasser.mutairi@khashala.com', phone: '+96599887766' },
    { name: 'عمر الزهراني', email: 'omar.zahrani@khashala.com', phone: '+966549988112' },
    { name: 'كريم المنشاوي', email: 'karim.menshawi@khashala.com', phone: '+201122334455' },
    { name: 'مازن المجالي', email: 'mazen.majali@khashala.com', phone: '+962795544332' },
    { name: 'يوسف بن جلون', email: 'youssef.benjelloun@khashala.com', phone: '+212661223344' },
    { name: 'حيدر الربيعي', email: 'haider.rubaie@khashala.com', phone: '+9647701234567' },
    { name: 'سالم الحارثي', email: 'salem.harthi@khashala.com', phone: '+96899112233' },
  ];

  const seededUsers: any[] = [];
  for (const u of dummyUsersData) {
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: userPasswordHash,
        role: 'USER' as any,
      },
    });
    seededUsers.push(createdUser);
  }
  console.log(`✓ Verified Admin + ${seededUsers.length} sample users`);

  // 2. Upsert Categories & Subcategories safely (preserving any custom admin categories)
  const categoriesData = [
    {
      name: 'سيارات ومركبات',
      slug: 'vehicles',
      icon: 'Car',
      subs: [
        { name: 'تويوتا ولكزس', slug: 'vehicles-toyota', icon: 'Car' },
        { name: 'مرسيدس وألماني', slug: 'vehicles-mercedes', icon: 'Car' },
        { name: 'بورش ورياضية', slug: 'vehicles-porsche', icon: 'Sparkles' },
        { name: 'هيونداي وكيا', slug: 'vehicles-hyundai', icon: 'Car' },
        { name: 'نيسان وأمريكي', slug: 'vehicles-nissan', icon: 'Car' },
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
    const upsertedCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      },
    });

    for (const sub of cat.subs) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {},
        create: {
          name: sub.name,
          slug: sub.slug,
          icon: sub.icon,
          categoryId: upsertedCat.id,
        },
      });
    }

    const fullCat = await prisma.category.findUnique({
      where: { id: upsertedCat.id },
      include: { subcategories: true },
    });
    categoryMap.set(cat.slug, fullCat);
  }
  console.log('✓ Verified 8 main categories & 43 subcategories');

  // 3. Comprehensive Realistic Dummy Classified Ads (60 Ads across all categories & Arab cities)
  const sampleAds = [
    // ==================== VEHICLES (10 Ads) ====================
    {
      title: 'تويوتا لاندكروزر GXR 2024 توين تيربو زيرو وكالة',
      description: 'لاندكروزر 2024 فئة GXR فل كامل محرك 6 سلندر توين تيربو، لون أبيض لؤلؤي داخلية بيج مخمل وجلد، شاشة كبيرة، كاميرات محيطية 360 درجة، ثلاجة وفتحة سقف، ضمان عبد اللطيف جميل.',
      price: 315000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-toyota',
      city: 'الرياض',
      condition: 'NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=1200&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'تويوتا كامري 2023 فل كامل قراندي بحالة الوكالة',
      description: 'سيارة تويوتا كامري موديل 2023، الممشى 28,000 كم فقط، صيانة دورية بالوكالة، فتحة سقف بانوراما، مقاعد جلد، شاشة ملاحة وكاميرا خلفية. خالية تماماً من الرش والحوادث.',
      price: 96000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-toyota',
      city: 'جدة',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مرسيدس S500 موديل 2023 AMG جفالي ممشى قليل',
      description: 'مرسيدس إس كلاس S500 لارج باقة AMG، لون أسود ملكي وداخلية جملي نابا فاخر، شاشات خلفية، تبريد ومساج لجميع المقاعد، توجيه خلفي، تحت الضمان.',
      price: 540000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-mercedes',
      city: 'دبي',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'بورش كايين GTS موديل 2022 وكالة الكويت صبغ وكالة',
      description: 'Porsche Cayenne GTS قاطع 31 ألف كم، كامل المواصفات بانوراما وسستم عادم رياضي، حماية كاملة للبدي وتظليل حراري، سيرفيس منتظم بالوكالة.',
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
      title: 'هيونداي إلنترا سمارت 2024 اقتصادية جداً بحالة الزيرو',
      description: 'هيونداي إلنترا 2024 محرك 2000 سي سي، دخول ذكي وتشغيل بصمة، شاشة أبل كاربلاي، حساسات خلفية وكاميرا، استهلاك وقود ممتاز جداً، استخدام شخصي نظيف.',
      price: 74000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-hyundai',
      city: 'القاهرة',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'كيا K8 موديل 2023 فل كامل 6 سلندر نظيفة جداً',
      description: 'كيا K8 الفئة العليا، رادار وتحديد مسار، نقطة عمياء، مقاعد جلد نابا مع تبريد وتدفئة، نظام صوتي ميريديان 14 سماعة، فحص كامل جاهز للنقل.',
      price: 118000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-hyundai',
      city: 'الدمام',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'نيسان باترول بلاتينيوم V8 موديل 2023 خليجي',
      description: 'نيسان باترول المكينة الكبيرة 400 حصان، فل بلاتينيوم، شاشات خلفية، رادار، فتحة سقف، صبغ الوكالة بالكامل بدون أي ملاحظات، إطارات ميشلان جديدة.',
      price: 265000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-nissan',
      city: 'أبوظبي',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'لكزس ES350 موديل 2022 بانوراما فئة CC وارد عبداللطيف',
      description: 'لكزس ES350 لون تيتانيوم وداخلية زعفراني، ممشى 44 ألف كم، بروجكتر، شنطة كهرباء، ستائر جانبية وخلفية، صيانات الوكالة بالكامل.',
      price: 179000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-toyota',
      city: 'الخبر',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'طقم جنوط أصلية مقاس 20 مع إطارات بريدجستون شبه جديدة',
      description: 'طقم 4 جنوط وكالة أصلية خالية من الخدوش أو اللحام مع كفرات بريدجستون تاريخ السنة استخدام شهرين فقط.',
      price: 3800,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-parts',
      city: 'الرياض',
      condition: 'USED_GOOD',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1600706432502-77a0e2e32790?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'دراجة نارية ياماها R6 رياضية بحالة ممتازة مع خوذة احترافية',
      description: 'دراجة Yamaha YZF-R6 نظيفة جداً، صيانة كاملة حديثة للزيوت والفلاتر والإطارات، لم تتعرض لأي سقوط، مع خوذة وقفازات أصلية هدية.',
      price: 34000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-bikes',
      city: 'الدوحة',
      condition: 'USED_GOOD',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },

    // ==================== REAL ESTATE (10 Ads) ====================
    {
      title: 'شقة مودرن فاخرة للإيجار السنوي - حي النرجس شمال الرياض',
      description: 'شقة بتشطيب مودرن راقي مؤلفة من 3 غرف نوم (واحدة ماستر)، صالة واسعة بدخول ذكي، مطبخ راكب بالأجهزة الإيطالية، و 3 دورات مياه وموقف خاص مظلل.',
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
      title: 'فيلا مودرن مستقلة للبيع بحي الشاطئ بجدة مع مسبح ومصعد',
      description: 'فيلا زاوية مساحة 450م² على شارعين، تصميم معماري حديث، 5 أجنحة نوم، صالونات مفتوحة بإطلالة على المسبح والحديقة، مصعد إيطالي وتكييف مركزي بالكامل.',
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
      title: 'شقة تمليك فاخرة 210م في التجمع الخامس - القاهرة الجديدة',
      description: 'شقة سوبر لوكس أول سكن في كمبوند متكامل الخدمات والأمن 24 ساعة، 3 غرف نوم وريسبشن 3 قطع وتراس واسع يطل على لاندسكيب وبحيرات صناعية.',
      price: 4650000,
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
      title: 'شاليه فندقي مطل على البحر مباشرة للبيع في مدينة لوسيل',
      description: 'شاليه بإطلالة بحرية بانورامية ساحرة في لوسيل، مفروش بالكامل بأرقى المفروشات العصرية، مسبح إنفينيتي ونادي صحي وشاطئ خاص للسكان.',
      price: 2750000,
      categorySlug: 'real-estate',
      subSlug: 're-chalets',
      city: 'الدوحة',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'شقة مفروشة بإطلالة بحرية للإيجار الشهري في دبي مارينا',
      description: 'غرفتين وصالة مفروشة بالكامل بتصميم فندقي حديث، شرفة واسعة تطل على المرسى، شاملة الإنترنت والمواقف ودخول الجيم والمسبح، قريبة من المترو.',
      price: 13500,
      categorySlug: 'real-estate',
      subSlug: 're-apartments-rent',
      city: 'دبي',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'أرض سكنية زاوية بصك إلكتروني جاهز للبناء في حي العزيزية بالخبر',
      description: 'أرض مستوية تماماً على شارعين 20 شمالي و 15 شرقي، مساحة 600 متر مربع، مكتملة الخدمات (كهرباء، مياه، ألياف بصرية)، موقع هادئ ومميز.',
      price: 890000,
      categorySlug: 'real-estate',
      subSlug: 're-lands',
      city: 'الخبر',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مكتب إداري متشطب بالكامل للإيجار في برج تجاري بمدينة الكويت',
      description: 'مكتب إداري مساحة 140م² مقسم جاهز للشركات والمؤسسات، إطلالة بانورامية على البحر، رخصة تجارية جاهزة، 4 مواقف سيارات مخصصة واستقبال أمني.',
      price: 1150,
      categorySlug: 'real-estate',
      subSlug: 're-commercial',
      city: 'مدينة الكويت',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'شقة بإطلالة مباشرة على البحر في سموحة / كورنيش الإسكندرية',
      description: 'شقة 185 متر تشطيب ألترا لوكس، 3 غرف نوم وصالة كبيرة، الدور التاسع والعمارة بها 2 أسانسير حديث وجراج، كاملة العدادات مسجلة.',
      price: 3900000,
      categorySlug: 'real-estate',
      subSlug: 're-apartments-sale',
      city: 'الإسكندرية',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'استراحة وشاليه عائلي بمسبح وألعاب مائية للإيجار أو الاستثمار',
      description: 'استراحة متكاملة قسمين للرجال والنساء، مجالس واسعة ومسطحات خضراء ومسبح مفلتر ومنطقة شواء متكاملة.',
      price: 45000,
      categorySlug: 'real-estate',
      subSlug: 're-chalets',
      city: 'الطائف',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'فيلا تاون هاوس حديثة في الشيخ زايد بحديقة خاصة',
      description: 'تاون هاوس كورنر مساحة مباني 260م وحديقة 140م، 4 غرف نوم وغرفة مربية، داخل كمبوند راقي قريب من محور 26 يوليو والمولات.',
      price: 8200000,
      categorySlug: 'real-estate',
      subSlug: 're-villas',
      city: 'الجيزة',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },

    // ==================== ELECTRONICS (10 Ads) ====================
    {
      title: 'آيفون 16 برو ماكس 256 جيجابايت تيتانيوم صحراوي جديد مشمع',
      description: 'جهاز iPhone 16 Pro Max 256GB Desert Titanium النسخة الأصلية الشرق الأوسط بضمان سنتين، العلبة مغلقة بتغليف المصنع الأصلي مع الفاتورة.',
      price: 5150,
      categorySlug: 'electronics',
      subSlug: 'elec-phones',
      city: 'الرياض',
      condition: 'NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'سامسونج جالكسي S24 Ultra سعة 512 جيجا رمادي تيتانيوم كالجديد',
      description: 'Samsung S24 Ultra 512GB رام 12 جيجا، استخدام شهر واحد فقط بدون أي خدش نهائياً، عليه حماية شاشة أصلية وجراب ماج سيف مع كامل الملحقات.',
      price: 3950,
      categorySlug: 'electronics',
      subSlug: 'elec-phones',
      city: 'جدة',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'ماك بوك برو M3 Max شاشة 16 بوصة رام 36GB هارد 1TB',
      description: 'MacBook Pro 16-inch M3 Max بلون Space Black، دورات الشحن 11 فقط، كيبورد عربي إنجليزي أصلي، مناسب جداً للمونتاج والبرمجة والتصميم الثقيل.',
      price: 11800,
      categorySlug: 'electronics',
      subSlug: 'elec-laptops',
      city: 'دبي',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'لابتوب الألعاب الاحترافي ASUS ROG Strix كرت RTX 4070',
      description: 'معالج Intel Core i9 الجيل الرابع عشر، كرت شاشة NVIDIA RTX 4070 8GB، شاشة 240Hz QHD، رامات 32GB DDR5، مع ماوس وشنطة ROG الأصلية.',
      price: 6800,
      categorySlug: 'electronics',
      subSlug: 'elec-laptops',
      city: 'القاهرة',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'سوني بلايستيشن 5 سليم نسخة الأقراص مع ذراعين و 4 ألعاب',
      description: 'جهاز PlayStation 5 Slim 1TB بحالة الوكالة مع يدين DualSense أصليتين وقاعدة شحن وألعاب FC25 و Spider-Man 2 و Gran Turismo 7.',
      price: 2150,
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
    {
      title: 'شاشة ذكية LG OLED C3 مقاس 65 بوصة 4K 120Hz للأفلام والألعاب',
      description: 'تلفزيون إل جي أوليد 65 بوصة دقة 4K حقيقية مع دعم Dolby Vision و HDMI 2.1، ألوان سينمائية مذهلة، بالكرتون والضمان ساري.',
      price: 5400,
      categorySlug: 'electronics',
      subSlug: 'elec-tv',
      city: 'الرياض',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'كاميرا احترافية Sony Alpha A7 IV مع عدسة 24-70mm GM',
      description: 'كاميرا سوني A7 IV فل فريم للتصوير الفوتوغرافي والفيديو 4K 60fps، شتر أقل من 4000 صورة، مع بطاريتين إضافيتين وحقيبة مقاومة للماء.',
      price: 9200,
      categorySlug: 'electronics',
      subSlug: 'elec-cameras',
      city: 'عمان',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'ماكينة قهوة إسبريسو احترافية Breville Barista Express ستانلس',
      description: 'ماكينة القهوة الشهيرة بريفيل مع مطحنة مدمجة وعصا تبخير الحليب للاتيه آرت، نظيفة جداً ومعها جميع الفلاتر وأدوات التوزيع.',
      price: 2200,
      categorySlug: 'electronics',
      subSlug: 'elec-appliances',
      city: 'المنامة',
      condition: 'USED_GOOD',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'آيباد برو M4 مقاس 13 بوصة واي فاي + شريحة مع قلم Apple Pencil Pro',
      description: 'أحدث إصدار iPad Pro بشاشة Ultra Retina XDR OLED، سعة 256 جيجا، مع القلم الأصلي وكيبورد ماجيك، استخدام خفيف جداً للدراسة.',
      price: 4900,
      categorySlug: 'electronics',
      subSlug: 'elec-phones',
      city: 'مسقط',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'ثلاجة سامسونج سمارت دولابين إنفرتر 22 قدم ستيل',
      description: 'ثلاجة وفريزر سامسونج موفرة للطاقة بتبريد مزدوج وصانع ثلج أوتوماتيكي، بحالة ممتازة جداً، البيع لدواعي الانتقال.',
      price: 3400,
      categorySlug: 'electronics',
      subSlug: 'elec-appliances',
      city: 'الشارقة',
      condition: 'USED_GOOD',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },

    // ==================== FURNITURE (8 Ads) ====================
    {
      title: 'طقم كنب مجلس مودرن تركي يتسع لـ 9 أشخاص مع طاولة وسط رخام',
      description: 'طقم كنب زاوية ومفردات قماش كتان معالج ضد البقع والسوائل، إسفنج ضغط عالي مريح جداً وخشب زان طبيعي متين، استخدام 6 أشهر فقط.',
      price: 3400,
      categorySlug: 'furniture',
      subSlug: 'furn-living',
      city: 'الدمام',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'صالون مغربي تقليدي فاخر خشب أرز منقوش يدوياً',
      description: 'صالون مغربي أصيل مصنوع من خشب الأرز الأطلسي الفاخر مع نقش يدوي متقن ومفروشات مطرزة فخمة، يتسع لـ 14 شخصاً مع الطاولات.',
      price: 16500,
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
      title: 'غرفة نوم ماستر كاملة مودرن خشب ماليزي ثقيل 6 قطع',
      description: 'تتكون من سرير كينج 200×200 مع مرتبة طبية فندقية، دولاب جرار كبير بمرآة، 2 كومودينو، تسريحة بإضاءة LED وكرسي مبطن.',
      price: 4800,
      categorySlug: 'furniture',
      subSlug: 'furn-bedroom',
      city: 'الرياض',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'طاولة طعام رخام إيطالي طبيعي 8 كراسي مخمل فاخرة',
      description: 'سفرة طعام فخمة جداً سطح رخام كرارا طبيعي مع قواعد ستانلس ذهبي مطفي و 8 كراسي مريحة جداً، شبه جديدة تماماً.',
      price: 3900,
      categorySlug: 'furniture',
      subSlug: 'furn-tables',
      city: 'جدة',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مطبخ ألمنيوم كلادينج حديث تفصيل مع الرخام الصناعي والشفاط',
      description: 'مطبخ تفصيل مقاس 5×3 متر، مفصلات هيدروليك إيطالي صامتة، مقاوم للماء والحرارة، لونه رمادي فاتح مع خشبي أنيق.',
      price: 6200,
      categorySlug: 'furniture',
      subSlug: 'furn-kitchen',
      city: 'القاهرة',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'سجادة حرير وصوف طبيعي منسوجة بنقشة كلاسيكية مقاس 3×4 متر',
      description: 'سجادة فاخرة كثافة عقد عالية جداً وألوان ثابتة دافئة، تم تنظيفها بالبخار ومغلفة جاهزة للتسليم.',
      price: 1950,
      categorySlug: 'furniture',
      subSlug: 'furn-carpets',
      city: 'الكويت',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مكتب عمل تنفيذي خشب جوز مع كرسي طبي شبكي مريح للظهر',
      description: 'مكتب أنيق للعمل المنزلي أو الشركات مقاس 160 سم مع وحدة أدراج جانبية بقفل وكرسي هيدروليك داعم للفقرات القطنية.',
      price: 1350,
      categorySlug: 'furniture',
      subSlug: 'furn-tables',
      city: 'دبي',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'سرير أطفال دورين خشب زان متين مع سلم عريض وأدراج تخزين',
      description: 'سرير عملي وآمن للأطفال بحواجز حماية جانبية وأدراج سفلية واسعة لتخزين الألعاب والملابس، يشمل المرتبتين.',
      price: 1650,
      categorySlug: 'furniture',
      subSlug: 'furn-bedroom',
      city: 'مكة المكرمة',
      condition: 'USED_GOOD',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },

    // ==================== FASHION (6 Ads) ====================
    {
      title: 'ساعة رولكس صبمارينر ديت ستيل أصلية بالعلبة والضمان',
      description: 'ساعة Rolex Submariner Date أصلية 100% مع الصندوق الأصلي وكرت الضمان الدولي وجميع الوصلات، الفحص متاح لدى الوكيل المعتمد.',
      price: 46000,
      categorySlug: 'fashion',
      subSlug: 'fash-watches',
      city: 'دبي',
      condition: 'LIKE_NEW',
      isFeatured: true,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'ساعة أوميغا سي ماستر أوتوماتيك مينا أزرق بحالة الزيرو',
      description: 'ساعة Omega Seamaster Diver 300M سويسرية أصلية مقاومة للماء مع سوار ستانلس وإضافي مطاطي، مقتنى فاخر لمحبي التميز.',
      price: 16800,
      categorySlug: 'fashion',
      subSlug: 'fash-watches',
      city: 'الرياض',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'بشت حساوي ملكي صوف ياباني زري ألماني شغل يدوي فاخر',
      description: 'بشت مناسبات رسمي فاخر جداً حياكة يدوية دقيقة زري حر لا يتغير لونه، جديد لم يلبس في علبته الفاخرة، يصلح للإهداء.',
      price: 2400,
      categorySlug: 'fashion',
      subSlug: 'fash-men',
      city: 'الأحساء',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'حقيبة يد نسائية جلد إيطالي طبيعي كلاسيكية مع الكيس الأصلي',
      description: 'شنطة نسائية أنيقة جداً لون بيج نيود تتناسب مع كافة الإطلالات الرسمية واليومية، جلد طبيعي فاخر مع الفاتورة والدست باج.',
      price: 1850,
      categorySlug: 'fashion',
      subSlug: 'fash-bags',
      city: 'الدوحة',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'صندوق عود مروكي طبيعي محسن وعطور شرقية مركزة فاخرة',
      description: 'بوكس ملكي يضم أوقيتين عود مروكي فاخر مع دهن عود كمبودي صافي وعطر عنبر عود بثبات يتجاوز 48 ساعة.',
      price: 680,
      categorySlug: 'fashion',
      subSlug: 'fash-perfumes',
      city: 'جدة',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'بدلة رجالية رسمية كحلي إيطالي مقاس 52 قصّة سليم فيت',
      description: 'بدلة رجالية قماش صوف بارد إيطالي فاخر، مكونة من جاكيت وبنطلون وصديري، لبسة واحدة في مناسبة خاصة ومغسولة دراي كلين.',
      price: 950,
      categorySlug: 'fashion',
      subSlug: 'fash-men',
      city: 'القاهرة',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },

    // ==================== JOBS (6 Ads) ====================
    {
      title: 'مطلوب مهندس برمجيات Full-Stack React & Next.js لشركة تقنية',
      description: 'شركة تقنية رائدة بالرياض تبحث عن مطور متمرس في Next.js و TypeScript و PostgreSQL بخبرة 3 سنوات فأكثر، راتب مجزٍ وتأمين طبي عائلي ومرونة في العمل.',
      price: 15000,
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
      title: 'مطلوب مدير تسويق رقمي وإعلانات ممولة بخبرة في التجارة الإلكترونية',
      description: 'مطلوب أخصائي/مدير حملات إعلانية على منصات Meta و Google و TikTok مع قدرة عالية على تحليل الأداء ومضاعفة المبيعات.',
      price: 9500,
      categorySlug: 'jobs',
      subSlug: 'jobs-marketing',
      city: 'دبي',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مطلوب مهندس مدني تنفيذ مواقع لمشروع سكني كبير',
      description: 'شركة مقاولات مصنفة تطلب مهندس مدني خبرة لا تقل عن 5 سنوات في الإشراف على الخرسانات والتشطيبات وإدارة فرق العمل بالموقع.',
      price: 11000,
      categorySlug: 'jobs',
      subSlug: 'jobs-engineering',
      city: 'جدة',
      condition: 'NA',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مطلوب محاسب مالي أول يجيد البرامج المحاسبية وضريبة القيمة المضافة',
      description: 'مجموعة تجارية تطلب محاسب عام خبرة في إعداد القوائم المالية والتقارير الضريبية الشهرية وإجادة تامة لبرنامج الإكسل والأنظمة السحابية.',
      price: 7500,
      categorySlug: 'jobs',
      subSlug: 'jobs-finance',
      city: 'عمان',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مطلوب مصمم جرافيك ومونتير فيديوهات ريلز بدوام كامل',
      description: 'وكالة إبداعية تبحث عن مصمم مبدع يتقن Photoshop و Illustrator و Premiere Pro لتصميم الهويات البصرية ومحتوى السوشيال ميديا.',
      price: 6500,
      categorySlug: 'jobs',
      subSlug: 'jobs-marketing',
      city: 'القاهرة',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مطلوب مناديب توصيل طلبات بسيارة خاصة بدخل شهري وحوافز مجزية',
      description: 'فرصة عمل فورية بأوقات مرنة وعمولات يومية مجزية مع بدل وقود ومكافآت التزام أسبوعية.',
      price: 5500,
      categorySlug: 'jobs',
      subSlug: 'jobs-delivery',
      city: 'الدمام',
      condition: 'NA',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },

    // ==================== SERVICES (5 Ads) ====================
    {
      title: 'شركة نقل عفش وأثاث احترافية مع الفك والتركيب والتغليف الشامل',
      description: 'نقل أثاث داخل وخارج المدينة بسيارات مغلقة ومجهزة، نجارين محترفين لفك وتركيب غرف النوم والمطابخ والمكيفات مع ضمان سلامة المنقولات.',
      price: 450,
      categorySlug: 'services',
      subSlug: 'srv-moving',
      city: 'الرياض',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'فني صيانة وتنظيف وتعبئة فريون مكيفات سبليت ومركزي بالضمان',
      description: 'غسيل مكيفات في موقعها بأحدث المضخات بدون فوضى، كشف تسريبات الفريون وصيانة الكومبروسر بأيدي فنيين معتمدين على مدار الساعة.',
      price: 120,
      categorySlug: 'services',
      subSlug: 'srv-maintenance',
      city: 'جدة',
      condition: 'NA',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'تنظيف فلل وشقق ومجالس وسجاد بالبخار وتعقيم شامل',
      description: 'فريق متخصص لتنظيف الفلل الجديدة والمفروشة، جلي وتلميع الرخام، غسيل الكنب والموكيت بالبخار بمواد آمنة ومعطرة.',
      price: 350,
      categorySlug: 'services',
      subSlug: 'srv-cleaning',
      city: 'دبي',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'تصميم وبرمجة مواقع ومتاجر إلكترونية وتطبيقات جوال احترافية',
      description: 'نصمم ونبرمج متجرك الإلكتروني أو موقع شركتك بأحدث التقنيات السريعة مع ربط بوابات الدفع والشحن وتهيئة محركات البحث SEO.',
      price: 2500,
      categorySlug: 'services',
      subSlug: 'srv-design',
      city: 'القاهرة',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مدرب معتمد لتحضير اختبار الأيلتس IELTS ومحادثة اللغة الإنجليزية',
      description: 'حصص تأسيس وتدريب مكثف حضورياً أو أونلاين لرفع الدرجة في المحادثة والكتابة والقراءة مع اختبارات تجريبية أسبوعية.',
      price: 180,
      categorySlug: 'services',
      subSlug: 'srv-tutoring',
      city: 'الدوحة',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },

    // ==================== PETS & MODERATION QUEUE SAMPLES (5 Ads) ====================
    {
      title: 'قط سكوتش فولد رمادي أليف جداً مطعم بالكامل مع جواز صحي',
      description: 'قط Scottish Fold عمر 5 أشهر، هادئ جداً ويحب اللعب مع الأطفال، متدرب على الليتر بوكس، معه سريره وألعابه والليتر بوكس المغلق.',
      price: 1400,
      categorySlug: 'pets',
      subSlug: 'pets-cats',
      city: 'الرياض',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'ببغاء كاسكو إفريقي ذيل أحمر متكلم وأليف يطلع على اليد',
      description: 'فرخ كاسكو محجل أصلي، ينطق عشرات الكلمات والعبارات بوضوح تام، ريش كامل ومرتب وصحة ممتازة مشروطة مع قفص كبير فاخر.',
      price: 3600,
      categorySlug: 'pets',
      subSlug: 'pets-birds',
      city: 'الكويت',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مهر عربي أصيل مسجل بجمال وحركة استعراضية مميزة',
      description: 'مهر عربي خط جمال، سليم القوائم والأوتار، هادئ في الركوب والمقاود، أوراق النسب وجواز التسجيل جاهزة للنقل.',
      price: 22000,
      categorySlug: 'pets',
      subSlug: 'pets-horses',
      city: 'بريدة (القصيم)',
      condition: 'NA',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'بيت شجري وخداشة قطط 4 طوابق مبطن بالفرو الناعم جديد',
      description: 'برج ألعاب وخداشة حبل سيزال طبيعي للقطط مع بيت نوم معلق وكرات لعب، ارتفاع 145 سم، سهل التركيب ومتين.',
      price: 290,
      categorySlug: 'pets',
      subSlug: 'pets-supplies',
      city: 'القاهرة',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: false,
      images: [
        'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'ACTIVE',
    },
    {
      title: 'مرسيدس E300 موديل 2021 باقة AMG بانتظار المراجعة',
      description: 'مرسيدس E-Class 2021 رمادي سيلينيت، كاميرات 360، بروجكتر، مقاعد جلد، الممشى 45 ألف كم، بحالة الوكالة.',
      price: 215000,
      categorySlug: 'vehicles',
      subSlug: 'vehicles-mercedes',
      city: 'الرياض',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'PENDING',
    },
    {
      title: 'آيفون 15 برو 128 جيجابايت أزرق تيتانيوم نظيف جداً',
      description: 'جهاز آيفون 15 برو نسبة البطارية 96%، خالي من الصيانة أو الخدوش مع العلبة وسلك الشحن الأصلي.',
      price: 3500,
      categorySlug: 'electronics',
      subSlug: 'elec-phones',
      city: 'جدة',
      condition: 'LIKE_NEW',
      isFeatured: false,
      isUrgent: true,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'PENDING',
    },
    {
      title: 'شقة 3 غرف نوم للإيجار في حي الملقا قريبة من البوليفارد',
      description: 'شقة أرضية بمدخل خاص وارتداد خارجي، تشطيب فاخر ومكيفات سبليت راكبة بالكامل.',
      price: 72000,
      categorySlug: 'real-estate',
      subSlug: 're-apartments-rent',
      city: 'الرياض',
      condition: 'NEW',
      isFeatured: false,
      isUrgent: false,
      isNegotiable: true,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop',
      ],
      status: 'PENDING',
    },
  ];

  const isSqlite = (process.env.DATABASE_URL || '').includes('file:');
  let insertedAdsCount = 0;

  for (let i = 0; i < sampleAds.length; i++) {
    const adData = sampleAds[i];
    const existing = await prisma.ad.findFirst({
      where: { title: adData.title },
      select: { id: true },
    });
    if (existing) continue;

    const category = categoryMap.get(adData.categorySlug);
    if (!category) continue;

    const matchedSub = category.subcategories?.find((s: any) => s.slug === adData.subSlug);
    const author = seededUsers[i % seededUsers.length] || admin;
    const imagePayload = isSqlite ? JSON.stringify(adData.images) : (adData.images as any);

    await prisma.ad.create({
      data: {
        title: adData.title,
        description: adData.description,
        price: adData.price,
        categoryId: category.id,
        subcategoryId: matchedSub ? matchedSub.id : null,
        city: adData.city,
        userId: author.id,
        images: imagePayload,
        status: adData.status as any,
        condition: adData.condition,
        isFeatured: adData.isFeatured,
        isUrgent: adData.isUrgent,
        isNegotiable: adData.isNegotiable,
        views: 45 + ((i * 37) % 480),
      },
    });
    insertedAdsCount++;
  }
  console.log(`✓ Added ${insertedAdsCount} new sample ads (Total ads now rich & populated)`);

  // 4. Default Platform Settings (Upsert WITHOUT overwriting existing admin customizations!)
  const defaultSettings = [
    { key: 'siteName', value: 'خشاله - Khashala' },
    { key: 'siteLogoUrl', value: '' },
    { key: 'iconColor', value: '#dc2626' },
    { key: 'iconBgColor', value: '#ffffff' },
    { key: 'supportEmail', value: 'support@khashala.com' },
    { key: 'supportPhone', value: '+966500000001' },
    { key: 'autoApproveAds', value: 'false' },
    { key: 'announcementActive', value: 'true' },
    { key: 'announcementText', value: 'مرحباً بكم في منصة خُشـاله! تصفح آلاف الإعلانات المبوبة الموثوقة في جميع الدول العربية 🚀' },
    { key: 'maintenanceMode', value: 'false' },
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

  for (const s of defaultSettings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: {}, // Preserve any custom logo/color/Paymob settings already saved by Admin!
      create: s,
    });
  }
  console.log('✓ Verified platform & branding settings');

  // 5. Sample Reports for Moderation Testing (Non-Financial)
  const reportCount = await prisma.report.count();
  if (reportCount < 3) {
    const sampleTargetAds = await prisma.ad.findMany({ take: 3 });
    if (sampleTargetAds.length > 0) {
      await prisma.report.create({
        data: {
          adId: sampleTargetAds[0].id,
          reason: 'WRONG_CATEGORY',
          details: 'يرجى التأكد من القسم الفرعي المختار لهذا الإعلان',
          reporterName: 'عبدالله القحطاني',
          reporterPhone: '+966501234567',
          status: 'PENDING',
        },
      });
      if (sampleTargetAds[1]) {
        await prisma.report.create({
          data: {
            adId: sampleTargetAds[1].id,
            reason: 'DUPLICATE',
            details: 'يبدو أن نفس الإعلان مكرر مرتين في نفس المدينة',
            reporterName: 'سارة الشمري',
            reporterPhone: '+966509876543',
            status: 'PENDING',
          },
        });
      }
    }
    console.log('✓ Seeded sample moderation reports');
  }

  // 6. Sample Non-Financial Admin Logs
  const logCount = await prisma.adminLog.count();
  if (logCount < 4) {
    const sampleLogs = [
      { adminName: 'مشرف خشاله', action: 'APPROVE_AD', target: 'تويوتا لاندكروزر GXR 2024', details: 'تمت مراجعة الإعلان والموافقة على نشره' },
      { adminName: 'مشرف خشاله', action: 'ADD_SUBCATEGORY', target: 'نيسان وأمريكي', details: 'إضافة قسم فرعي جديد داخل سيارات ومركبات' },
      { adminName: 'مشرف خشاله', action: 'UPDATE_PLATFORM_SETTINGS', target: 'الهوية البصرية', details: 'ضبط ألوان أيقونات المنصة والشعار الرسمي' },
    ];
    for (const log of sampleLogs) {
      await prisma.adminLog.create({ data: log });
    }
    console.log('✓ Seeded sample operational admin logs');
  }

  // Strictly NO dummy Payment records are ever created!
  console.log('--- Seeding Completed Successfully (Zero Dummy Financial Records) ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
