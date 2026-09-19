"""Generate 3,600 original daily-life examples for the twelve English tenses."""

from __future__ import annotations

import json
from pathlib import Path

import eng_to_ipa as ipa


ROOT = Path(__file__).resolve().parents[1]
BANK_OUTPUT = ROOT / "data" / "tense-bank.js"
IPA_OUTPUT = ROOT / "data" / "tense-pronunciation-bank.js"


SUBJECTS = [
    {"en": "I", "th": "ฉัน", "third": False, "be": "am", "past_be": "was", "have": "have"},
    {"en": "You", "th": "คุณ", "third": False, "be": "are", "past_be": "were", "have": "have"},
    {"en": "We", "th": "พวกเรา", "third": False, "be": "are", "past_be": "were", "have": "have"},
    {"en": "They", "th": "พวกเขา", "third": False, "be": "are", "past_be": "were", "have": "have"},
    {"en": "He", "th": "เขา", "third": True, "be": "is", "past_be": "was", "have": "has"},
    {"en": "She", "th": "เธอ", "third": True, "be": "is", "past_be": "was", "have": "has"},
]


# base, third-person singular, past, past participle, -ing form, Thai meaning
SIMPLE_ACTIONS = [
    ("wake up early", "wakes up early", "woke up early", "woken up early", "waking up early", "ตื่นแต่เช้า"),
    ("make breakfast", "makes breakfast", "made breakfast", "made breakfast", "making breakfast", "ทำอาหารเช้า"),
    ("drink coffee", "drinks coffee", "drank coffee", "drunk coffee", "drinking coffee", "ดื่มกาแฟ"),
    ("check email", "checks email", "checked email", "checked email", "checking email", "ตรวจอีเมล"),
    ("take a shower", "takes a shower", "took a shower", "taken a shower", "taking a shower", "อาบน้ำ"),
    ("walk the dog", "walks the dog", "walked the dog", "walked the dog", "walking the dog", "พาสุนัขเดินเล่น"),
    ("drive to work", "drives to work", "drove to work", "driven to work", "driving to work", "ขับรถไปทำงาน"),
    ("take the bus", "takes the bus", "took the bus", "taken the bus", "taking the bus", "ขึ้นรถประจำทาง"),
    ("study English", "studies English", "studied English", "studied English", "studying English", "เรียนภาษาอังกฤษ"),
    ("clean the room", "cleans the room", "cleaned the room", "cleaned the room", "cleaning the room", "ทำความสะอาดห้อง"),
    ("wash the dishes", "washes the dishes", "washed the dishes", "washed the dishes", "washing the dishes", "ล้างจาน"),
    ("cook dinner", "cooks dinner", "cooked dinner", "cooked dinner", "cooking dinner", "ทำอาหารเย็น"),
    ("call the family", "calls the family", "called the family", "called the family", "calling the family", "โทรหาครอบครัว"),
    ("buy groceries", "buys groceries", "bought groceries", "bought groceries", "buying groceries", "ซื้อของใช้และอาหาร"),
    ("go to the gym", "goes to the gym", "went to the gym", "gone to the gym", "going to the gym", "ไปยิม"),
    ("read the news", "reads the news", "read the news", "read the news", "reading the news", "อ่านข่าว"),
    ("watch television", "watches television", "watched television", "watched television", "watching television", "ดูโทรทัศน์"),
    ("listen to music", "listens to music", "listened to music", "listened to music", "listening to music", "ฟังเพลง"),
    ("play basketball", "plays basketball", "played basketball", "played basketball", "playing basketball", "เล่นบาสเกตบอล"),
    ("meet friends", "meets friends", "met friends", "met friends", "meeting friends", "พบเพื่อน"),
    ("work from home", "works from home", "worked from home", "worked from home", "working from home", "ทำงานจากบ้าน"),
    ("finish the homework", "finishes the homework", "finished the homework", "finished the homework", "finishing the homework", "ทำการบ้านเสร็จ"),
    ("water the plants", "waters the plants", "watered the plants", "watered the plants", "watering the plants", "รดน้ำต้นไม้"),
    ("feed the cat", "feeds the cat", "fed the cat", "fed the cat", "feeding the cat", "ให้อาหารแมว"),
    ("pack lunch", "packs lunch", "packed lunch", "packed lunch", "packing lunch", "เตรียมอาหารกลางวันใส่กล่อง"),
    ("charge the phone", "charges the phone", "charged the phone", "charged the phone", "charging the phone", "ชาร์จโทรศัพท์"),
    ("answer messages", "answers messages", "answered messages", "answered messages", "answering messages", "ตอบข้อความ"),
    ("organize the desk", "organizes the desk", "organized the desk", "organized the desk", "organizing the desk", "จัดโต๊ะทำงาน"),
    ("open the shop", "opens the shop", "opened the shop", "opened the shop", "opening the shop", "เปิดร้าน"),
    ("close the store", "closes the store", "closed the store", "closed the store", "closing the store", "ปิดร้าน"),
    ("help a customer", "helps a customer", "helped a customer", "helped a customer", "helping a customer", "ช่วยเหลือลูกค้า"),
    ("attend a meeting", "attends a meeting", "attended a meeting", "attended a meeting", "attending a meeting", "เข้าร่วมประชุม"),
    ("write a report", "writes a report", "wrote a report", "written a report", "writing a report", "เขียนรายงาน"),
    ("pay the bills", "pays the bills", "paid the bills", "paid the bills", "paying the bills", "ชำระบิล"),
    ("book an appointment", "books an appointment", "booked an appointment", "booked an appointment", "booking an appointment", "จองเวลานัดหมาย"),
    ("visit the doctor", "visits the doctor", "visited the doctor", "visited the doctor", "visiting the doctor", "ไปพบแพทย์"),
    ("prepare a presentation", "prepares a presentation", "prepared a presentation", "prepared a presentation", "preparing a presentation", "เตรียมงานนำเสนอ"),
    ("exercise in the park", "exercises in the park", "exercised in the park", "exercised in the park", "exercising in the park", "ออกกำลังกายในสวน"),
    ("wait for the train", "waits for the train", "waited for the train", "waited for the train", "waiting for the train", "รอรถไฟ"),
    ("talk to a neighbor", "talks to a neighbor", "talked to a neighbor", "talked to a neighbor", "talking to a neighbor", "คุยกับเพื่อนบ้าน"),
    ("repair the bicycle", "repairs the bicycle", "repaired the bicycle", "repaired the bicycle", "repairing the bicycle", "ซ่อมจักรยาน"),
    ("order lunch", "orders lunch", "ordered lunch", "ordered lunch", "ordering lunch", "สั่งอาหารกลางวัน"),
    ("learn a new recipe", "learns a new recipe", "learned a new recipe", "learned a new recipe", "learning a new recipe", "เรียนรู้สูตรอาหารใหม่"),
    ("save money", "saves money", "saved money", "saved money", "saving money", "เก็บเงิน"),
    ("plan the weekend", "plans the weekend", "planned the weekend", "planned the weekend", "planning the weekend", "วางแผนวันหยุดสุดสัปดาห์"),
    ("use the computer", "uses the computer", "used the computer", "used the computer", "using the computer", "ใช้คอมพิวเตอร์"),
    ("walk to the market", "walks to the market", "walked to the market", "walked to the market", "walking to the market", "เดินไปตลาด"),
    ("take the medicine", "takes the medicine", "took the medicine", "taken the medicine", "taking the medicine", "รับประทานยา"),
    ("rest after work", "rests after work", "rested after work", "rested after work", "resting after work", "พักผ่อนหลังเลิกงาน"),
    ("tidy the bedroom", "tidies the bedroom", "tidied the bedroom", "tidied the bedroom", "tidying the bedroom", "จัดห้องนอนให้เรียบร้อย"),
]


