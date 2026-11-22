/* =========================================================
   Z-NOX — content & timing (single source of truth)
   All copy lives here so it can be edited in one place.
   ========================================================= */
const FILM = {
  brand: 'Z-NOX',
  brandFa: 'زیناکس',
  tagline: 'فتوکاتالیست نانوساختار برای پوستهٔ معماری',
  subline: 'کاتالوگ فنی — ویژهٔ معماران و دفترهای طراحی',
  url: 'www.z-nox.com',
  fps: 30
};

/* scene durations are tuned to the Persian narration (VO) track */
const SCENES = [
  { id: 'logosting', dur: 4.6, vo: 0, voAt: 0, fa: 'لوگو', en: 'IDENTITY' },
  { id: 'intro',   dur: 10.8, vo: 1, voAt: 1.5,  fa: 'سرآغاز',        en: 'INTRODUCTION' },
  { id: 'problem', dur: 17.4, vo: 2, voAt: 0.7,  fa: 'مسئله',         en: 'THE PROBLEM' },
  { id: 'product', dur: 18.2, vo: 3, voAt: 0.6,  fa: 'محصول',         en: 'THE PRODUCT' },
  { id: 'tech',    dur: 20.4, vo: 4, voAt: 0.6,  fa: 'فناوری',        en: 'THE MECHANISM' },
  { id: 'water',   dur: 15.8, vo: 5, voAt: 0.6,  fa: 'ابرآب‌پذیری',   en: 'HYDROPHILIC' },
  { id: 'system',  dur: 18.8, vo: 6, voAt: 0.6,  fa: 'سیستم و ابعاد', en: 'SYSTEM' },
  { id: 'detail',  dur: 16.6, vo: 7, voAt: 0.6,  fa: 'جزئیات اجرا',   en: 'BUILD DETAIL' },
  { id: 'close',   dur: 17.0, vo: 8, voAt: 0.6,  fa: 'مشخصات و تماس', en: 'SPECS & CONTACT' }
];

/* narration text (mirrors assets/vo/*.mp3) */
const VO_TEXT = [
  'هوا، روی هر سطحی رد خودش را می‌گذارد. زیناکس، آن سطح را به یک لایهٔ فعال تبدیل می‌کند.',
  'در شهرهای ما، دوده، اکسیدهای نیتروژن و ترکیبات آلی هر روز روی نما می‌نشینند. نما خاکستری می‌شود، شیشه کدر می‌شود و هزینهٔ شست‌وشو هر سال بالا می‌رود.',
  'زیناکس یک پنل سرامیکی با بدنهٔ نانوساختار تیتانیوم دی‌اکسید است. فتوکاتالیست در تمام ضخامت پوشش پخت شده و برخلاف پوشش‌های سطحی، با سایش، خراش یا شست‌وشو از بین نمی‌رود.',
  'وقتی نور به سطح می‌رسد، الکترون‌ها برانگیخته می‌شوند و جفت‌های الکترون و حفره، رادیکال هیدروکسیل و سوپراکسید تولید می‌کنند. این گونه‌های فعال، آلاینده‌ها را به آب، نیترات و دی‌اکسید کربن تجزیه می‌کنند.',
  'سطح به‌شدت آب‌پذیر است؛ زاویهٔ تماس قطرهٔ آب به کمتر از پنج درجه می‌رسد. آب روی کل پنل می‌گسترد و با هر باران، گرد و غبار و رسوب‌ها را با خودش می‌برد.',
  'پنل‌های زیناکس تا ابعاد هزار و ششصد در سه هزار و دویست میلی‌متر، با ضخامت دوازده میلی‌متر و وزن حدود سی کیلوگرم بر متر مربع تولید می‌شوند؛ در سه خانوادهٔ نما، کف و دیوار داخلی.',
  'اجرا با زیرسازی آلومینیومی و درز باز ده میلی‌متری انجام می‌شود. پشت پوسته تهویه می‌شود و هر پنل به‌صورت مستقل با کلیپس قابل تعویض است؛ بدون تخریب و بدون دورریز.',
  'کلاس آتش یک، مقاومت در برابر یخ‌زدگی و چرخه‌های حرارتی، و گارانتی پانزده سالهٔ رنگ و عملکرد. زیناکس؛ پوستهٔ ساختمان، به‌عنوان سیستم تصفیهٔ هوا.'
];

/* technical catalogue data */
const SPEC = {
  size: { w: 1600, h: 3200, t: 12, joint: 10, cavity: 40, kg: 30 },
  fire: 'A1',
  waterAbs: '< 0.5%',
  contact: 5,
  warranty: 15,
  bake: 1200,
  families: [
    { fa: 'نمای خارجی', en: 'FACADE', img: 'tower', note: 'پوستهٔ تهویه‌شده، درز باز' },
    { fa: 'کف و محوطه', en: 'FLOOR', img: 'detail', note: 'ضد لغزش، مقاوم به سایش' },
    { fa: 'دیوار داخلی', en: 'INTERIOR', img: 'interior', note: 'تصفیهٔ هوای فضای داخلی' }
  ],
  finishes: ['سفید مات', 'خاکستری روشن', 'خاکستری تیره', 'بژ سنگی', 'زغالی', 'سفید صدفی'],
  finishesHex: ['#E8E4DC', '#B9B6B0', '#6E7075', '#C4B2A0', '#3A3B3F', '#F2EFE8'],
  layers: [
    { fa: 'پوشش فتوکاتالیستی', en: 'TiO₂ PHOTOCATALYTIC NANO LAYER', h: 10, c: '#8E7BFF' },
    { fa: 'لایهٔ پیوند سرامیکی', en: 'CERAMIC BOND LAYER', h: 14, c: '#7FD8FF' },
    { fa: 'بدنهٔ سرامیکی', en: 'CERAMIC BODY — 12 mm', h: 30, c: '#B9B6B0' }
  ],
  specs: [
    ['ابعاد حداکثر', '۱۶۰۰ × ۳۲۰۰ میلی‌متر'],
    ['ضخامت', '۱۲ میلی‌متر'],
    ['وزن', '~۳۰ کیلوگرم بر متر مربع'],
    ['دمای پخت', '۱۲۰۰ درجهٔ سانتی‌گراد'],
    ['کلاس آتش', 'A1 — غیرقابل اشتعال'],
    ['جذب آب', 'کمتر از ۰٫۵ درصد'],
    ['زاویهٔ تماس آب', 'کمتر از ۵ درجه'],
    ['چرخهٔ یخ‌زدگی', '۱۰۰ چرخه بدون تغییر'],
    ['گارانتی رنگ و عملکرد', '۱۵ سال']
  ]
};

/* absolute scene start times */
(function computeTimeline() {
  let acc = 0;
  for (const s of SCENES) { s.start = acc; acc += s.dur; }
  FILM.duration = acc;
})();

/* engine accepts either absolute time or (scene, local) */
function locate(t) {
  const T = FILM.duration;
  t = Math.max(0, Math.min(T - 1e-4, t));
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    if (t < s.start + s.dur || i === SCENES.length - 1) return { scene: s, i, local: t - s.start };
  }
}
