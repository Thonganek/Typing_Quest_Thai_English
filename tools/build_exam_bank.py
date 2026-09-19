"""Build the offline 1,000-word exam-preparation bank.

The Academic Word List headwords are read from the EAP Foundation rendering of
Coxhead's AWL.  Thai glosses come from the locally downloaded LEXiTRON export.
The output is runtime-only JavaScript; the application itself needs no network.
"""

from __future__ import annotations

import csv
import json
import re
import urllib.request
from collections import defaultdict
from pathlib import Path

import eng_to_ipa as ipa
from wordfreq import top_n_list, zipf_frequency


ROOT = Path(__file__).resolve().parents[1]
LEARNING_BANK = ROOT / "data" / "learning-bank.js"
OUTPUT = ROOT / "data" / "exam-bank.js"
PRONUNCIATION_OUTPUT = ROOT / "data" / "exam-pronunciation-bank.js"
LEXITRON = Path(r"C:\Users\ACE\AppData\Local\Temp\etlex-utf8.csv")
AWL_URL = "https://www.eapfoundation.com/vocab/academic/awllists/"


# Workplace, office, finance, travel, retail, technology, and service terms
# commonly encountered in practical business-English preparation.
TOEIC_CORE = """
agenda appointment applicant application approval authorize authorization award
bargain branch brand brochure budget candidate career catalog catalogue
certificate client colleague commerce commission complaint conference consultant
consumer contract cooperate corporation deadline department discount distributor
employee employer employment equipment estimate executive expense feedback
franchise guarantee headquarters hire insurance inventory invoice itinerary
manager manufacturer marketing meeting negotiate negotiation occupation overtime
payment personnel policy procedure product profession profit project promotion
purchase receipt recruit recruitment refund reservation retail salary schedule
shipment signature staff stock supplier survey target training transaction vacancy
warehouse warranty wholesale workplace accountant accounting advertisement
advertising agency airline airport amenity annual announcement appliance archive
arrival assembly asset assistant attendance auditorium balance bankruptcy banquet
barcode benefit beverage bill boardroom bonus booking booth briefcase building
business cafeteria cancellation capacity cargo cashier catering chairman checkout
clientele clerk collaboration commuter compensation competitor confirmation
construction contact convenience convention courier credit currency customer
customs database dealer delivery demand destination director directory dividend
document earnings economy efficiency enterprise entrepreneur entry exhibit
exhibition facility fare forecast freight fund funding hospitality hotel income
industry inspection installment instruction interview investment landlord lease
ledger luggage machinery maintenance merchandise merger mortgage office operator
order organization outlet passenger payroll pension portfolio presentation price
printer productivity proposal prospect quotation receptionist reimbursement
renovation report representative revenue room service seminar share shareholder
shipping software stationery subscription supervisor tax tenant terminal tourism
trade transfer transportation traveler vendor venue visitor workload workshop
accommodation account acquisition administration advice airline allowance analyst
appliance audit auditorium baggage banker bankruptcy billing booklet cabin
campaign cancellation carrier checkout circulation claim commerce competitor
complaint concession confirmation contractor convention cooperation coupon
credential customer delay departure deposit destination dining discount dispatch
distribution duty earnings economy elevator entrance equipment estimate facility
fare finance freight garage guidance headquarters hospitality installment
insurance interest interview investment leadership lease luggage machinery
maintenance management manufacture marketing membership merger mileage mortgage
network notice occupancy operator package passenger pension portfolio postage
presentation productivity property proposal quotation receipt receptionist
registration reimbursement renovation repair reservation retailer route safety
schedule security service shareholder shipment software storage subscription
supervisor supply survey tariff tenant tourism trade traffic transaction transfer
transportation traveler utility vacancy vendor venue visitor warehouse warranty
withdrawal workshop accommodate advertise advise allocate announce apply approve
arrange assemble attend audit authorize book cancel collaborate commute compensate
complain confirm construct consult contact coordinate correspond deliver depart
deposit dispatch distribute employ enclose endorse evaluate exhibit expand expire
finance hire implement improve inspect install insure interview invest invoice
launch lease maintain manufacture market merge negotiate notify operate order
organize postpone present process produce promote propose purchase recruit reduce
refund register reimburse relocate renovate rent repair replace reserve reschedule
retire review revise ship sign store subscribe supervise supply transfer transport
travel update upgrade withdraw affordable available commercial competitive
complimentary convenient corporate defective delayed efficient eligible enclosed
experienced flexible furnished international managerial monthly negotiable
operational optional payable permanent professional profitable promotional
punctual qualified quarterly refundable reliable residential seasonal temporary
unavailable vacant valid weekly annually approximately currently formerly
immediately locally promptly recently temporarily aboard downtown overseas
deadline memo memorandum minutes itinerary kiosk lobby lounge platform aisle
passport suitcase cafeteria restaurant menu appetizer dessert cuisine chef
reservation accommodation resort motel hostel reception concierge laundry
conference seminar workshop lecture presentation projector microphone auditorium
factory plant machinery equipment technician engineer mechanic maintenance repair
quality inspection defect replacement warranty assembly production shipment
invoice quotation estimate budget expense revenue profit loss balance payment
cash credit debit cheque check transfer interest loan mortgage currency exchange
bank account deposit withdrawal teller statement receipt tax fee charge fare
human resources candidate resume résumé interview qualification experience skill
position vacancy occupation profession department division supervisor colleague
teamwork leadership performance evaluation promotion salary wage bonus pension
marketing advertisement campaign audience customer consumer survey feedback
brand product service price discount coupon catalog brochure leaflet billboard
sales retailer wholesaler supplier vendor inventory stock warehouse distribution
technology computer laptop monitor keyboard printer scanner network database
software hardware website online password account update upgrade install download
travel flight airline airport departure arrival boarding gate terminal passport
baggage luggage customs destination itinerary accommodation reservation fare
commute commuter subway railway train bus taxi vehicle traffic parking garage
property apartment office building tenant landlord rent lease furnished renovation
health clinic appointment physician dentist pharmacy prescription insurance
restaurant order server waiter cashier bill receipt beverage meal catering banquet
mail envelope parcel package postage courier delivery address recipient sender
schedule calendar appointment deadline postpone delay cancel confirm notify remind
""".split()


