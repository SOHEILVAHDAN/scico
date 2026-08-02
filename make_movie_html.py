import base64

def get_b64(path):
    with open(path, 'rb') as f:
        return 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('utf-8')

img1 = get_b64('images/movie_scene1_smog_city.jpg')
img2 = get_b64('images/movie_scene2_fog_breaking.jpg')
img3 = get_b64('images/movie_scene3_zinax_facade.jpg')
img4 = get_b64('images/movie_scene4_fresh_air_oasis.jpg')

html_content = f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فیلم سینماتیک اسکرولی: تجربه واقع‌گرایانه زیناکس (ZINAX)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-dark: #020408;
            --accent-green: #10b981;
            --accent-green-bright: #34d399;
            --accent-cyan: #06b6d4;
            --accent-gold: #f59e0b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --font-family: 'Vazirmatn', system-ui, sans-serif;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
        }}

        body, html {{
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: var(--font-family);
            overflow-x: hidden;
            width: 100%;
        }}

        /* Scroll Movie Track Container */
        .movie-track {{
            height: 450vh;
            position: relative;
        }}

        /* Fixed Viewport Canvas for Movie */
        .movie-viewport {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1;
            overflow: hidden;
        }}

        /* Movie Layer Images */
        .movie-frame {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.8s ease, transform 8s ease;
            transform: scale(1.05);
        }}

        .movie-frame.active {{
            opacity: 1;
            transform: scale(1);
        }}

        /* Movie Overlay Vignette */
        .movie-vignette {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, transparent 40%, rgba(2, 4, 8, 0.85) 100%),
                        linear-gradient(180deg, rgba(2, 4, 8, 0.75) 0%, transparent 20%, transparent 80%, rgba(2, 4, 8, 0.95) 100%);
            z-index: 2;
            pointer-events: none;
        }}

        /* Top HUD Header */
        header.movie-header {{
            position: fixed;
            top: 1.5rem;
            left: 2rem;
            right: 2rem;
            z-index: 20;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 1.8rem;
            background: rgba(2, 4, 8, 0.75);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 50px;
        }}

        .brand-title {{
            font-weight: 900;
            font-size: 1.15rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }}

        .badge-zinax {{
            background: linear-gradient(135deg, var(--accent-green-bright), var(--accent-cyan));
            color: #000;
            padding: 0.25rem 0.7rem;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 900;
        }}

        .scroll-progress-bar {{
            width: 120px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }}

        .scroll-progress-fill {{
            width: 0%;
            height: 100%;
            background: var(--accent-green-bright);
            transition: width 0.1s linear;
        }}

        /* Subtitles & Movie Caption Card */
        .movie-subtitles {{
            position: fixed;
            bottom: 3rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 20;
            max-width: 850px;
            width: 90%;
            background: rgba(8, 14, 24, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 24px;
            padding: 1.8rem 2.2rem;
            text-align: center;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9);
            transition: all 0.5s ease;
        }}

        .scene-indicator {{
            display: inline-block;
            background: rgba(16, 185, 129, 0.15);
            color: var(--accent-green-bright);
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.3rem 1rem;
            border-radius: 30px;
            font-size: 0.8rem;
            font-weight: 800;
            margin-bottom: 0.8rem;
        }}

        .subtitle-text {{
            font-size: clamp(1.05rem, 2vw, 1.35rem);
            font-weight: 500;
            line-height: 1.8;
            color: #f1f5f9;
        }}

        .scroll-hint {{
            position: fixed;
            bottom: 1.2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 20;
            font-size: 0.8rem;
            color: var(--text-muted);
            letter-spacing: 1px;
            animation: bounce 2s infinite;
        }}

        @keyframes bounce {{
            0%, 100% {{ transform: translate(-50%, 0); }}
            50% {{ transform: translate(-50%, -6px); }}
        }}

        /* Final Business Model Canvas Dashboard Section */
        .bmc-dashboard {{
            position: relative;
            z-index: 30;
            background: rgba(4, 8, 16, 0.98);
            border-top: 1px solid rgba(16, 185, 129, 0.4);
            padding: 6rem 2rem 4rem;
            min-height: 100vh;
        }}

        .bmc-header-center {{
            text-align: center;
            max-width: 850px;
            margin: 0 auto 4rem;
        }}

        .bmc-header-center h2 {{
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.8rem;
            background: linear-gradient(135deg, #fff, var(--accent-green-bright));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}

        .bmc-grid {{
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.8rem;
        }}

        @media (max-width: 850px) {{
            .bmc-grid {{ grid-template-columns: 1fr; }}
        }}

        .bmc-card {{
            background: rgba(13, 22, 35, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 22px;
            padding: 2rem;
            backdrop-filter: blur(16px);
            transition: all 0.3s;
        }}

        .bmc-card:hover {{
            border-color: var(--accent-green);
            transform: translateY(-6px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }}

        .bmc-card h3 {{
            font-size: 1.25rem;
            color: var(--accent-green-bright);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }}

        .bmc-card ul {{
            list-style: none;
            padding-right: 1.2rem;
            font-size: 0.92rem;
            color: var(--text-muted);
        }}

        .bmc-card ul li {{
            margin-bottom: 0.6rem;
            position: relative;
        }}

        .bmc-card ul li::before {{
            content: "✦";
            position: absolute;
            right: -1.2rem;
            color: var(--accent-green);
        }}

        footer {{
            text-align: center;
            padding: 3rem 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin-top: 4rem;
        }}
    </style>
</head>
<body>

    <!-- Movie Track for Scroll Sync -->
    <div class="movie-track" id="movieTrack"></div>

    <!-- Viewport Fixed Frame Container -->
    <div class="movie-viewport" id="movieViewport">
        <img src="{img1}" class="movie-frame active" id="frame1" alt="صحنه ۱: کلان‌شهر آلوده">
        <img src="{img2}" class="movie-frame" id="frame2" alt="صحنه ۲: شکافتن مه و تابش خورشید">
        <img src="{img3}" class="movie-frame" id="frame3" alt="صحنه ۳: نمای سفید ساختمان زیناکس ZINAX">
        <img src="{img4}" class="movie-frame" id="frame4" alt="صحنه ۴: تنفس هوای پاک در حریم زیناکس">
        <div class="movie-vignette"></div>
    </div>

    <!-- Top Header HUD -->
    <header class="movie-header">
        <div class="brand-title">
            <span>ZINAX CINEMATIC EXPERIENCE</span>
            <span class="badge-zinax">فیلم اسکرولی زیناکس</span>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">پیشرفت سینمایی:</span>
            <div class="scroll-progress-bar">
                <div class="scroll-progress-fill" id="progressFill"></div>
            </div>
        </div>
    </header>

    <!-- Subtitles Movie Card -->
    <div class="movie-subtitles" id="subtitleCard">
        <span class="scene-indicator" id="sceneIndicator">🎬 سکانس اول: قدم زدن در پیاده‌رو آلوده</span>
        <div class="subtitle-text" id="subtitleText">
            «شال‌گردنم را روی دهانم می‌کشم... هوای خیابان سنگین و خاکستری است. مه سمی و دود اگزوز خودروها مثل پرده‌ای کثیف پیاده‌رو را پوشانده. با هر دم، سوزش اکسیدهای نیتروژن را در سینه‌ام حس می‌کنم...»
        </div>
    </div>

    <div class="scroll-hint" id="scrollHint">
        ⬇️ برای پخش فیلم سینماتی به پایین اسکرول کنید
    </div>

    <!-- Business Model Canvas Dashboard -->
    <section class="bmc-dashboard" id="bmcSection">
        <div class="bmc-header-center">
            <h2>بوم کسب‌وکار برند زیناکس (ZINAX)</h2>
            <p style="color: var(--text-muted); font-size: 1rem;">مدل ۹ گانه تجاری‌سازی نمای فتوکاتالیست پاک‌کننده هوا و خودتمیزشوندگی</p>
        </div>

        <div class="bmc-grid">
            <div class="bmc-card">
                <h3>👥 ۱. بخش‌های مشتریان</h3>
                <ul>
                    <li>توسعه‌دهندگان برج‌های لوکس و تجاری</li>
                    <li>دفاتر برجسته معماری و طراحان نمای مدرن</li>
                    <li>شهرداری‌ها و سازمان‌های مدیریت شهری</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>💎 ۲. ارزش‌های پیشنهادی</h3>
                <ul>
                    <li>حذف خودکار دوده و سیاه نشدن نما (حذف هزینه شستشو)</li>
                    <li>پاکسازی فعال ۵۰٪ تا ۷۰٪ گازهای سمی (NOx) در حریم ساختمان</li>
                    <li>کسب امتیاز عالی گواهی ساختمان سبز (LEED)</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>📢 ۳. کانال‌های توزیع</h3>
                <ul>
                    <li>ارتباط مستقیم B2B با دفاتر معماران و سازندگان بزرگ</li>
                    <li>شوروم‌های اختصاصی و نمونه‌کارهای واقع‌گرایانه</li>
                    <li>حضور در مناقصات شهرداری‌ها و کارهای عمومی</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>🤝 ۴. روابط با مشتریان</h3>
                <ul>
                    <li>مشاوره مهندسی قالب‌سازی اختصاصی ۳D</li>
                    <li>ضمانت‌نامه ماندگاری خاصیت خودتمیزشوندگی زیناکس</li>
                    <li>ارائه گزارش‌های پایش زیست‌محیطی دوره ای</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>💰 ۵. جریان‌های درآمدی</h3>
                <ul>
                    <li>فروش پنل‌های پیش‌ساخته نمای سفید زیناکس</li>
                    <li>فروش افزودنی فتوکاتالیست زیناکس به کارخانجات بتن</li>
                    <li>خدمات طراحی و قالب‌سازی اختصاصی ۳D</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>🧪 ۶. منابع کلیدی</h3>
                <ul>
                    <li>فرمولاسیون اختصاصی نانو TiO2 برند زیناکس</li>
                    <li>کارگاه قطعات پیش‌ساخته و قالب‌های ۳D</li>
                    <li>تاییدیه‌های رسمی آزمایشگاه نانو و محیط‌زیست</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>⚡ ۷. فعالیت‌های کلیدی</h3>
                <ul>
                    <li>سنتز و تولید افزودنی‌های نانوذرات زیناکس</li>
                    <li>تولید قطعات پیش‌ساخته با کیفیت بسیار بالا</li>
                    <li>بازاریابی B2B و مشاوره به معماران</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>🌐 ۸. شرکای کلیدی</h3>
                <ul>
                    <li>تامین‌کنندگان نانوذرات و مواد اولیه شیمیایی</li>
                    <li>دفاتر معماران برجسته و طراحان نما</li>
                    <li>دانشگاه‌ها و ستاد توسعه فناوری نانو</li>
                </ul>
            </div>

            <div class="bmc-card">
                <h3>📊 ۹. ساختار هزینه‌ها</h3>
                <ul>
                    <li>هزینه نانوذرات TiO2 و مواد افزودنی</li>
                    <li>هزینه قالب‌سازی و کارگاه تولید قطعات پیش‌ساخته</li>
                    <li>هزینه‌های آزمون‌های آزمایشگاهی و بازاریابی</li>
                </ul>
            </div>
        </div>

        <footer>
            <p>برند <strong>زیناکس (ZINAX)</strong> - پیشگام فناوری بتن فتوکاتالیست و پاکسازی هوای شهری</p>
        </footer>
    </section>

    <!-- Scroll Movie Engine Script -->
    <script>
        const movieTrack = document.getElementById('movieTrack');
        const progressFill = document.getElementById('progressFill');
        const subtitleText = document.getElementById('subtitleText');
        const sceneIndicator = document.getElementById('sceneIndicator');
        const scrollHint = document.getElementById('scrollHint');
        const movieViewport = document.getElementById('movieViewport');

        const frames = [
            document.getElementById('frame1'),
            document.getElementById('frame2'),
            document.getElementById('frame3'),
            document.getElementById('frame4')
        ];

        const sceneSubtitles = [
            {{
                indicator: "🎬 سکانس اول: پیاده‌روی خفه‌کننده در مه شهری",
                text: "«شال‌گردنم را روی دهانم می‌کشم... هوای خیابان سنگین و خاکستری است. مه سمی و دود اگزوز خودروها مثل پرده‌ای کثیف پیاده‌رو را پوشانده. با هر دم، سوزش اکسیدهای نیتروژن را در سینه‌ام حس می‌کنم...»"
            }},
            {{
                indicator: "⛅ سکانس دوم: شکافتن پرده مه و تابش خورشید",
                text: "«ناگهان، چند متر جلوتر، پرده مه شروع به شکافتن می‌کند. یک روشنی درخشان در میان تاریکی شهری پدیدار می‌شود و پرتوهای خورشید از میان ابرهای تیره بیرون می‌زنند...»"
            }},
            {{
                indicator: "🏛️ سکانس سوم: پدیدار شدن نمای سفید زیناکس (ZINAX)",
                text: "«نزدیک‌تر می‌شوم... نمای ساختمانی با بتن سفید پاک و طرح‌های هندسی در برابرم قد علم کرده. بر بالای نما، حروف درخشان و فلزی «زیناکس» (ZINAX) می‌درخشد...»"
            }},
            {{
                indicator: "🌱 سکانس چهارم: معجزه اکسیژن و باز شدن نفس!",
                text: "«همین که به حریم ساختمان می‌رسم، معجزه رخ می‌دهد: سوزش سینه‌ام متوقف می‌شود. سنگینی هوا جایش را به نسیمی خنک، شفاف و سرشار از اکسیژن می‌دهد... نفسم باز می‌شود!»"
            }}
        ];

        function updateMovieOnScroll() {{
            const scrollTop = window.scrollY;
            const trackHeight = movieTrack.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            const maxScroll = trackHeight - viewportHeight;
            let progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

            progressFill.style.width = (progress * 100) + '%';

            // Determine active frame index (0, 1, 2, or 3)
            let frameIdx = 0;
            if (progress >= 0.75) frameIdx = 3;
            else if (progress >= 0.5) frameIdx = 2;
            else if (progress >= 0.25) frameIdx = 1;
            else frameIdx = 0;

            // Activate current frame image
            frames.forEach((frame, idx) => {{
                if (idx === frameIdx) frame.classList.add('active');
                else frame.classList.remove('active');
            }});

            // Update Subtitles
            const sub = sceneSubtitles[frameIdx];
            sceneIndicator.innerText = sub.indicator;
            subtitleText.innerHTML = sub.text;

            // Hide/Show Viewport when scrolling into BMC section
            if (progress >= 0.98) {{
                movieViewport.style.opacity = '0';
                document.getElementById('subtitleCard').style.opacity = '0';
                scrollHint.style.display = 'none';
            }} else {{
                movieViewport.style.opacity = '1';
                document.getElementById('subtitleCard').style.opacity = '1';
                scrollHint.style.display = 'block';
            }}
        }}

        window.addEventListener('scroll', updateMovieOnScroll);
        updateMovieOnScroll();
    </script>
</body>
</html>
"""

with open('zinax_cinematic_movie.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Generated zinax_cinematic_movie.html successfully, size:', len(html_content))