# -ing phrase, Thai meaning, natural duration in both languages
CONTINUOUS_ACTIONS = [
    ("working from home", "ทำงานจากบ้าน", "for three hours", "เป็นเวลาสามชั่วโมง"),
    ("studying English", "เรียนภาษาอังกฤษ", "for two hours", "เป็นเวลาสองชั่วโมง"),
    ("waiting for the bus", "รอรถประจำทาง", "for twenty minutes", "เป็นเวลายี่สิบนาที"),
    ("cooking dinner", "ทำอาหารเย็น", "for forty minutes", "เป็นเวลาสี่สิบนาที"),
    ("cleaning the kitchen", "ทำความสะอาดครัว", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("reading a book", "อ่านหนังสือ", "for half an hour", "เป็นเวลาครึ่งชั่วโมง"),
    ("watching a series", "ดูซีรีส์", "for two hours", "เป็นเวลาสองชั่วโมง"),
    ("listening to a podcast", "ฟังพอดแคสต์", "for thirty minutes", "เป็นเวลาสามสิบนาที"),
    ("exercising at the gym", "ออกกำลังกายที่ยิม", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("walking around the park", "เดินรอบสวน", "for forty minutes", "เป็นเวลาสี่สิบนาที"),
    ("talking to a friend", "คุยกับเพื่อน", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("writing a report", "เขียนรายงาน", "since this morning", "มาตั้งแต่เช้า"),
    ("preparing a presentation", "เตรียมงานนำเสนอ", "for two days", "เป็นเวลาสองวัน"),
    ("organizing the files", "จัดระเบียบไฟล์", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("answering emails", "ตอบอีเมล", "since nine o'clock", "มาตั้งแต่เก้าโมง"),
    ("practicing the guitar", "ฝึกกีตาร์", "for six months", "เป็นเวลาหกเดือน"),
    ("learning a new recipe", "เรียนรู้สูตรอาหารใหม่", "for a week", "เป็นเวลาหนึ่งสัปดาห์"),
    ("saving money", "เก็บเงิน", "for three months", "เป็นเวลาสามเดือน"),
    ("planning a trip", "วางแผนการเดินทาง", "for several days", "เป็นเวลาหลายวัน"),
    ("shopping for groceries", "ซื้อของใช้และอาหาร", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("driving to work", "ขับรถไปทำงาน", "for forty minutes", "เป็นเวลาสี่สิบนาที"),
    ("traveling by train", "เดินทางด้วยรถไฟ", "for two hours", "เป็นเวลาสองชั่วโมง"),
    ("looking for the keys", "หากุญแจ", "for ten minutes", "เป็นเวลาสิบนาที"),
    ("repairing the bicycle", "ซ่อมจักรยาน", "since lunchtime", "มาตั้งแต่เวลาอาหารกลางวัน"),
    ("painting the bedroom", "ทาสีห้องนอน", "for three hours", "เป็นเวลาสามชั่วโมง"),
    ("washing the car", "ล้างรถ", "for half an hour", "เป็นเวลาครึ่งชั่วโมง"),
    ("doing the laundry", "ซักผ้า", "since early morning", "มาตั้งแต่เช้าตรู่"),
    ("taking care of the baby", "ดูแลเด็ก", "for four hours", "เป็นเวลาสี่ชั่วโมง"),
    ("helping a customer", "ช่วยเหลือลูกค้า", "for twenty minutes", "เป็นเวลายี่สิบนาที"),
    ("attending an online class", "เข้าเรียนออนไลน์", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("working on a project", "ทำโครงการ", "for two weeks", "เป็นเวลาสองสัปดาห์"),
    ("preparing for an exam", "เตรียมสอบ", "for a month", "เป็นเวลาหนึ่งเดือน"),
    ("practicing pronunciation", "ฝึกออกเสียง", "for thirty minutes", "เป็นเวลาสามสิบนาที"),
    ("using the computer", "ใช้คอมพิวเตอร์", "since noon", "มาตั้งแต่เที่ยง"),
    ("building a website", "สร้างเว็บไซต์", "for three weeks", "เป็นเวลาสามสัปดาห์"),
    ("decorating the house", "ตกแต่งบ้าน", "all afternoon", "มาตลอดช่วงบ่าย"),
    ("growing vegetables", "ปลูกผัก", "for several months", "เป็นเวลาหลายเดือน"),
    ("watering the garden", "รดน้ำสวน", "for twenty minutes", "เป็นเวลายี่สิบนาที"),
    ("caring for a pet", "ดูแลสัตว์เลี้ยง", "for many years", "เป็นเวลาหลายปี"),
    ("waiting for an appointment", "รอเวลานัดหมาย", "for half an hour", "เป็นเวลาครึ่งชั่วโมง"),
    ("commuting to the office", "เดินทางไปสำนักงาน", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("packing the bags", "จัดกระเป๋า", "for forty minutes", "เป็นเวลาสี่สิบนาที"),
    ("looking for a new apartment", "หาห้องพักใหม่", "for two weeks", "เป็นเวลาสองสัปดาห์"),
    ("training a new employee", "ฝึกอบรมพนักงานใหม่", "for three days", "เป็นเวลาสามวัน"),
    ("discussing the schedule", "หารือเรื่องตารางเวลา", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("planning the monthly budget", "วางแผนงบประมาณประจำเดือน", "since yesterday", "มาตั้งแต่เมื่อวาน"),
    ("exercising outdoors", "ออกกำลังกายกลางแจ้ง", "for forty minutes", "เป็นเวลาสี่สิบนาที"),
    ("learning to drive", "เรียนขับรถ", "for two months", "เป็นเวลาสองเดือน"),
    ("resting at home", "พักผ่อนอยู่ที่บ้าน", "for an hour", "เป็นเวลาหนึ่งชั่วโมง"),
    ("sleeping better", "นอนหลับได้ดีขึ้น", "for several nights", "เป็นเวลาหลายคืน"),
]


TENSE_INFO = {
    "present_simple": ("Present Simple", "ปัจจุบันธรรมดา", "S + V1(s/es)"),
    "present_continuous": ("Present Continuous", "ปัจจุบันกำลังทำ", "S + am/is/are + V-ing"),
    "present_perfect": ("Present Perfect", "ปัจจุบันสมบูรณ์", "S + have/has + V3"),
    "present_perfect_continuous": ("Present Perfect Continuous", "ปัจจุบันสมบูรณ์ต่อเนื่อง", "S + have/has been + V-ing"),
    "past_simple": ("Past Simple", "อดีตธรรมดา", "S + V2"),
    "past_continuous": ("Past Continuous", "อดีตกำลังทำ", "S + was/were + V-ing"),
    "past_perfect": ("Past Perfect", "อดีตสมบูรณ์", "S + had + V3"),
    "past_perfect_continuous": ("Past Perfect Continuous", "อดีตสมบูรณ์ต่อเนื่อง", "S + had been + V-ing"),
    "future_simple": ("Future Simple", "อนาคตธรรมดา", "S + will + V1"),
    "future_continuous": ("Future Continuous", "อนาคตกำลังทำ", "S + will be + V-ing"),
    "future_perfect": ("Future Perfect", "อนาคตสมบูรณ์", "S + will have + V3"),
    "future_perfect_continuous": ("Future Perfect Continuous", "อนาคตสมบูรณ์ต่อเนื่อง", "S + will have been + V-ing"),
}


HABIT_EN = ["every day", "regularly", "on weekdays", "as part of the daily routine", "most mornings", "whenever necessary"]
HABIT_TH = ["ทุกวัน", "เป็นประจำ", "ในวันธรรมดา", "เป็นส่วนหนึ่งของกิจวัตรประจำวัน", "เกือบทุกเช้า", "เมื่อจำเป็น"]
PAST_EN = ["yesterday", "last night", "this morning", "two days ago", "last weekend", "earlier today"]
PAST_TH = ["เมื่อวาน", "เมื่อคืน", "เมื่อเช้านี้", "เมื่อสองวันก่อน", "สุดสัปดาห์ที่แล้ว", "ก่อนหน้านี้วันนี้"]


def item(tense_id: str, en: str, th: str) -> dict[str, str]:
    label, thai_label, formula = TENSE_INFO[tense_id]
    return {
        "th": th,
        "en": en,
        "kind": "tense",
        "tenseId": tense_id,
        "tense": label,
        "tenseTh": thai_label,
        "formula": formula,
    }


def build_bank() -> dict[str, list[dict[str, str]]]:
    bank = {key: [] for key in TENSE_INFO}
    for subject_index, subject in enumerate(SUBJECTS):
        for base, third, past, participle, _ing, thai_action in SIMPLE_ACTIONS:
            verb = third if subject["third"] else base
            bank["present_simple"].append(item(
                "present_simple",
                f'{subject["en"]} {verb} {HABIT_EN[subject_index]}.',
                f'{subject["th"]}{thai_action}{HABIT_TH[subject_index]}',
            ))
            bank["present_perfect"].append(item(
                "present_perfect",
                f'{subject["en"]} {subject["have"]} already {participle}.',
                f'{subject["th"]}{thai_action}เรียบร้อยแล้ว',
            ))
            bank["past_simple"].append(item(
                "past_simple",
                f'{subject["en"]} {past} {PAST_EN[subject_index]}.',
                f'{subject["th"]}{thai_action}{PAST_TH[subject_index]}',
            ))
            bank["past_perfect"].append(item(
                "past_perfect",
                f'{subject["en"]} had {participle} before the day ended.',
                f'{subject["th"]}{thai_action}เสร็จแล้วก่อนวันนั้นจะสิ้นสุด',
            ))
            bank["future_simple"].append(item(
                "future_simple",
                f'{subject["en"]} will {base} tomorrow.',
                f'พรุ่งนี้{subject["th"]}จะ{thai_action}',
            ))
            bank["future_perfect"].append(item(
                "future_perfect",
                f'{subject["en"]} will have {participle} by the end of the day.',
                f'ภายในสิ้นวัน{subject["th"]}จะ{thai_action}เสร็จแล้ว',
            ))

        for ing_form, thai_action, duration_en, duration_th in CONTINUOUS_ACTIONS:
            bank["present_continuous"].append(item(
                "present_continuous",
                f'{subject["en"]} {subject["be"]} {ing_form} right now.',
                f'ตอนนี้{subject["th"]}กำลัง{thai_action}อยู่',
            ))
            bank["present_perfect_continuous"].append(item(
                "present_perfect_continuous",
                f'{subject["en"]} {subject["have"]} been {ing_form} {duration_en}.',
                f'{subject["th"]}{thai_action}ต่อเนื่องมา{duration_th}',
            ))
            bank["past_continuous"].append(item(
                "past_continuous",
                f'{subject["en"]} {subject["past_be"]} {ing_form} when you called.',
                f'ตอนที่คุณโทรมา{subject["th"]}กำลัง{thai_action}อยู่',
            ))
            bank["past_perfect_continuous"].append(item(
                "past_perfect_continuous",
                f'{subject["en"]} had been {ing_form} {duration_en} before taking a break.',
                f'{subject["th"]}{thai_action}ต่อเนื่องมา{duration_th}ก่อนจะพัก',
            ))
            bank["future_continuous"].append(item(
                "future_continuous",
                f'{subject["en"]} will be {ing_form} at this time tomorrow.',
                f'เวลานี้ของวันพรุ่งนี้{subject["th"]}จะกำลัง{thai_action}อยู่',
            ))
            bank["future_perfect_continuous"].append(item(
                "future_perfect_continuous",
                f'By this time tomorrow, {subject["en"] if subject["en"] == "I" else subject["en"].lower()} will have been {ing_form} {duration_en}.',
                f'ภายในเวลานี้ของวันพรุ่งนี้{subject["th"]}จะได้{thai_action}ต่อเนื่องครบ{duration_th}',
            ))

    for tense_id, rows in bank.items():
        if len(rows) != 300:
            raise RuntimeError(f"{tense_id}: expected 300 rows, got {len(rows)}")
        english = [row["en"] for row in rows]
        if len(set(english)) != 300:
            raise RuntimeError(f"{tense_id}: duplicate English sentences")
    return bank


def build_pronunciations(bank: dict[str, list[dict[str, str]]]) -> dict[str, str]:
    sentences = [row["en"] for rows in bank.values() for row in rows]
    sounds: list[str] = []
    for offset in range(0, len(sentences), 80):
        chunk = sentences[offset:offset + 80]
        converted = ipa.convert(" XQZX ".join(chunk))
        converted_chunk = converted.split(" xqzx* ")
        if len(converted_chunk) != len(chunk):
            raise RuntimeError(
                f"IPA conversion mismatch in chunk {offset}: {len(converted_chunk)} for {len(chunk)} sentences"
            )
        sounds.extend(converted_chunk)
    manual_ipa = {"tidies*": "ˈtaɪdiz", "tidied*": "ˈtaɪdid"}
    cleaned = []
    for sound in sounds:
        for unknown, pronunciation in manual_ipa.items():
            sound = sound.replace(unknown, pronunciation)
        if "*" in sound:
            raise RuntimeError(f"Unresolved IPA word in: {sound}")
        cleaned.append(sound.strip())
    return dict(zip(sentences, cleaned))


def main() -> None:
    bank = build_bank()
    meta = {
        "count": 3600,
        "perTense": 300,
        "tenseCount": 12,
        "version": "2026-09",
        "originalExamples": True,
    }
    BANK_OUTPUT.write_text(
        "/* 3,600 original daily-life examples: 300 for each of the 12 English tenses. */\n"
        "window.AR_TENSE_BANK="
        + json.dumps({"sentences": bank, "tenseInfo": TENSE_INFO, "meta": meta}, ensure_ascii=True, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    pronunciation_map = build_pronunciations(bank)
    IPA_OUTPUT.write_text(
        "/* IPA for the 3,600 tense-practice sentences. */\n"
        "Object.assign(window.AR_PRONUNCIATIONS||(window.AR_PRONUNCIATIONS={}),"
        + json.dumps(pronunciation_map, ensure_ascii=True, separators=(",", ":"))
        + ");\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "sentences": sum(map(len, bank.values())),
        "perTense": {key: len(rows) for key, rows in bank.items()},
        "bankBytes": BANK_OUTPUT.stat().st_size,
        "ipaBytes": IPA_OUTPUT.stat().st_size,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