MANUAL_THAI = {
    "abandon": "ละทิ้ง", "abstract": "นามธรรม", "accompany": "ไปด้วยกัน",
    "acquire": "ได้รับ", "adapt": "ปรับตัว", "adequate": "เพียงพอ",
    "advocate": "สนับสนุน", "aggregate": "รวมทั้งหมด", "allocate": "จัดสรร",
    "ambiguous": "กำกวม", "anticipate": "คาดการณ์", "apparent": "เห็นได้ชัด",
    "arbitrary": "ตามอำเภอใจ", "attain": "บรรลุ", "attribute": "คุณลักษณะ",
    "bias": "อคติ", "brief": "สรุปย่อ", "capacity": "ความสามารถรองรับ",
    "compile": "รวบรวม", "comprehensive": "ครอบคลุม", "concurrent": "พร้อมกัน",
    "conduct": "ดำเนินการ", "conform": "สอดคล้อง", "constitute": "ประกอบเป็น",
    "constrain": "จำกัด", "contemporary": "ร่วมสมัย", "contradict": "ขัดแย้ง",
    "criteria": "เกณฑ์", "crucial": "สำคัญยิ่ง", "decline": "ลดลง",
    "deduce": "อนุมาน", "derive": "ได้มาจาก", "deviate": "เบี่ยงเบน",
    "differentiate": "แยกแยะ", "diminish": "ลดน้อยลง", "distinct": "แตกต่างชัดเจน",
    "draft": "ร่าง", "duration": "ระยะเวลา", "eliminate": "กำจัด",
    "empirical": "เชิงประจักษ์", "encounter": "เผชิญ", "enhance": "ยกระดับ",
    "entity": "หน่วยหรือสิ่งที่มีอยู่", "equivalent": "เทียบเท่า", "explicit": "ชัดเจน",
    "facilitate": "อำนวยความสะดวก", "fluctuate": "ผันผวน", "framework": "กรอบแนวคิด",
    "fundamental": "พื้นฐานสำคัญ", "hypothesis": "สมมติฐาน", "imply": "บ่งชี้โดยนัย",
    "incentive": "สิ่งจูงใจ", "incidence": "อัตราการเกิด", "inevitable": "หลีกเลี่ยงไม่ได้",
    "infer": "อนุมาน", "inhibit": "ยับยั้ง", "integrity": "ความซื่อสัตย์และครบถ้วน",
    "intrinsic": "โดยเนื้อแท้", "invoke": "นำมาใช้", "justify": "ให้เหตุผลสนับสนุน",
    "likewise": "ในทำนองเดียวกัน", "manipulate": "จัดการ", "mediate": "ไกล่เกลี่ย",
    "nevertheless": "อย่างไรก็ตาม", "objective": "วัตถุประสงค์", "offset": "ชดเชย",
    "paradigm": "กรอบแนวคิด", "parameter": "ตัวแปรกำหนด", "perceive": "รับรู้",
    "persist": "คงอยู่", "phenomenon": "ปรากฏการณ์", "precede": "มาก่อน",
    "predominant": "โดดเด่นเป็นส่วนใหญ่", "preliminary": "เบื้องต้น", "prevail": "มีชัยหรือแพร่หลาย",
    "proportion": "สัดส่วน", "protocol": "ระเบียบวิธี", "refine": "ปรับปรุงให้ละเอียด",
    "reinforce": "เสริมแรง", "reluctant": "ไม่เต็มใจ", "retain": "รักษาไว้",
    "rigid": "เข้มงวดไม่ยืดหยุ่น", "scenario": "สถานการณ์จำลอง", "scope": "ขอบเขต",
    "simulate": "จำลอง", "sole": "เพียงหนึ่งเดียว", "subsequent": "ที่ตามมา",
    "sustain": "ทำให้คงอยู่", "terminate": "ยุติ", "undergo": "ผ่านกระบวนการ",
    "underlying": "ที่เป็นพื้นฐาน", "undertake": "รับดำเนินการ", "utilize": "ใช้ประโยชน์",
    "valid": "สมเหตุสมผล", "whereas": "ในขณะที่", "invoice": "ใบแจ้งหนี้",
    "shipment": "การจัดส่งสินค้า", "inventory": "สินค้าคงคลัง", "itinerary": "กำหนดการเดินทาง",
    "reimbursement": "การคืนค่าใช้จ่าย", "resume": "ประวัติย่อ", "deadline": "กำหนดส่ง",
    "venue": "สถานที่จัดงาน", "vacancy": "ตำแหน่งว่าง", "warranty": "การรับประกัน",
    "warehouse": "คลังสินค้า", "wholesale": "การขายส่ง", "retail": "การขายปลีก",
    "quotation": "ใบเสนอราคา", "receipt": "ใบเสร็จรับเงิน", "refund": "การคืนเงิน",
    "reservation": "การจอง", "supplier": "ผู้จัดหา", "vendor": "ผู้ขาย",
    "attend": "เข้าร่วม", "deliver": "จัดส่ง", "perspective": "มุมมอง",
    "principal": "สำคัญที่สุด", "convenience": "ความสะดวก", "machinery": "เครื่องจักร",
    "outlet": "ร้านจำหน่ายสินค้า", "extract": "ข้อความที่คัดมา", "accommodate": "จัดที่พักให้",
    "clerk": "เสมียน", "prescription": "ใบสั่งยา", "subscribe": "สมัครสมาชิก",
    "quote": "เสนอราคา", "panel": "คณะผู้เชี่ยวชาญ", "portion": "ส่วนหนึ่ง",
    "respond": "ตอบสนอง", "constant": "คงที่", "ultimate": "สูงสุด",
    "lobby": "ห้องโถงรับรอง", "immigrate": "อพยพเข้าไปตั้งถิ่นฐาน", "isolate": "แยกออก",
    "feedback": "ข้อเสนอแนะ", "auditorium": "หอประชุม", "incorporate": "รวมเข้าเป็นส่วนหนึ่ง",
    "demonstrative": "ที่แสดงออกชัดเจน", "external": "ภายนอก", "coordinate": "ประสานงาน",
    "website": "เว็บไซต์", "laptop": "คอมพิวเตอร์พกพา", "aisle": "ทางเดินระหว่างแถว",
}


