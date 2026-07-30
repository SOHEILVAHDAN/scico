import base64

def get_b64(path):
    with open(path, 'rb') as f:
        return 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('utf-8')

frames_b64 = [
    get_b64('images/film_frame1.jpg'),
    get_b64('images/film_frame2.jpg'),
    get_b64('images/film_frame3.jpg'),
    get_b64('images/film_frame4.jpg'),
    get_b64('images/film_frame5.jpg'),
    get_b64('images/film_frame6.jpg')
]

html_content = f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تجربه فوق سینماتیک IMAX: فیلم اسکرولی برند زیناکس (ZINAX)</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-dark: #020408;
            --accent-green: #10b981;
            --accent-green-bright: #34d399;
            --accent-cyan: #06b6d4;
            --accent-red: #ef4444;
            --accent-amber: #f59e0b;
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

        /* Scroll Movie Track */
        .movie-scroll-track {{
            height: 600vh;
            position: relative;
        }}

        /* Fixed Viewport Movie Canvas */
        .movie-viewport {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1;
            overflow: hidden;
        }}

        canvas#movieCanvas {{
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
        }}

        /* Cinematic Movie Vignette Overlay */
        .vignette-overlay {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, transparent 35%, rgba(2, 4, 8, 0.85) 100%),
                        linear-gradient(180deg, rgba(2, 4, 8, 0.8) 0%, transparent 20%, transparent 80%, rgba(2, 4, 8, 0.95) 100%);
            z-index: 2;
            pointer-events: none;
        }}

        /* Top Apple-Style Header HUD */
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
            background: rgba(2, 4, 8, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 50px;
        }}

        .brand-logo {{
            font-weight: 900;
            font-size: 1.2rem;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }}

        .brand-badge {{
            background: linear-gradient(135deg, var(--accent-green-bright), var(--accent-cyan));
            color: #000;
            padding: 0.2rem 0.6rem;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 900;
        }}

        /* Real-Time Air Quality Meter (AQI Gauge) */
        .aqi-gauge {{
            display: flex;
            align-items: center;
            gap: 0.8rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 0.4rem 1rem;
            border-radius: 30px;
            font-size: 0.85rem;
        }}

        .aqi-dot {{
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--accent-red);
            box-shadow: 0 0 10px var(--accent-red);
            transition: all 0.5s ease;
        }}

        .aqi-value {{
            font-weight: 800;
            color: var(--accent-red);
            transition: all 0.5s ease;
        }}

        /* Subtitles Movie Card */
        .movie-subtitles {{
            position: fixed;
            bottom: 3.5rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 20;
            max-width: 900px;
            width: 90%;
            background: rgba(6, 11, 20, 0.88);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(16, 185, 129, 0.35);
            border-radius: 28px;
            padding: 2rem 2.5rem;
            text-align: center;
            box-shadow: 0 35px 90px rgba(0, 0, 0, 0.95);
            transition: opacity 0.5s ease;
        }}

        .scene-badge {{
            display: inline-block;
            background: rgba(16, 185, 129, 0.15);
            color: var(--accent-green-bright);
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.35rem 1.2rem;
            border-radius: 30px;
            font-size: 0.85rem;
            font-weight: 800;
            margin-bottom: 0.8rem;
        }}

        .subtitle-text {{
            font-size: clamp(1.1rem, 2.2vw, 1.45rem);
            font-weight: 500;
            line-height: 1.8;
            color: #f8fafc;
        }}

        .scroll-indicator {{
            position: fixed;
            bottom: 1.2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 20;
            font-size: 0.82rem;
            color: var(--text-muted);
            animation: bounce 2s infinite;
        }}

        @keyframes bounce {{
            0%, 100% {{ transform: translate(-50%, 0); }}
            50% {{ transform: translate(-50%, -6px); }}
        }}

        /* Business Model Canvas Dashboard Section */
        .bmc-dashboard {{
            position: relative;
            z-index: 30;
            background: rgba(2, 4, 8, 0.98);
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
            font-size: 2.6rem;
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
            background: rgba(13, 22, 35, 0.88);
            border: 1px solid rgba(255, 255, 255, 0.12);
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

    <!-- Scroll Track -->
    <div class="movie-scroll-track" id="movieTrack"></div>

    <!-- Fixed Viewport Canvas Engine -->
    <div class="movie-viewport" id="movieViewport">
        <canvas id="movieCanvas"></canvas>
        <div class="vignette-overlay"></div>
    </div>

    <!-- Apple-Style Header HUD -->
    <header class="movie-header">
        <div class="brand-logo">
            <span>ZINAX IMAX EXPERIENCE</span>
            <span class="brand-badge">زیناکس</span>
        </div>
        <div class="aqi-gauge">
            <span class="aqi-dot" id="aqiDot"></span>
            <span>شاخص آلودگی هوا (AQI):</span>
            <span class="aqi-value" id="aqiVal">185 - شدیداً ناسالم</span>
        </div>
    </header>

    <!-- Subtitles Movie Card -->
    <div class="movie-subtitles" id="subtitleCard">
        <span class="scene-badge" id="sceneBadge">🎬 سکانس اول: پیاده‌روی در مه شهری</span>
        <div class="subtitle-text" id="subtitleText">
            «شال‌گردنم را روی دهانم می‌کشم... هوای خیابان سنگین و خاکستری است. مه سمی و دود اگزوز خودروها مثل پرده‌ای کثیف پیاده‌رو را پوشانده...»
        </div>
    </div>

    <div class="scroll-indicator" id="scrollHint">
        ⬇️ با اسکرول کردن به پایین، فیلم سینمایی را پخش کنید
    </div>

    <!-- Business Model Canvas Section -->
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

    <!-- Canvas Frame Interpolation Script -->
    <script>
        const canvas = document.getElementById('movieCanvas');
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {{
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }}
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Base64 Images Array
        const imgSources = [
            "{frames_b64[0]}",
            "{frames_b64[1]}",
            "{frames_b64[2]}",
            "{frames_b64[3]}",
            "{frames_b64[4]}",
            "{frames_b64[5]}"
        ];

        const images = [];
        let imagesLoaded = 0;

        imgSources.forEach((src, idx) => {{
            const img = new Image();
            img.src = src;
            img.onload = () => {{
                imagesLoaded++;
            }};
            images.push(img);
        }});

        // Smooth Scroll Damping Engine (Apple Style)
        let targetProgress = 0;
        let currentProgress = 0;

        const movieTrack = document.getElementById('movieTrack');
        const aqiDot = document.getElementById('aqiDot');
        const aqiVal = document.getElementById('aqiVal');
        const sceneBadge = document.getElementById('sceneBadge');
        const subtitleText = document.getElementById('subtitleText');
        const movieViewport = document.getElementById('movieViewport');
        const subtitleCard = document.getElementById('subtitleCard');
        const scrollHint = document.getElementById('scrollHint');

        const scenes = [
            {{
                aqi: "185 - شدیداً ناسالم",
                dotColor: "#ef4444",
                badge: "🎬 سکانس اول: پیاده‌روی در مه شهری",
                text: "«شال‌گردنم را روی دهانم می‌کشم... هوای خیابان سنگین و خاکستری است. مه سمی و دود اگزوز خودروها مثل پرده‌ای کثیف پیاده‌رو را پوشانده. با هر دم، سوزش اکسیدهای نیتروژن را در سینه‌ام حس می‌کنم...»"
            }},
            {{
                aqi: "150 - ناسالم برای گروه‌های حساس",
                dotColor: "#f97316",
                badge: "🌫️ سکانس دوم: عبور از آلودگی سنگین",
                text: "«گام‌هایم را سریع‌تر برمی‌دارم تا از این پیاده‌رو خفه‌کننده بگذرم. چشمانم می‌سوزد، اما ناگهان در انتهای خیابان پرتویی خنک از نور خورشید رخ می‌نماید...»"
            }},
            {{
                aqi: "85 - متوسط و رو به بهبودی",
                dotColor: "#f59e0b",
                badge: "⛅ سکانس سوم: شکافتن پرده مه و تابش خورشید",
                text: "«پرده مه شروع به شکافتن می‌کند. یک روشنی درخشان در میان تاریکی شهری پدیدار می‌شود و پرتوهای خورشید از میان ابرهای تیره بیرون می‌زنند...»"
            }},
            {{
                aqi: "35 - پاک و سالم",
                dotColor: "#34d399",
                badge: "🏛️ سکانس چهارم: پدیدار شدن نمای سفید زیناکس (ZINAX)",
                text: "«نزدیک‌تر می‌شوم... نمای ساختمانی با بتن سفید پاک و طرح‌های هندسی در برابرم قد علم کرده. بر بالای نما، حروف درخشان و فلزی «زیناکس» (ZINAX) می‌درخشد...»"
            }},
            {{
                aqi: "15 - ایده‌آل و کریستالی",
                dotColor: "#10b981",
                badge: "🌱 سکانس پنجم: معجزه اکسیژن و باز شدن نفس!",
                text: "«همین که به حریم ساختمان می‌رسم، معجزه رخ می‌دهد: سوزش سینه‌ام متوقف می‌شود. سنگینی هوا جایش را به نسیمی خنک، شفاف و سرشار از اکسیژن می‌دهد... نفسم باز می‌شود!»"
            }},
            {{
                aqi: "10 - کوهستانی و کاملاً پاک",
                dotColor: "#06b6d4",
                badge: "✨ سکانس ششم: زیست‌بوم پاک آینده با زیناکس",
                text: "«این ساختمان نفس می‌کشد؛ این نما زیناکس (ZINAX) است؛ بتن فتوکاتالیستی که آلودگی کل شهر را می‌بلعد و هوای پاک تحویل می‌دهد.»"
            }}
        ];

        window.addEventListener('scroll', () => {{
            const scrollTop = window.scrollY;
            const trackHeight = movieTrack.offsetHeight;
            const viewportHeight = window.innerHeight;
            const maxScroll = trackHeight - viewportHeight;
            targetProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
        }});

        // Render Frame Loop with Smooth Cross-fading
        function renderMovie() {{
            currentProgress += (targetProgress - currentProgress) * 0.08;

            if (imagesLoaded >= 6) {{
                let totalFrames = images.length - 1;
                let frameFloat = currentProgress * totalFrames;
                let frameIdx = Math.floor(frameFloat);
                let blendRatio = frameFloat - frameIdx;

                if (frameIdx >= totalFrames) {{
                    frameIdx = totalFrames - 1;
                    blendRatio = 1.0;
                }}

                let imgA = images[frameIdx];
                let imgB = images[Math.min(frameIdx + 1, totalFrames)];

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw Base Image A
                if (imgA) {{
                    ctx.globalAlpha = 1.0;
                    ctx.drawImage(imgA, 0, 0, canvas.width, canvas.height);
                }}

                // Blend Image B
                if (imgB && blendRatio > 0) {{
                    ctx.globalAlpha = blendRatio;
                    ctx.drawImage(imgB, 0, 0, canvas.width, canvas.height);
                }}

                // Update Scene Subtitles & AQI Meter
                let sceneIdx = Math.min(Math.floor(currentProgress * scenes.length), scenes.length - 1);
                let currentScene = scenes[sceneIdx];

                aqiVal.innerText = currentScene.aqi;
                aqiVal.style.color = currentScene.dotColor;
                aqiDot.style.background = currentScene.dotColor;
                aqiDot.style.boxShadow = `0 0 12px ${{currentScene.dotColor}}`;

                sceneBadge.innerText = currentScene.badge;
                subtitleText.innerText = currentScene.text;

                if (currentProgress >= 0.98) {{
                    movieViewport.style.opacity = '0';
                    subtitleCard.style.opacity = '0';
                    scrollHint.style.display = 'none';
                }} else {{
                    movieViewport.style.opacity = '1';
                    subtitleCard.style.opacity = '1';
                    scrollHint.style.display = 'block';
                }}
            }}

            requestAnimationFrame(renderMovie);
        }}

        renderMovie();
    </script>
</body>
</html>
"""

with open('zinax_imax_movie.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Generated zinax_imax_movie.html successfully, size:', len(html_content))
