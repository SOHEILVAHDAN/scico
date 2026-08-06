#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
from assemble import render_episode, AUD, IMG

A = os.path.join(AUD, "ep4_")
I = IMG
scenes = [
    dict(image=os.path.join(I, "قسمت۴-تست-خیابان.jpg"), motion="zoom-in",
         subtitle="یک خیابان فرعی در سایهٔ ساختمان؛ جایی که دودِ دو خیابان اصلی به آن می‌ریزد. اگر این‌جا جواب دهد، هیچ‌جا ناامید نیستیم.",
         speaker="سارا (راوی)"),
    dict(image=os.path.join(I, "قسمت۴-تست-خیابان.jpg"), motion="pan-right",
         subtitle="پس این همون سیمانِ جادوییه؟",
         speaker="امید"),
    dict(image=os.path.join(I, "قسمت۴-تست-خیابان.jpg"), motion="pan-left",
         subtitle="کاهش بیش از چهل درصد. و سطح، بدون حتی یک لکهٔ دوده.",
         speaker="دکتر راد"),
    dict(image=os.path.join(I, "قسمت۴-تست-خیابان.jpg"), motion="zoom-out",
         subtitle="این عدد در مقیاس یک بلوار یا پروژهٔ کامل چقدر می‌شود؟",
         speaker="آقای مقتدری"),
    dict(image=os.path.join(I, "قسمت۱-پشتبام.jpg"), motion="zoom-in",
         subtitle="همان شب، برای اولین بار بعد از سال‌ها، آسمان را از پشت‌بام خانه‌مان دیدم.",
         speaker="سارا (راوی)"),
]
audio = [A+"narr1.mp3", A+"omid1.mp3", A+"rad1.mp3",
         A+"modat1.mp3", A+"narr2.mp3"]
render_episode("ep4", "سیمانِ خورشید", "قسمت چهارم: تستِ خیابان",
               scenes, audio, "قسمت۴-تست-خیابان.mp4",
               outro_title="پایان قسمت چهارم — ادامه دارد",
               outro_sub="قسمت پنجم: قرارداد")