STOP = set("""
that with this have from your they just about what when more were their there
which been would some also them other than only after into could then because
these where those being while does doing done gonna gotta yeah okay anyone
someone everyone myself yourself ourselves themselves hers ours yours whose
john mary james david michael robert william richard charles joseph thomas
frank henry martin matt george london canada german australian russia africa
mexico pakistan iran wales korean colorado hollywood olympic presidential
bitch evil dying killed death murder violence jail criminal offensive
sex sexual sexuality max dick suicide
""".split())


def load_base_words() -> set[str]:
    text = LEARNING_BANK.read_text(encoding="utf-8")
    match = re.search(r"const raw=(\{.*?\});\n  const replacements", text, re.S)
    raw = json.loads(match.group(1))
    return {en.lower() for rows in raw["vocabulary"].values() for _th, en in rows}


def load_awl() -> tuple[list[str], list[str]]:
    html = urllib.request.urlopen(AWL_URL, timeout=30).read().decode("utf-8", "ignore")
    result: list[str] = []
    for word, _sublist in re.findall(r"<b>([a-z][a-z-]+)</b></a></td><td>(10|[1-9])</td>", html):
        if word not in result:
            result.append(word)
    if len(result) != 570:
        raise RuntimeError(f"Expected 570 AWL headwords, found {len(result)}")
    family: list[str] = []
    for word in re.findall(r"dic7\.php\?word=([a-z-]+)", html):
        if word not in family:
            family.append(word)
    return result, family


