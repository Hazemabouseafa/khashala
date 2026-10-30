import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCountryByName } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const condition = searchParams.get('condition');
    const isFeatured = searchParams.get('isFeatured');
    const isUrgent = searchParams.get('isUrgent');
    const isNegotiable = searchParams.get('isNegotiable');
    const ids = searchParams.get('ids');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    // Build Prisma filter using AND array so multiple OR clauses never collide
    const andFilters: any[] = [];

    // Status filter
    if (status && status !== 'ALL' && status !== 'all') {
      if (isAdmin || (currentUser && userId === currentUser.id)) {
        andFilters.push({ status });
      } else {
        andFilters.push({ status: 'ACTIVE' });
      }
    } else if (userId && currentUser && userId === currentUser.id) {
      // User viewing their own ads in dashboard gets all statuses
    } else if (!isAdmin) {
      andFilters.push({ status: 'ACTIVE' });
    }

    if (userId) {
      andFilters.push({ userId });
    }

    if (ids) {
      const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);
      if (idList.length > 0) {
        andFilters.push({ id: { in: idList } });
      } else {
        return NextResponse.json({ ads: [], count: 0 });
      }
    }

    if (q) {
      andFilters.push({
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { city: { contains: q } },
        ],
      });
    }

    if (category && category !== 'all' && category !== 'ALL') {
      andFilters.push({
        OR: [
          { categoryId: category },
          { category: { slug: category } },
        ],
      });
    }

    if (subcategory && subcategory !== 'all' && subcategory !== 'ALL') {
      andFilters.push({
        OR: [
          { subcategoryId: subcategory },
          { subcategory: { slug: subcategory } },
        ],
      });
    }

    if (city && city !== 'all' && city !== 'ALL') {
      andFilters.push({ city });
    } else if (country && country !== 'all' && country !== 'ALL') {
      const countryObj = getCountryByName(country);
      if (countryObj && countryObj.cities.length > 0) {
        andFilters.push({ city: { in: countryObj.cities } });
      }
    }

    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      andFilters.push({ price: priceFilter });
    }

    if (condition && condition !== 'all' && condition !== 'ALL') {
      andFilters.push({ condition });
    }

    if (isFeatured === 'true') {
      andFilters.push({ isFeatured: true });
    } else if (isFeatured === 'false') {
      andFilters.push({ isFeatured: false });
    }

    if (isUrgent === 'true') {
      andFilters.push({ isUrgent: true });
    }

    if (isNegotiable === 'true') {
      andFilters.push({ isNegotiable: true });
    }

    const where = andFilters.length > 0 ? { AND: andFilters } : {};

    // Determine ordering: Featured Ads ALWAYS appear at the top of category & search listings!
    let orderBy: any = [{ isFeatured: 'desc' }, { isUrgent: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'newest' || sort === 'featured_first') {
      orderBy = [{ isFeatured: 'desc' }, { isUrgent: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'price_asc') {
      orderBy = [{ isFeatured: 'desc' }, { price: 'asc' }];
    } else if (sort === 'price_desc') {
      orderBy = [{ isFeatured: 'desc' }, { price: 'desc' }];
    } else if (sort === 'oldest') {
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'asc' }];
    } else if (sort === 'views_desc') {
      orderBy = [{ isFeatured: 'desc' }, { views: 'desc' }];
    }

    const ads = await prisma.ad.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        category: true,
        subcategory: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    // Helper to normalize images if stringified JSON
    const formattedAds = ads.map((ad: any) => ({
      ...ad,
      images: Array.isArray(ad.images)
        ? ad.images
        : typeof ad.images === 'string'
        ? JSON.parse(ad.images || '[]')
        : [],
    }));

    return NextResponse.json({ ads: formattedAds, count: formattedAds.length });
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإعلانات' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لنشر إعلان' },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.isBanned) {
      return NextResponse.json(
        { error: 'حسابك محظور من نشر الإعلانات من قبل الإدارة. يرجى التواصل مع الدعم الفني.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      price,
      categoryId,
      subcategoryId,
      city,
      images,
      condition,
      isNegotiable,
      isUrgent,
      isFeatured,
    } = body;

    if (!title || !description || price === undefined || !categoryId || !city) {
      return NextResponse.json(
        { error: 'يرجى إكمال جميع الحقول الإلزامية (العنوان، الوصف، السعر، القسم، المدينة)' },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: 'يرجى إدخال سعر صحيح' },
        { status: 400 }
      );
    }

    const imageArray: string[] = Array.isArray(images) ? images : [];

    // Check if auto-approve setting is enabled in platform settings
    const autoSetting = await prisma.platformSetting.findUnique({
      where: { key: 'autoApproveAds' },
    }).catch(() => null);
    const shouldAutoApprove = autoSetting?.value === 'true';

    // Create ad with status PENDING for review (or ACTIVE if admin posts or autoApprove is enabled)
    const initialStatus = user.role === 'ADMIN' || shouldAutoApprove ? 'ACTIVE' : 'PENDING';

    const ad = await prisma.ad.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        categoryId,
        subcategoryId: subcategoryId || null,
        city: city.trim(),
        userId: user.id,
        condition: condition || 'LIKE_NEW',
        isNegotiable: isNegotiable !== undefined ? Boolean(isNegotiable) : true,
        isUrgent: Boolean(isUrgent),
        isFeatured: user.role === 'ADMIN' ? Boolean(isFeatured) : false,
        images: (process.env.DATABASE_URL || '').includes('file:') ? JSON.stringify(imageArray) : (imageArray as any),
        status: initialStatus as any,
      },
      include: {
        category: true,
        subcategory: true,
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: initialStatus === 'ACTIVE' 
        ? 'تم نشر الإعلان بنجاح' 
        : 'تم تقديم إعلانك وهو قيد المراجعة حالياً من قبل الإدارة',
      ad,
    });
  } catch (error: any) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ الإعلان' },
      { status: 500 }
    );
  }
}
