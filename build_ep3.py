#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
from assemble import render_episode, AUD, IMG

A = os.path.join(AUD, "ep3_")
I = IMG
scenes = [
    dict(image=os.path.join(I, "قسمت۳-جلسه.jpg"), motion="zoom-in",
         subtitle="جلسه شروع شد. مقتدری آدمی بود که فقط به عدد اعتماد داشت.",
         speaker="سارا (راوی)"),
    dict(image=os.path.join(I, "قسمت۳-جلسه.jpg"), motion="pan-right",
         subtitle="چرا سرمایهٔ ما برود روی بتنی که شاید چند سال دیگر روند باشد؟",
         speaker="آقای مقتدری"),
    dict(image=os.path.join(I, "قسمت۳-جلسه.jpg"), motion="zoom-in",
         subtitle="چون در همان زمان که ساختمان می‌سازد، مشکل ساکنان را هم حل می‌کند؛ تا چهل و پنج درصد کاهش اکسیدهای نیتروژن.",
         speaker="سارا"),
    dict(image=os.path.join(I, "قسمت۳-جلسه.jpg"), motion="pan-left",
         subtitle="این اعداد در آزمایشگاه است. در خیابان، زیر دود واقعی تهران چه می‌کند؟ گرد و غبار سطح را می‌پوشاند.",
         speaker="دکتر راد"),
    dict(image=os.path.join(I, "قسمت۳-جلسه.jpg"), motion="zoom-in",
         subtitle="قرار شد یک خیابان پیدا کنیم؛ جایی که غبار، ترافیک و شک، همه با هم باشد.",
         speaker="سارا (راوی)"),
]
audio = [A+"narr1.mp3", A+"modat1.mp3", A+"sara1.mp3",
         A+"rad1.mp3", A+"narr2.mp3"]
render_episode("ep3", "سیمانِ خورشید", "قسمت سوم: جلسه",
               scenes, audio, "قسمت۳-جلسه.mp4",
               outro_title="پایان قسمت سوم — ادامه دارد",
               outro_sub="قسمت چهارم: تستِ خیابان")