def load_lexitron() -> dict[str, list[tuple[str, str]]]:
    entries: dict[str, list[tuple[str, str]]] = defaultdict(list)
    with LEXITRON.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            word = row["e-entry"].strip().lower()
            thai = row["t-entry"].strip()
            cat = row["e-cat"].strip()
            if word and thai and (thai, cat) not in entries[word]:
                entries[word].append((thai, cat))
    return entries


def likely_inflection(word: str, lexicon: dict[str, list[tuple[str, str]]]) -> bool:
    stems = []
    if word.endswith("ies") and len(word) > 5:
        stems.append(word[:-3] + "y")
    if word.endswith("es") and len(word) > 5:
        stems.extend([word[:-2], word[:-1]])
    elif word.endswith("s") and len(word) > 4:
        stems.append(word[:-1])
    if word.endswith("ied") and len(word) > 5:
        stems.append(word[:-3] + "y")
    if word.endswith("ed") and len(word) > 5:
        stems.extend([word[:-2], word[:-1]])
    if word.endswith("ing") and len(word) > 6:
        stems.extend([word[:-3], word[:-3] + "e"])
    return any(stem in lexicon for stem in stems)


def thai_gloss(word: str, entries: list[tuple[str, str]]) -> str:
    if word in MANUAL_THAI:
        return MANUAL_THAI[word]
    nounish = word.endswith(("tion", "sion", "ment", "ness", "ity", "ance", "ence", "ship", "ism"))
    adverb = word.endswith("ly")
    adjective = word.endswith(("ous", "ive", "able", "ible", "ical", "ful", "less", "ent", "ant"))
    preferred = "N" if nounish else "ADV" if adverb else "ADJ" if adjective else ""

    def score(item: tuple[str, str]) -> tuple[int, int, int]:
        thai, cat = item
        preference = 0 if preferred and cat == preferred else 1
        penalty = 4 if thai.startswith("(") else 0
        penalty += 3 if any(mark in thai for mark in ("[", "]", "ฯ")) else 0
        # LEXiTRON lists the primary sense first; retain that ordering after
        # selecting the likely part of speech.
        return preference, penalty, entries.index(item)

    return min(entries, key=score)[0]


