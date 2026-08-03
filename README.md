# Montessori Illustration Engine

محرك توليد SVG تعليمي حتمي: يأخذ نشاط Montessori كنص منظّم ويُخرج SVG واحد بهوية بصرية ثابتة (`Cinematic Montessori`).

هذا الملف = فهرس المشروع. اقرأه أولاً في أي جلسة جديدة.

---

## ترتيب القراءة الإلزامي (لأي جلسة قادمة)

1. `MASTER_DECISIONS.md` — العقد الحاكم. يمنع الانحراف. **يُقرأ أولاً دائماً.**
2. `constitution/visual_rules.md` — القيم الرقمية الثابتة (ألوان/حدود/قياسات).
3. `docs/ARCHITECTURE.md` — المعمارية والـ pipeline.
4. `docs/DATA_SCHEMA.md` — مخططات المدخل/الوسيط/المخرج.
5. `engine/*` — منطق كل مرحلة.
6. `components/*` — المكونات الجاهزة (تُبنى في الجلسة القادمة).

---

## خط الأنابيب (Pipeline)

```
activities/*.json
   → scene_interpreter   (Scene Graph)
   → camera_selector     (الزاوية)
   → layout_planner      (المواضع)
   → svg_renderer        (assemble + apply constitution)
   → outputs/*.svg + outputs/*.json
```

---

## الحالة الحالية

- [x] القرارات الحاكمة (MASTER_DECISIONS)
- [x] الدستور البصري (constitution)
- [x] المعمارية + المخططات (docs)
- [x] مواصفات المحرك (engine)
- [x] نشاط عينة (activities/transfer_beans.json)
- [ ] **مكتبة المكونات** ← الجلسة القادمة (Chat 2)
- [ ] أول SVG مُولّد كامل ← (Chat 3)

---

## معيار النجاح الأول
يدخل: "نقل الماء بالإسفنجة" → يخرج: SVG واحد ممتاز، منظم، قابل للتعديل.
