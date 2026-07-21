import json

with open('slides_summary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for pptx, list_s in data.items():
    print(f"=== {pptx} ===")
    for s in list_s:
        num = s.get('slide_number')
        txt = s.get('text', '').replace('\n', ' ')
        if any(w in txt.lower() for w in ['refletiu', 'controles', 'camadas', 'monitorarmos', 'camada', 'zero trust']):
            cleaned = txt[:120].encode('ascii', 'ignore').decode('ascii')
            print(f"  Slide {num}: {cleaned}")
