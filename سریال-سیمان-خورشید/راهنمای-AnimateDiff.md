# راهنمای ساخت ویدیوی متحرک با AnimateDiff
### برای اجرا روی دستگاه شخصی شما (با GPU)

> **چرا اینجا اجرا نشد؟** AnimateDiff برای تولید ویدیوی متحرک به یک GPU با حافظهٔ بالا نیاز دارد (حداقل ~۸ گیگ VRAM و ایدئال ۱۲+ گیگ) و همچنین دانلود مدل‌های سنگین. سندباکس فعلی GPU ندارد (فقط ۳.۸ گیگ رم و ۲ هستهٔ CPU)، بنابراین اجرای آن در این محیط ممکن نیست. این راهنما برای اجرا روی سیستم شخصی شما (که GPU دارد) است.

---

## ۱) پیش‌نیازها

- یک سیستم با **GPU NVIDIA** (معماری Pascal به بعد؛ مثلاً RTX 2060/3060/4070) و حداقل ۱۲ گیگ VRAM
- ویندوز یا لینوکس + **Python 3.10/3.11**
- **حداقل ۳۰ گیگ فضای خالی** (برای مدل‌ها)

## ۲) نصب ComfyUI

```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
# (نسخهٔ PyTorch با CUDA مخصوص GPU شما)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

## ۳) نصب AnimateDiff

```bash
cd custom_nodes
git clone https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved.git
cd ComfyUI-AnimateDiff-Evolved
pip install -r requirements.txt
```

(همچنین به یک **Video Helper** برای دریافت/خروجی ویدیو نیاز دارید:)

```bash
git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git
pip install -r ComfyUI-VideoHelperSuite/requirements.txt
```

## ۴) دانلود مدل‌ها

آن‌ها را در پوشه‌های مربوطه‌ی ComfyUI بگذارید:

| مدل | مسیر | از کجا |
|-----|------|--------|
| مدل پایه (SD 1.5، مثلاً Realistic Vision یا dreamshaper) | `models/checkpoints/` | civitai / huggingface |
| مژول حرکتی AnimateDiff (mm_sd_v15_v2.ckpt یا mm_SDXL) | `models/animatediff_models/` | huggingface |
| (اختیاری) ControlNet برای ثبات حرکت | `models/controlnet/` | huggingface |

> **نکته:** دو لینکی که شما فرستادید (`guoyww/AnimateDiff` و `SipherAGI/comfyui-animatediff`) هم برای همین منظورند؛ `Kosinkadink/ComfyUI-AnimateDiff-Evolved` نسخهٔ کامل‌تر و به‌روزتر برای ComfyUI است. مژول حرکتی را می‌توانید مستقیم از ریپوی `guoyww/AnimateDiff` بگیرید.

## ۵) نمونه Workflow (در ComfyUI)

گره‌ها را به این ترتیب وصل کنید:

```
Load Checkpoint (RealisticVision)
  → CLIP Text Encode (Positive): پرامپت کاراکتر و صحنه
  → CLIP Text Encode (Negative): "blurry, deformed, extra limbs"
  → Empty Latent Image (اندازه 512x512، batch_size = 16)
  → AnimateDiff Loader (motion module) → AnimateDiff Sampler
  → KSampler (steps=20, cfg=7)
  → VAEDecode → Video Combine (خرجه ۱۶ فریم / ~۲ ثانیه)
```

- **روش بهتر — ویدیو با شخصیت ثابت:** از **قاب اولِ تصاویرِ همین سریال** (فایل‌های `تصاویر/`) به‌عنوان ورودی استفاده کنید و با گرهٔ `Load Image` + `AnimateDiff` + `ControlNet` (openpose) شخصیت را قفل کنید تا چهره و ژست یکسان بماند.

## ۶) پرامپت‌های آماده (هماهنگ با این سریال)

**سارا (کارآفرین):**
```
photo of a confident young Iranian woman engineer in her 30s, dark hair in a low bun,
wearing a beige blazer, presenting concrete samples, warm office lighting, photorealistic, 8k
```
**مقتدری (سرمایه‌گذار):**
```
photo of a stern middle-aged Iranian businessman in a tailored charcoal suit, gray-touched hair,
in a glass boardroom overlooking Tehran skyline, photorealistic, cinematic
```
**نمای تهران:**
```
aerial view of Tehran at sunrise, thick smog over the city, Milad Tower in the distance,
heavy traffic on highways, cinematic, moody, photorealistic
```

## ۷) نکات برای کیفیت بهتر

1. **رزولوشن:** با 512×512 شروع کنید؛ بعد Interpolate کنید (Video Helper).
2. **تعداد فریم:** 16 فریم استاندارد است؛ برای صحنهٔ طولانی‌تر چند بخش جدا بسازید و بعد در ffmpeg کنار هم بگذارید.
3. **صدا و دیالوگ:** صدای فارسی را جداگانه بسازید (مثل فایل‌های `صدا/`) و با ffmpeg روی ویدیو بگذارید.
4. **حرکت لب (Lip-sync):** AnimateDiff حرکت لب ندارد؛ برای دیالوگ واقعی به ابزار جداگانه مثل **SadTalker / Wav2Lip** نیاز دارید که صدای شما را به لب‌ها گره می‌زند.

## ۸) ترکیب نهایی با ffmpeg

```bash
ffmpeg -i scene1.mp4 -i scene2.mp4 -f concat -safe 0 -i list.txt -c copy full.mp4
ffmpeg -i full.mp4 -i dialogue.wav -c:v copy -c:a aac final.mp4
```
