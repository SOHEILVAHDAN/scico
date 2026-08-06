#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
from assemble import render_episode, AUD, IMG

A = os.path.join(AUD, "ep5_")
I = IMG
scenes = [
    dict(image=os.path.join(I, "قسمت۵-قرارداد.jpg"), motion="zoom-in",
         subtitle="جلسهٔ آخر. مقتدری این‌بار با یک برگهٔ قرارداد آمد.",
         speaker="سارا (راوی)"),
    dict(image=os.path.join(I, "قسمت۵-قرارداد.jpg"), motion="pan-right",
         subtitle="به آدم‌های با ایمان و عددِ راست اعتماد می‌کنم؛ شما هر دو را نشانم دادید. سرمایهٔ اولیه برای خط تولید، و دکتر راد ناظر فنی.",
         speaker="آقای مقتدری"),
    dict(image=os.path.join(I, "قسمت۵-قرارداد.jpg"), motion="zoom-in",
         subtitle="و یک شرط من: بخشی از بتنِ هر پروژهٔ عمومی، برای اطراف مدارس و بیمارستان‌ها.",
         speaker="سارا"),
    dict(image=os.path.join(I, "قسمت۵-قرارداد.jpg"), motion="pan-left",
         subtitle="چون آن‌جا بیشترین نفس را می‌کشند. قبول است.",
         speaker="آقای مقتدری"),
    dict(image=os.path.join(I, "قسمت۱-صبح-دود.jpg"), motion="zoom-out",
         subtitle="خورشید کاری نمی‌کند، مگر اینکه کسی راهش را نشانش دهد. این داستانِ دوبارهٔ نفس کشیدن تهران بود.",
         speaker="سارا (راوی)"),
]
audio = [A+"narr1.mp3", A+"modat1.mp3", A+"sara1.mp3",
         A+"modat2.mp3", A+"narr2.mp3"]
render_episode("ep5", "سیمانِ خورشید", "قسمت پنجم: قرارداد",
               scenes, audio, "قسمت۵-قرارداد.mp4",
               outro_title="پایان فصل اول — ادامه دارد",
               outro_sub="سیمانِ خورشید")
