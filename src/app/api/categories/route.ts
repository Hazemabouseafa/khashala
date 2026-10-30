import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_INIT_CATEGORIES = [
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

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            _count: {
              select: { ads: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { ads: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-seed default categories if database is fresh and has 0 categories
    if (categories.length === 0) {
      for (const cat of DEFAULT_INIT_CATEGORIES) {
        await prisma.category.create({
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
        }).catch(() => null);
      }

      categories = await prisma.category.findMany({
        include: {
          subcategories: {
            include: {
              _count: {
                select: { ads: true },
              },
            },
            orderBy: { name: 'asc' },
          },
          _count: {
            select: { ads: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الأقسام' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بإدارة الأقسام، يتطلب صلاحية المشرف' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Case 1: Adding a Subcategory to an existing Category
    if (body.action === 'add_subcategory' || body.categoryId) {
      const { categoryId, name, slug, icon } = body;
      if (!categoryId || !name) {
        return NextResponse.json(
          { error: 'يرجى تحديد القسم الرئيسي واسم القسم الفرعي' },
          { status: 400 }
        );
      }

      const finalSlug =
        slug && slug.trim()
          ? slug.trim().toLowerCase()
          : `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      const subcategory = await prisma.subcategory.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          icon: icon || 'Tag',
          categoryId,
        },
      });

      await prisma.adminLog.create({
        data: {
          adminName: user.name,
          action: 'ADD_SUBCATEGORY',
          target: subcategory.name,
          details: `إضافة قسم فرعي داخل قسم ID: ${categoryId}`,
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        message: 'تمت إضافة القسم الفرعي بنجاح',
        subcategory,
      });
    }

    // Case 2: Adding a new Main Category
    const { name, slug, icon, subcategories } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'اسم القسم والرابط المختصر (slug) مطلوبان' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: icon || 'Tag',
        subcategories:
          subcategories && Array.isArray(subcategories) && subcategories.length > 0
            ? {
                create: subcategories.map((sub: any) => {
                  if (typeof sub === 'string') {
                    return {
                      name: sub.trim(),
                      slug: `${slug.trim().toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`,
                      icon: icon || 'Tag',
                    };
                  }
                  return {
                    name: sub.name.trim(),
                    slug:
                      sub.slug ||
                      `${slug.trim().toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`,
                    icon: sub.icon || icon || 'Tag',
                  };
                }),
              }
            : undefined,
      },
      include: {
        subcategories: true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminName: user.name,
        action: 'CREATE_CATEGORY',
        target: category.name,
        details: `إنشاء قسم رئيسي جديد: ${category.name}`,
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error creating category/subcategory:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء الإضافة' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل الأقسام' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, id, name, slug, icon, categoryId } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'المعرف والاسم مطلوبان' }, { status: 400 });
    }

    if (action === 'edit_subcategory') {
      const updateData: any = { name: name.trim() };
      if (icon) updateData.icon = icon;
      if (slug) updateData.slug = slug.trim().toLowerCase();
      if (categoryId) updateData.categoryId = categoryId;

      const updated = await prisma.subcategory.update({
        where: { id },
        data: updateData,
      });

      await prisma.adminLog.create({
        data: {
          adminName: user.name,
          action: 'EDIT_SUBCATEGORY',
          target: updated.name,
          details: `تعديل بيانات القسم الفرعي: ${updated.name}`,
        },
      }).catch(() => null);

      return NextResponse.json({ success: true, subcategory: updated });
    }

    // Edit main category
    const updateData: any = { name: name.trim() };
    if (icon) updateData.icon = icon;
    if (slug) updateData.slug = slug.trim().toLowerCase();

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    await prisma.adminLog.create({
      data: {
        adminName: user.name,
        action: 'EDIT_CATEGORY',
        target: updated.name,
        details: `تعديل بيانات القسم الرئيسي: ${updated.name}`,
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Error editing category/subcategory:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء التعديل' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف الأقسام' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const subcategoryId = searchParams.get('subcategoryId');
    const categoryId = searchParams.get('categoryId');

    if (subcategoryId) {
      const sub = await prisma.subcategory.findUnique({ where: { id: subcategoryId } });
      await prisma.subcategory.delete({
        where: { id: subcategoryId },
      });

      await prisma.adminLog.create({
        data: {
          adminName: user.name,
          action: 'DELETE_SUBCATEGORY',
          target: sub?.name || subcategoryId,
          details: 'تم حذف قسم فرعي',
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        message: 'تم حذف القسم الفرعي بنجاح',
      });
    }

    if (categoryId) {
      const adsCount = await prisma.ad.count({ where: { categoryId } });
      if (adsCount > 0) {
        return NextResponse.json(
          { error: `لا يمكن حذف القسم لوجود ${adsCount} إعلان مرتبط به` },
          { status: 400 }
        );
      }
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      await prisma.category.delete({
        where: { id: categoryId },
      });

      await prisma.adminLog.create({
        data: {
          adminName: user.name,
          action: 'DELETE_CATEGORY',
          target: cat?.name || categoryId,
          details: 'تم حذف قسم رئيسي',
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        message: 'تم حذف القسم الرئيسي بنجاح',
      });
    }

    return NextResponse.json({ error: 'لم يتم تحديد المعرف للحذف' }, { status: 400 });
  } catch (error: any) {
    console.error('Error deleting category/subcategory:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الحذف' },
      { status: 500 }
    );
  }
}
