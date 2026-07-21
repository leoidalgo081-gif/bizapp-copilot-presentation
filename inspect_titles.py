import json

with open('slides_summary.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

with open('slide_titles_summary.txt', 'w', encoding='utf-8') as out:
    for key, slides in d.items():
        out.write(f"=== {key} ({len(slides)} slides) ===\n")
        for s in slides:
            title = s.get('title', '')
            text_snippet = s.get('text', '').replace('\n', ' ')[:100]
            out.write(f"Slide {s['slide_number']}: {title} | {text_snippet}\n")
        out.write("\n")

print("Done writing to slide_titles_summary.txt")
