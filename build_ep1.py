#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
from assemble import render_episode, AUD, IMG

A = os.path.join(AUD, "ep1_")
I = IMG

scenes = [
    # smog opening — narrator
    dict(image=os.path.join(I, "قسمت۱-صبح-دود.jpg"), motion="zoom-in",
         subtitle="صبح‌های تهران این‌طوری است؛ آدم یادش می‌رود آسمانش آبی است.",
         speaker="سارا (راوی)"),
    dict(image=os.path.join(I, "قسمت۱-ماشین.jpg"), motion="pan-right",
         subtitle="خواهر، کجا گیر کردی؟ بچه‌ها دیر می‌رسن سرِ کار.",
         speaker="امید"),
    dict(image=os.path.join(I, "قسمت۱-ماشین.jpg"), motion="zoom-in",
         subtitle="توی دود دارم پیاده می‌رم، امید. مامان باز عطسه‌هاش شروع شده.",
         speaker="سارا"),
    dict(image=os.path.join(I, "قسمت۱-ماشین.jpg"), motion="pan-left",
         subtitle="مگه میشه تو این هوا عطسه نکنه؟ همهٔ محله سرفه می‌کنن.",
         speaker="امید"),
    dict(image=os.path.join(I, "قسمت۱-ماشین.jpg"), motion="zoom-out",
         subtitle="دقیقاً به همین فکر می‌کنم. برو سرِ کار؛ بعداً زنگ می‌زنم.",
         speaker="سارا"),
    dict(image=os.path.join(I, "قسمت۱-پشتبام.jpg"), motion="zoom-in",
         subtitle="به خودم قول دادم؛ اگه قرار باشه این شهر نفسی بکشه، باید از همین‌جا شروع بشه.",
         speaker="سارا (راوی)"),
]

audio = [A+"narr1.mp3", A+"omid1.mp3", A+"sara1.mp3",
         A+"omid2.mp3", A+"sara2.mp3", A+"narr2.mp3"]

render_episode("ep1", "سیمانِ خورشید", "قسمت اول: دود و صبح",
               scenes, audio, "قسمت۱-دود-و-صبح.mp4",
               outro_title="پایان قسمت اول — ادامه دارد",
               outro_sub="قسمت دوم: سیمان خورشید")
