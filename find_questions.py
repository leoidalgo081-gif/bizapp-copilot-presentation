import json
import re

with open('slides_summary.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

questions_by_file = {}

for file, slides in d.items():
    questions_by_file[file] = []
    for s in slides:
        text = s.get('text', '')
        # Simple heuristic: slide text containing "?" or multiple choices like "A)" or "B)"
        has_q_mark = "?" in text
        has_choices = "A)" in text or "A) " in text
        
        if has_q_mark or has_choices or "Qual " in text or "Como " in text or "Pergunta" in text:
            questions_by_file[file].append({
                "slide_number": s["slide_number"],
                "title": s.get("title", ""),
                "text": text,
                "images": s.get("images", [])
            })

with open('extracted_questions.json', 'w', encoding='utf-8') as out:
    json.dump(questions_by_file, out, indent=4, ensure_ascii=False)

print("Extracted questions written to extracted_questions.json")