def main() -> None:
    base = load_base_words()
    awl, awl_family = load_awl()
    awl_set = set(awl)
    lexicon = load_lexitron()

    selected: list[str] = []
    origin: dict[str, str] = {}

    def add(word: str, source: str) -> None:
        word = word.lower().strip()
        if (word.isalpha() and 3 <= len(word) <= 16 and word not in base
                and word not in selected and word in lexicon and word not in STOP):
            selected.append(word)
            origin[word] = source

    for word in awl:
        add(word, "academic")
    for word in TOEIC_CORE:
        add(word.replace("é", "e"), "workplace")

    # Add useful members of AWL word families (e.g. analyse / analysis /
    # analytical), while excluding routine plurals and verb inflections.
    for word in awl_family:
        if len(selected) >= 1000:
            break
        if likely_inflection(word, lexicon):
            continue
        add(word, "academic-family")

    # Fill the combined pack with useful dictionary headwords by frequency.
    # These receive all four relevance tags because they are general core words.
    for word in top_n_list("en", 18000)[1800:]:
        if len(selected) >= 1000:
            break
        if likely_inflection(word, lexicon):
            continue
        add(word, "general")

    if len(selected) < 1000:
        raise RuntimeError(f"Only found {len(selected)} eligible words")
    selected = selected[:1000]

    rows = []
    for word in selected:
        source = origin[word]
        if word in awl_set and source == "workplace":
            tags = ["TOEFL", "TOEIC", "IELTS", "KKU-AELT"]
        elif source.startswith("academic"):
            tags = ["TOEFL", "IELTS", "KKU-AELT"]
        elif source == "workplace":
            tags = ["TOEIC"]
        else:
            tags = ["TOEFL", "TOEIC", "IELTS", "KKU-AELT"]
        rows.append({
            "th": thai_gloss(word, lexicon[word]),
            "en": word,
            "tags": tags,
            "source": source,
            "frequency": round(zipf_frequency(word, "en"), 2),
        })

    # Familiar words first, advanced words last. Each setting has a stable size.
    rows.sort(key=lambda row: (-row["frequency"], row["en"]))
    payload = {
        "easy": rows[:334],
        "normal": rows[334:667],
        "pro": rows[667:],
    }
    metadata = {
        "count": 1000,
        "academicWordListHeadwordsIncluded": sum(1 for row in rows if row["en"] in awl_set),
        "version": "2026-09",
        "note": "Curated preparation pack; not an official vocabulary list from an exam owner.",
    }
    output = (
        "/* Offline 1,000-word exam-preparation bank. Not an official exam-owner list.\n"
        "   Academic selection uses Coxhead's AWL; Thai glosses use LEXiTRON. */\n"
        "window.AR_EXAM_BANK="
        + json.dumps({"vocabulary": payload, "meta": metadata}, ensure_ascii=True, separators=(",", ":"))
        + ";\n"
    )
    OUTPUT.write_text(output, encoding="utf-8")

    words = [row["en"] for row in rows]
    converted = ipa.convert(" XQZX ".join(words))
    pronunciations = converted.split(" xqzx* ")
    if len(pronunciations) != len(words):
        raise RuntimeError(f"IPA conversion mismatch: {len(pronunciations)} for {len(words)} words")
    ipa_map = {word: sound.replace("*", "").strip() for word, sound in zip(words, pronunciations)}
    PRONUNCIATION_OUTPUT.write_text(
        "/* IPA for the offline exam-preparation bank. */\n"
        "Object.assign(window.AR_PRONUNCIATIONS||(window.AR_PRONUNCIATIONS={}),"
        + json.dumps(ipa_map, ensure_ascii=True, separators=(",", ":"))
        + ");\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "output": str(OUTPUT),
        "pronunciationOutput": str(PRONUNCIATION_OUTPUT),
        "count": sum(map(len, payload.values())),
        "levels": {key: len(value) for key, value in payload.items()},
        "sources": {name: sum(1 for row in rows if row["source"] == name) for name in ("academic", "academic-family", "workplace", "general")},
        "tagCounts": {tag: sum(tag in row["tags"] for row in rows) for tag in ("TOEFL", "TOEIC", "IELTS", "KKU-AELT")},
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
