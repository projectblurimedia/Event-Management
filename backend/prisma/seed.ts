import { PrismaClient, type ServiceUnit, type PackageStepKind } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const placeholderImage = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

/**
 * Rough starting prices per category (no per-dish pricing exists in the
 * source catalogue) — a flat base with a small premium bump for
 * richer/dry-fruit/paneer/cashew items. Admin can adjust any of these later.
 */
function priceFor(categorySlug: string, name: string): number {
  const n = name.toLowerCase();
  const premium = /kaju|pista|kashmir|dry fruit|badam|agra|bengali|paneer|cashew|mushroom|navratan/.test(n);

  const table: Record<string, [base: number, premium: number]> = {
    sweets: [160, 260],
    hots: [110, 150],
    biryanis: [220, 270],
    'flavoured-rice': [140, 180],
    'fried-rice': [150, 190],
    curries: [180, 230],
    fries: [120, 140],
    'chutneys-pickles': [90, 140],
  };
  const [base, premiumPrice] = table[categorySlug] ?? [150, 200];
  return premium ? premiumPrice : base;
}

async function main() {
  // ---- Admin user ----
  const adminPassword = 'ChangeMe@123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: 'harithakotha6131@gmail.com' },
    update: { phone: '9391522508' },
    create: {
      name: 'Haritha Kotha',
      email: 'harithakotha6131@gmail.com',
      phone: '9391522508',
      passwordHash,
    },
  });

  // ---- Site settings ----
  const siteSettingsTe = {
    heroHeadlineTe: 'మర్చిపోలేని వివాహాలు & వేడుకలను రూపొందిస్తున్నాం',
    heroSubheadlineTe:
      'పూర్తి స్థాయి వివాహ ప్రణాళిక, క్యాటరింగ్, అలంకరణ మరియు ఈవెంట్ నిర్వహణ — చిన్న గృహప్రవేశం నుండి గొప్ప వివాహ రిసెప్షన్ వరకు.',
    businessIntroTitleTe: 'ప్రతి సందర్భానికి ప్రీమియం ఈవెంట్ భాగస్వామి',
    businessIntroTextTe:
      'MS వెడ్డింగ్ ప్లానర్ క్యాటరింగ్, అలంకరణ, ఫోటోగ్రఫీ మరియు వినోదాన్ని ఒకే గొడుగు కింద తీసుకువస్తుంది — తద్వారా మీరు డజన్ల కొద్దీ వెండార్లతో సతమతం కాకుండా లోపరహితమైన వివాహం, పుట్టినరోజు, గృహప్రవేశం, నిశ్చితార్థం లేదా కార్పొరేట్ ఈవెంట్‌ను నిర్వహించవచ్చు.',
  };
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: siteSettingsTe,
    create: {
      id: 'singleton',
      businessName: 'MS Wedding Planner',
      organiser: 'Haritha Kotha',
      phone: '9391522508',
      whatsapp: '919391522508',
      email: 'harithakotha6131@gmail.com',
      address: 'Yerrampeta, Eluru, Andhra Pradesh, India',
      mapEmbedUrl: 'https://www.google.com/maps?q=Yerrampeta,Eluru,Andhra+Pradesh,India&output=embed',
      heroHeadline: 'Crafting Unforgettable Weddings & Celebrations',
      heroSubheadline:
        'Full-service wedding planning, catering, decoration and event management — from an intimate housewarming to a grand wedding reception.',
      heroImageUrl: placeholderImage('hero-banner'),
      businessIntroTitle: 'A Premium Event Partner for Every Occasion',
      businessIntroText:
        'MS Wedding Planner brings together catering, decoration, photography and entertainment under one roof — so you can host a flawless wedding, birthday, housewarming, engagement or corporate event without juggling a dozen vendors.',
      ...siteSettingsTe,
    },
  });

  // ---- Menu categories + items (from the Food Catalogue Book) ----
  // Each item is [English name, Telugu name].
  const categories: { name: string; nameTe: string; slug: string; items: [string, string][] }[] = [
    {
      name: 'Sweets',
      nameTe: 'స్వీట్స్',
      slug: 'sweets',
      items: [
        ['Sithaphal Rabidi', 'సీతాఫల్ రబిడి'], ['Sapota Rabidi', 'సపోటా రబిడి'], ['Kiwi Rabidi', 'కివీ రబిడి'],
        ['Dry Fruit Rabidi', 'డ్రై ఫ్రూట్ రబిడి'], ['Dry Fruit Basanti', 'డ్రై ఫ్రూట్ బసంతి'], ['Custard Basanti', 'కస్టర్డ్ బసంతి'],
        ['Angur Basanti', 'అంగూర్ బసంతి'], ['Gulab Jamun Rabidi', 'గులాబ్ జామున్ రబిడి'], ['African Delight', 'ఆఫ్రికన్ డిలైట్'],
        ['Mango Delight', 'మామిడి డిలైట్'], ['Strawberry Delight', 'స్ట్రాబెర్రీ డిలైట్'], ['Pineapple Delight', 'పైనాపిల్ డిలైట్'],
        ['Doodh Halwa', 'దూద్ హల్వా'], ['Pineapple Halwa', 'పైనాపిల్ హల్వా'], ['Badam Halwa', 'బాదం హల్వా'],
        ['Neredu Halwa', 'నేరేడు హల్వా'], ['Mango Halwa', 'మామిడి హల్వా'], ['Honey Halwa', 'తేనె హల్వా'],
        ['Bandar Halwa', 'బందర్ హల్వా'], ['Grape Halwa', 'ద్రాక్ష హల్వా'], ['Chakra Pongali', 'చక్ర పొంగలి'],
        ['Semiya Chakra Pongali', 'సేమియా చక్ర పొంగలి'], ['Bread Halwa', 'బ్రెడ్ హల్వా'], ['3D Halwa', '3డి హల్వా'],
        ['Dry Fruit Halwa', 'డ్రై ఫ్రూట్ హల్వా'], ['Mango Dry Fruit Halwa', 'మామిడి డ్రై ఫ్రూట్ హల్వా'], ['Kova Boori', 'కోవా బూరి'],
        ['Gulab Jam Boori', 'గులాబ్ జామ్ బూరి'], ['Ravva Kesari Boori', 'రవ్వ కేసరి బూరి'], ['Poornam Boori', 'పూర్ణం బూరి'],
        ['Kasi Boori', 'కాశీ బూరి'], ['Junnu', 'జున్ను'], ['Double Ka Meetha', 'డబుల్ కా మీఠా'],
        ['Ravva Chumchum', 'రవ్వ చంచం'], ['Kaddu Ka Kheer', 'గుమ్మడికాయ ఖీర్'], ['Gummadikaya Halwa', 'గుమ్మడికాయ హల్వా'],
        ['Bobbatlu', 'బొబ్బట్లు'], ['Kova Poori', 'కోవా పూరి'], ['Malai Poori', 'మలై పూరి'],
        ['Kashmiri Burfi', 'కాశ్మీరీ బర్ఫీ'], ['Kaju Sandwich', 'కాజు శాండ్‌విచ్'], ['Kaju Bullet', 'కాజు బుల్లెట్'],
        ['Kaju Pene Cups', 'కాజు పెనే కప్స్'], ['Strawberry Raki', 'స్ట్రాబెర్రీ రాకి'], ['Strawberry Sandwich', 'స్ట్రాబెర్రీ శాండ్‌విచ్'],
        ['Pista Sandwich', 'పిస్తా శాండ్‌విచ్'], ['Pista Biscuit', 'పిస్తా బిస్కెట్'], ['Kaju Cutlet', 'కాజు కట్లెట్'],
        ['Pista Roll', 'పిస్తా రోల్'], ['Kaju Roll', 'కాజు రోల్'], ['Dry Fruit Papdi', 'డ్రై ఫ్రూట్ పాప్డీ'],
        ['Agra Sandwich', 'ఆగ్రా శాండ్‌విచ్'], ['Agra Paan', 'ఆగ్రా పాన్'], ['Kaju Barfi', 'కాజు బర్ఫీ'],
        ['Kaju Jamun', 'కాజు జామున్'], ['Grape Sandwich', 'ద్రాక్ష శాండ్‌విచ్'], ['Bengali Sweet', 'బెంగాలీ స్వీట్'],
        ['Gulab Jamun', 'గులాబ్ జామున్'], ['Kala Jamun', 'కాలా జామున్'], ['Paneer Jalebi', 'పన్నీర్ జిలేబీ'],
        ['Kaju Badam Biscuit', 'కాజు బాదం బిస్కెట్'], ['Anjeer Raki', 'అంజీర్ రాకి'],
      ],
    },
    {
      name: 'Hots',
      nameTe: 'హాట్స్',
      slug: 'hots',
      items: [
        ['Mirchi Bajji', 'మిర్చి బజ్జి'], ['Masala Vada', 'మసాలా వడ'], ['Baby Corn Bajji', 'బేబీ కార్న్ బజ్జి'],
        ['Capsicum Bajji', 'క్యాప్సికం బజ్జి'], ['Mini Capsicum Bajji', 'మినీ క్యాప్సికం బజ్జి'], ['Veg Lollipop', 'వెజ్ లాలీపాప్'],
        ['Samosa', 'సమోసా'], ['Rolls', 'రోల్స్'], ['Paneer Rolls', 'పన్నీర్ రోల్స్'],
        ['Veg Cutlet', 'వెజ్ కట్లెట్'], ['Mirchi Cut Bajji', 'మిర్చి కట్ బజ్జి'], ['Paneer Tikka', 'పన్నీర్ టిక్కా'],
        ['Momos', 'మోమోస్'], ['Money Bags', 'మనీ బ్యాగ్స్'], ['Masala Kulcha', 'మసాలా కుల్చా'],
        ['Veg Nuggets', 'వెజ్ నగెట్స్'], ['Paneer Papad', 'పన్నీర్ పాపడ్'], ['Roti', 'రొట్టె'],
        ['Pulka', 'పుల్కా'], ['Rumali Roti', 'రుమాలి రొట్టె'], ['Butter Naan', 'బటర్ నాన్'],
        ['Veg Spring Roll', 'వెజ్ స్ప్రింగ్ రోల్'], ['Shanghai Roll Veg', 'షాంఘై రోల్ వెజ్'], ['Gold Coin', 'గోల్డ్ కాయిన్'],
      ],
    },
    {
      name: "Biryani's",
      nameTe: 'బిర్యానీలు',
      slug: 'biryanis',
      items: [
        ['Veg Dum Biryani', 'వెజ్ దమ్ బిర్యానీ'], ['Paneer Biryani', 'పన్నీర్ బిర్యానీ'], ['Mushroom Biryani', 'మష్రూమ్ బిర్యానీ'],
        ['Paneer Tikka Biryani', 'పన్నీర్ టిక్కా బిర్యానీ'], ['Pachi Mirchi Biryani', 'పచ్చి మిర్చి బిర్యానీ'], ['Manchurian Biryani', 'మంచూరియన్ బిర్యానీ'],
        ['Panasa Biryani', 'పనస బిర్యానీ'], ['Kashmiri Biryani', 'కాశ్మీరీ బిర్యానీ'], ['Rajma Biryani', 'రాజ్మా బిర్యానీ'],
        ['Gongura Biryani', 'గోంగూర బిర్యానీ'], ['Ulavacharu Biryani', 'ఉలవచారు బిర్యానీ'], ['Gobi Biryani', 'గోబీ బిర్యానీ'],
        ['Baby Corn Biryani', 'బేబీ కార్న్ బిర్యానీ'], ['Cashew Biryani', 'జీడిపప్పు బిర్యానీ'], ['Veg Chicken Biryani', 'వెజ్ చికెన్ బిర్యానీ'],
        ['Veg Mutton Biryani', 'వెజ్ మటన్ బిర్యానీ'],
      ],
    },
    {
      name: 'Flavoured Rice',
      nameTe: 'ఫ్లేవర్డ్ రైస్',
      slug: 'flavoured-rice',
      items: [
        ['Lemon Rice', 'నిమ్మకాయ అన్నం'], ['Coconut Rice', 'కొబ్బరి అన్నం'], ['Tamarind Rice (Pulihora)', 'చింతపండు అన్నం (పులిహోర)'],
        ['Mint Rice', 'పుదీనా అన్నం'], ['Coriander Rice', 'కొత్తిమీర అన్నం'], ['Tomato Rice', 'టమాటా అన్నం'],
        ['Gongura Rice', 'గోంగూర అన్నం'], ['Ulavacharu Rice', 'ఉలవచారు అన్నం'], ['Jeera Rice', 'జీరా రైస్'],
        ['Pudina Pulao', 'పుదీనా పులావ్'], ['Kashmiri Pulao', 'కాశ్మీరీ పులావ్'], ['Navratan Pulao', 'నవరత్న పులావ్'],
        ['Veg Pulao', 'వెజ్ పులావ్'], ['Paneer Pulao', 'పన్నీర్ పులావ్'], ['Mushroom Pulao', 'మష్రూమ్ పులావ్'],
      ],
    },
    {
      name: 'Fried Rice',
      nameTe: 'ఫ్రైడ్ రైస్',
      slug: 'fried-rice',
      items: [
        ['Mushroom Fried Rice', 'మష్రూమ్ ఫ్రైడ్ రైస్'], ['Paneer Fried Rice', 'పన్నీర్ ఫ్రైడ్ రైస్'], ['Baby Corn Fried Rice', 'బేబీ కార్న్ ఫ్రైడ్ రైస్'],
        ['Gobi Fried Rice', 'గోబీ ఫ్రైడ్ రైస్'], ['Corn Fried Rice', 'కార్న్ ఫ్రైడ్ రైస్'], ['Mixed Vegetable Fried Rice', 'మిక్స్‌డ్ వెజిటబుల్ ఫ్రైడ్ రైస్'],
        ['Jeera Fried Rice', 'జీరా ఫ్రైడ్ రైస్'], ['Green Peas Fried Rice', 'పచ్చి బఠానీ ఫ్రైడ్ రైస్'], ['Cashew Fried Rice', 'జీడిపప్పు ఫ్రైడ్ రైస్'],
        ['Manchurian Fried Rice', 'మంచూరియన్ ఫ్రైడ్ రైస్'],
      ],
    },
    {
      name: 'Curries',
      nameTe: 'కర్రీలు',
      slug: 'curries',
      items: [
        ['Pappu (All Varieties)', 'పప్పు (అన్ని రకాలు)'], ['Veg Chicken Curry', 'వెజ్ చికెన్ కర్రీ'], ['Veg Mutton Curry', 'వెజ్ మటన్ కర్రీ'],
        ['Kaju Mullakada Curry', 'కాజు ములకడ కర్రీ'], ['Gutti Dondakaya Curry', 'గుత్తి దొండకాయ కర్రీ'], ['Gutti Vankaya Ulavacharu', 'గుత్తి వంకాయ ఉలవచారు'],
        ['Podi Curry', 'పొడి కర్రీ'], ['Big Beans Curry', 'పెద్ద బీన్స్ కర్రీ'], ['Pulamakani Curry', 'పులమకని కర్రీ'],
        ['Mushroom Gongura Curry', 'మష్రూమ్ గోంగూర కర్రీ'], ['Velluli Rekalu Curry', 'వెల్లుల్లి రెకలు కర్రీ'], ['Panasa Mukkala Curry', 'పనస ముక్కల కర్రీ'],
        ['Kaju Mango Curry', 'కాజు మామిడి కర్రీ'], ['Paneer Butter Masala', 'పన్నీర్ బటర్ మసాలా'], ['Kadai Paneer', 'కడాయి పన్నీర్'],
        ['Palak Paneer', 'పాలక్ పన్నీర్'], ['Paneer Tikka Masala', 'పన్నీర్ టిక్కా మసాలా'], ['Veg Korma', 'వెజ్ కుర్మా'],
        ['Navratan Korma', 'నవరత్న కుర్మా'], ['Mixed Vegetable Curry', 'మిక్స్‌డ్ వెజిటబుల్ కర్రీ'], ['Dum Aloo', 'దమ్ ఆలూ'],
        ['Aloo Gobi', 'ఆలూ గోబీ'], ['Aloo Matar', 'ఆలూ మటర్'], ['Mushroom Masala', 'మష్రూమ్ మసాలా'],
        ['Mushroom Pepper Masala', 'మష్రూమ్ పెప్పర్ మసాలా'], ['Baby Corn Masala', 'బేబీ కార్న్ మసాలా'], ['Baby Corn Capsicum Curry', 'బేబీ కార్న్ క్యాప్సికం కర్రీ'],
        ['Corn Masala', 'కార్న్ మసాలా'], ['Capsicum Masala', 'క్యాప్సికం మసాలా'], ['Cashew Curry', 'జీడిపప్పు కర్రీ'],
        ['Green Peas Masala', 'పచ్చి బఠానీ మసాలా'], ['Chana Masala', 'చనా మసాలా'], ['Rajma Masala', 'రాజ్మా మసాలా'],
        ['Gutti Vankaya Curry', 'గుత్తి వంకాయ కర్రీ'], ['Beerakaya Curry', 'బీరకాయ కర్రీ'], ['Sorakaya Curry', 'సొరకాయ కర్రీ'],
        ['Dosakaya Mukkala Kura', 'దోసకాయ ముక్కల కూర'], ['Aratikaya Masala Curry', 'అరటికాయ మసాలా కర్రీ'], ['Chikkudukaya Curry', 'చిక్కుడుకాయ కర్రీ'],
        ['Bendakaya Fry Curry', 'బెండకాయ ఫ్రై కర్రీ'], ['Cabbage Peas Curry', 'క్యాబేజీ బఠానీ కర్రీ'], ['Cauliflower Masala', 'కాలిఫ్లవర్ మసాలా'],
        ['Brinjal Tomato Curry', 'వంకాయ టమాటా కర్రీ'], ['Tomato Cashew Curry', 'టమాటా జీడిపప్పు కర్రీ'], ['Methi Chaman', 'మేతీ చమన్'],
        ['Veg Kolhapuri', 'వెజ్ కొల్హాపురి'], ['Andhra Style Mixed Veg Curry', 'ఆంధ్రా స్టైల్ మిక్స్‌డ్ వెజ్ కర్రీ'], ['Gongura Paneer Curry', 'గోంగూర పన్నీర్ కర్రీ'],
        ['Gongura Mushroom Curry', 'గోంగూర మష్రూమ్ కర్రీ'], ['Gongura Chana Curry', 'గోంగూర చనా కర్రీ'], ['Kaju Tomato Curry', 'కాజు టమాటా కర్రీ'],
        ['Coconut Vegetable Curry', 'కొబ్బరి వెజిటబుల్ కర్రీ'],
      ],
    },
    {
      name: 'Fries',
      nameTe: 'ఫ్రైస్',
      slug: 'fries',
      items: [
        ['Potato Fry', 'బంగాళదుంప ఫ్రై'], ['Baby Potato Fry', 'బేబీ బంగాళదుంప ఫ్రై'], ['Aratikaya Fry', 'అరటికాయ ఫ్రై'],
        ['Bendakaya Fry', 'బెండకాయ ఫ్రై'], ['Dondakaya Fry', 'దొండకాయ ఫ్రై'], ['Vankaya Fry', 'వంకాయ ఫ్రై'],
        ['Gutti Vankaya Fry', 'గుత్తి వంకాయ ఫ్రై'], ['Capsicum Fry', 'క్యాప్సికం ఫ్రై'], ['Baby Corn Fry', 'బేబీ కార్న్ ఫ్రై'],
        ['Gobi Fry', 'గోబీ ఫ్రై'], ['Gobi 65', 'గోబీ 65'], ['Kakarakaya Fry', 'కాకరకాయ ఫ్రై'],
        ['Mixed Vegetable Fry', 'మిక్స్‌డ్ వెజిటబుల్ ఫ్రై'], ['Brinjal Masala Fry', 'వంకాయ మసాలా ఫ్రై'], ['Cabbage 65', 'క్యాబేజీ 65'],
        ['Alu Karapusa', 'ఆలూ కరప్పూస'], ['Kanda Karapusa', 'కంద కరప్పూస'], ['Chemadumpala Fry', 'చేమదుంపల ఫ్రై'],
      ],
    },
    {
      name: 'Chutneys & Pickles',
      nameTe: 'చట్నీలు & పచ్చళ్ళు',
      slug: 'chutneys-pickles',
      items: [
        ['Mango Pickle', 'మామిడి పచ్చడి'], ['Gongura Pickle', 'గోంగూర పచ్చడి'], ['Tomato Pickle', 'టమాటా పచ్చడి'],
        ['Lemon Pickle', 'నిమ్మకాయ పచ్చడి'], ['Amla Pickle', 'ఉసిరి పచ్చడి'], ['Garlic Pickle', 'వెల్లుల్లి పచ్చడి'],
        ['Ginger Pickle (Allam Pachadi)', 'అల్లం పచ్చడి'], ['Red Chilli Pickle', 'ఎర్ర మిర్చి పచ్చడి'], ['Dosakaya Pickle', 'దోసకాయ పచ్చడి'],
        ['Pandu Mirchi Pickle', 'పండు మిర్చి పచ్చడి'], ['Mixed Vegetable Pickle', 'మిక్స్‌డ్ వెజిటబుల్ పచ్చడి'], ['Carrot Pickle', 'క్యారెట్ పచ్చడి'],
        ['Beetroot Pickle', 'బీట్‌రూట్ పచ్చడి'], ['Kaju Grape Avakaya', 'కాజు ద్రాక్ష ఆవకాయ'], ['Guava Avakaya', 'జామ ఆవకాయ'],
        ['Green Apple Avakaya', 'గ్రీన్ యాపిల్ ఆవకాయ'],
      ],
    },
  ];

  // Clear out any menu categories/items from a previous, non-catalogue-sourced seed.
  const catalogueSlugs = categories.map((c) => c.slug);
  const staleCategories = await prisma.menuCategory.findMany({ where: { slug: { notIn: catalogueSlugs } } });
  if (staleCategories.length) {
    await prisma.menuCategory.deleteMany({ where: { id: { in: staleCategories.map((c) => c.id) } } });
  }

  for (const [index, category] of categories.entries()) {
    const created = await prisma.menuCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, nameTe: category.nameTe, order: index },
      create: { name: category.name, nameTe: category.nameTe, slug: category.slug, order: index },
    });

    const itemNames = category.items.map(([name]) => name);
    await prisma.menuItem.deleteMany({ where: { categoryId: created.id, name: { notIn: itemNames } } });

    for (const [name, nameTe] of category.items) {
      const price = priceFor(category.slug, name);
      const existing = await prisma.menuItem.findFirst({ where: { categoryId: created.id, name } });
      if (!existing) {
        await prisma.menuItem.create({
          data: { categoryId: created.id, name, nameTe, price, isVeg: true, isFeatured: false },
        });
      } else if (Number(existing.price) !== price || !existing.isVeg || existing.nameTe !== nameTe) {
        await prisma.menuItem.update({ where: { id: existing.id }, data: { price, isVeg: true, nameTe } });
      }
    }
  }

  // ---- Packages (from the Food Catalogue Book's "3 Packages Available") ----
  const packages = [
    {
      tier: 'SILVER' as const,
      name: 'Silver Package',
      nameTe: 'సిల్వర్ ప్యాకేజీ',
      description: 'Simple • Elegant • Memorable',
      descriptionTe: 'సింపుల్ • ఎలిగెంట్ • మెమరబుల్',
      pricePerGuest: 650,
      items: [
        ['Delicious Food Menu', 'రుచికరమైన ఆహార మెనూ'],
        ['Basic Decoration', 'ప్రాథమిక అలంకరణ'],
        ['Welcome Drinks', 'స్వాగత పానీయాలు'],
        ['Sound System', 'సౌండ్ సిస్టమ్'],
        ['Event Manager', 'ఈవెంట్ మేనేజర్'],
        ['Clean & Premium Service', 'శుభ్రమైన & ప్రీమియం సేవ'],
      ] as [string, string][],
    },
    {
      tier: 'GOLD' as const,
      name: 'Gold Package',
      nameTe: 'గోల్డ్ ప్యాకేజీ',
      description: 'Premium • Stylish • Perfect',
      descriptionTe: 'ప్రీమియం • స్టైలిష్ • పర్ఫెక్ట్',
      pricePerGuest: 950,
      items: [
        ['Premium Food Menu', 'ప్రీమియం ఆహార మెనూ'],
        ['Elegant Decoration', 'సొగసైన అలంకరణ'],
        ['Welcome Drinks & Mocktails', 'స్వాగత పానీయాలు & మాక్‌టెయిల్స్'],
        ['Sound & Lighting', 'సౌండ్ & లైటింగ్'],
        ['Anchoring', 'యాంకరింగ్'],
        ['Photography', 'ఫోటోగ్రఫీ'],
        ['Event Manager', 'ఈవెంట్ మేనేజర్'],
        ['Clean & Premium Service', 'శుభ్రమైన & ప్రీమియం సేవ'],
      ] as [string, string][],
    },
    {
      tier: 'PLATINUM' as const,
      name: 'Platinum Package',
      nameTe: 'ప్లాటినం ప్యాకేజీ',
      description: 'Luxury • Grand • Unforgettable',
      descriptionTe: 'లగ్జరీ • గ్రాండ్ • అన్‌ఫర్గెటబుల్',
      pricePerGuest: 1450,
      items: [
        ['Royal Food Menu (Multi Cuisine)', 'రాయల్ ఆహార మెనూ (బహుళ వంటకాలు)'],
        ['Grand Decoration & Theme', 'గ్రాండ్ అలంకరణ & థీమ్'],
        ['Welcome Drinks, Mocktails & Live Counters', 'స్వాగత పానీయాలు, మాక్‌టెయిల్స్ & లైవ్ కౌంటర్లు'],
        ['Sound, Lighting & LED Setup', 'సౌండ్, లైటింగ్ & LED సెటప్'],
        ['Professional Anchoring', 'ప్రొఫెషనల్ యాంకరింగ్'],
        ['Photography & Videography', 'ఫోటోగ్రఫీ & వీడియోగ్రఫీ'],
        ['Entertainment (Live Acts/DJ)', 'వినోదం (లైవ్ యాక్ట్స్/డిజె)'],
        ['Bridal Services Support', 'బ్రైడల్ సర్వీసెస్ సపోర్ట్'],
        ['Event Manager (Full Support)', 'ఈవెంట్ మేనేజర్ (పూర్తి మద్దతు)'],
        ['Clean, Premium & Luxury Service', 'శుభ్రమైన, ప్రీమియం & లగ్జరీ సేవ'],
      ] as [string, string][],
    },
  ];

  const packageIds: Record<string, string> = {};

  for (const pkg of packages) {
    const created = await prisma.package.upsert({
      where: { tier: pkg.tier },
      update: {
        name: pkg.name,
        nameTe: pkg.nameTe,
        description: pkg.description,
        descriptionTe: pkg.descriptionTe,
        pricePerGuest: pkg.pricePerGuest,
        imageUrl: placeholderImage(`package-${pkg.tier.toLowerCase()}`),
      },
      create: {
        tier: pkg.tier,
        name: pkg.name,
        nameTe: pkg.nameTe,
        description: pkg.description,
        descriptionTe: pkg.descriptionTe,
        pricePerGuest: pkg.pricePerGuest,
        imageUrl: placeholderImage(`package-${pkg.tier.toLowerCase()}`),
      },
    });
    packageIds[pkg.tier] = created.id;

    await prisma.packageItem.deleteMany({ where: { packageId: created.id } });
    await prisma.packageItem.createMany({
      data: pkg.items.map(([label, labelTe], order) => ({ packageId: created.id, label, labelTe, order })),
    });
  }

  // ---- Service categories (the add-on options behind each package's
  // bullet list — e.g. Gold's "Sound & Lighting" bullet becomes a step
  // where the customer picks one of a few priced tiers). Rough pricing,
  // fully editable by the admin. ----
  const serviceCategoryDefs: {
    name: string;
    nameTe: string;
    slug: string;
    allowMultiple: boolean;
    options: { name: string; nameTe: string; price: number; unit: ServiceUnit }[];
  }[] = [
    {
      name: 'Decoration',
      nameTe: 'అలంకరణ',
      slug: 'decoration',
      allowMultiple: false,
      options: [
        { name: 'Basic Decoration', nameTe: 'ప్రాథమిక అలంకరణ', price: 8000, unit: 'FLAT' },
        { name: 'Elegant Decoration', nameTe: 'సొగసైన అలంకరణ', price: 15000, unit: 'FLAT' },
        { name: 'Grand Decoration & Theme', nameTe: 'గ్రాండ్ అలంకరణ & థీమ్', price: 28000, unit: 'FLAT' },
      ],
    },
    {
      name: 'Welcome Drinks',
      nameTe: 'స్వాగత పానీయాలు',
      slug: 'welcome-drinks',
      allowMultiple: false,
      options: [
        { name: 'Welcome Drinks', nameTe: 'స్వాగత పానీయాలు', price: 30, unit: 'PER_GUEST' },
        { name: 'Welcome Drinks & Mocktails', nameTe: 'స్వాగత పానీయాలు & మాక్‌టెయిల్స్', price: 60, unit: 'PER_GUEST' },
        { name: 'Welcome Drinks, Mocktails & Live Counters', nameTe: 'స్వాగత పానీయాలు, మాక్‌టెయిల్స్ & లైవ్ కౌంటర్లు', price: 120, unit: 'PER_GUEST' },
      ],
    },
    {
      name: 'Sound & Lighting',
      nameTe: 'సౌండ్ & లైటింగ్',
      slug: 'sound-lighting',
      allowMultiple: false,
      options: [
        { name: 'Sound System', nameTe: 'సౌండ్ సిస్టమ్', price: 6000, unit: 'FLAT' },
        { name: 'Sound & Lighting', nameTe: 'సౌండ్ & లైటింగ్', price: 12000, unit: 'FLAT' },
        { name: 'Sound, Lighting & LED Setup', nameTe: 'సౌండ్, లైటింగ్ & LED సెటప్', price: 22000, unit: 'FLAT' },
      ],
    },
    {
      name: 'Anchoring',
      nameTe: 'యాంకరింగ్',
      slug: 'anchoring',
      allowMultiple: false,
      options: [
        { name: 'Anchoring', nameTe: 'యాంకరింగ్', price: 5000, unit: 'FLAT' },
        { name: 'Professional Anchoring', nameTe: 'ప్రొఫెషనల్ యాంకరింగ్', price: 10000, unit: 'FLAT' },
      ],
    },
    {
      name: 'Photography & Videography',
      nameTe: 'ఫోటోగ్రఫీ & వీడియోగ్రఫీ',
      slug: 'photography-videography',
      allowMultiple: false,
      options: [
        { name: 'Photography', nameTe: 'ఫోటోగ్రఫీ', price: 12000, unit: 'FLAT' },
        { name: 'Photography & Videography', nameTe: 'ఫోటోగ్రఫీ & వీడియోగ్రఫీ', price: 25000, unit: 'FLAT' },
      ],
    },
    {
      name: 'Entertainment (Live Acts/DJ)',
      nameTe: 'వినోదం (లైవ్ యాక్ట్స్/డిజె)',
      slug: 'entertainment',
      allowMultiple: false,
      options: [
        { name: 'DJ', nameTe: 'డిజె', price: 15000, unit: 'FLAT' },
        { name: 'Live Acts & DJ Combo', nameTe: 'లైవ్ యాక్ట్స్ & డిజె కాంబో', price: 30000, unit: 'FLAT' },
      ],
    },
    {
      name: 'Bridal Services Support',
      nameTe: 'బ్రైడల్ సర్వీసెస్ సపోర్ట్',
      slug: 'bridal-services',
      allowMultiple: false,
      options: [
        { name: 'Bridal Services Support', nameTe: 'బ్రైడల్ సర్వీసెస్ సపోర్ట్', price: 10000, unit: 'FLAT' },
        { name: 'Premium Bridal Styling', nameTe: 'ప్రీమియం బ్రైడల్ స్టైలింగ్', price: 20000, unit: 'FLAT' },
      ],
    },
  ];

  const categoryIds: Record<string, string> = {};

  for (const [index, cat] of serviceCategoryDefs.entries()) {
    const created = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameTe: cat.nameTe, allowMultiple: cat.allowMultiple, order: index },
      create: { name: cat.name, nameTe: cat.nameTe, slug: cat.slug, allowMultiple: cat.allowMultiple, order: index },
    });
    categoryIds[cat.slug] = created.id;

    await prisma.serviceOption.deleteMany({
      where: { categoryId: created.id, name: { notIn: cat.options.map((o) => o.name) } },
    });

    for (const [optIndex, opt] of cat.options.entries()) {
      const existing = await prisma.serviceOption.findFirst({ where: { categoryId: created.id, name: opt.name } });
      if (!existing) {
        await prisma.serviceOption.create({
          data: { categoryId: created.id, name: opt.name, nameTe: opt.nameTe, price: opt.price, unit: opt.unit, order: optIndex },
        });
      } else if (Number(existing.price) !== opt.price || existing.unit !== opt.unit || existing.nameTe !== opt.nameTe) {
        await prisma.serviceOption.update({
          where: { id: existing.id },
          data: { price: opt.price, unit: opt.unit, order: optIndex, nameTe: opt.nameTe },
        });
      }
    }
  }

  // ---- Package wizard flows — the ordered steps each package walks the
  // customer through, matching that package's bullet list. Every step past
  // Food is skippable in the wizard if the customer doesn't want it. ----
  const packageStepDefs: Record<string, { kind: PackageStepKind; categorySlug?: string }[]> = {
    SILVER: [
      { kind: 'FOOD' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'decoration' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'welcome-drinks' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'sound-lighting' },
    ],
    GOLD: [
      { kind: 'FOOD' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'decoration' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'welcome-drinks' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'sound-lighting' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'anchoring' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'photography-videography' },
    ],
    PLATINUM: [
      { kind: 'FOOD' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'decoration' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'welcome-drinks' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'sound-lighting' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'anchoring' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'photography-videography' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'entertainment' },
      { kind: 'SERVICE_CATEGORY', categorySlug: 'bridal-services' },
    ],
  };

  for (const [tier, steps] of Object.entries(packageStepDefs)) {
    const packageId = packageIds[tier];
    await prisma.packageStep.deleteMany({ where: { packageId } });
    await prisma.packageStep.createMany({
      data: steps.map((step, order) => ({
        packageId,
        order,
        kind: step.kind,
        serviceCategoryId: step.categorySlug ? categoryIds[step.categorySlug] : undefined,
      })),
    });
  }

  // Gallery, Testimonials and FAQs are intentionally not seeded here — none
  // of that is sourced from the Food Catalogue Book. The features stay
  // fully available; the admin can add real gallery photos, testimonials
  // and FAQs (in English and/or Telugu) any time from the admin panel, and
  // re-running this seed won't touch or wipe them.

  console.log('Seed complete.');
  console.log(`Admin login -> email: harithakotha6131@gmail.com | password: ${adminPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
