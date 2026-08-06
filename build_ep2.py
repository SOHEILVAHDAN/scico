#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
from assemble import render_episode, AUD, IMG

A = os.path.join(AUD, "ep2_")
I = IMG
scenes = [
    dict(image=os.path.join(I, "قسمت۲-آزمایشگاه.jpg"), motion="zoom-in",
         subtitle="فناوری ساده بود اما جسورانه؛ دی‌اکسید تیتانیوم، کاتالیزوری که از نور خورشید، هوا می‌سازد.",
         speaker="سارا (راوی)"),
    dict(image=os.path.join(I, "قسمت۲-آزمایشگاه.jpg"), motion="pan-right",
         subtitle="ببینم سارا؛ ادعای تو چیست؟ دی‌اکسید تیتانیوم دهه‌هاست در رنگ و ضدآفتاب هست.",
         speaker="استاد برومند"),
    dict(image=os.path.join(I, "قسمت۲-آزمایشگاه-بسته.jpg"), motion="zoom-in",
         subtitle="نور فرابنفش در ذره‌های تیتانیوم، بار الکتریکی می‌سازد؛ آلودگی را می‌شکند و به نیترات و آب بی‌ضرر تبدیل می‌کند.",
         speaker="سارا"),
    dict(image=os.path.join(I, "قسمت۲-آزمایشگاه.jpg"), motion="zoom-out",
         subtitle="شما دارید کاری می‌کنید که در ژاپن و فرانسه دارند می‌کنند؛ اما با مصالح بومی خودمان. برای این شهر، این یعنی آینده.",
         speaker="استاد برومند"),
    dict(image=os.path.join(I, "قسمت۲-آزمایشگاه.jpg"), motion="zoom-in",
         subtitle="سه‌شنبه، ساعت ده صبح؛ برجی در بالای خیابان ولیعصر. آن‌جا بود که همه‌چیز یا می‌شد یا نمی‌شد.",
         speaker="سارا (راوی)"),
]
audio = [A+"narr1.mp3", A+"ostad1.mp3", A+"sara1.mp3",
         A+"ostad2.mp3", A+"narr2.mp3"]
render_episode("ep2", "سیمانِ خورشید", "قسمت دوم: سیمان خورشید",
               scenes, audio, "قسمت۲-سیمان-خورشید.mp4",
               outro_title="پایان قسمت دوم — ادامه دارد",
               outro_sub="قسمت سوم: جلسه")
