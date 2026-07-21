import json

slides = []
for i in range(1, 90):
    slide_id = f"slide_{i}"
    image_path = f"slides_pdf_images/slide_{i}.png"
    
    # Check if this slide is Quiz 1 (slide 25)
    if i == 25:
        slide_obj = {
            "id": "quiz_1",
            "type": "quiz",
            "title": "Pergunta 1: Fundamento de Segurança",
            "question": "Qual a primeira coisa que precisamos fazer para dar segurança ao Copilot?",
            "options": [
                "Comprar a licença mais cara de todas.",
                "Garantir que o ambiente (M365, Entra ID, SharePoint) seja seguro.",
                "Desativar a internet na empresa para todos os usuários.",
                "Instalar um antivírus diretamente dentro da Inteligência Artificial."
            ],
            "correct": 1,
            "image": image_path,
            "explanation": "Correto! O Copilot respeita rigorosamente as permissões do próprio tenant. Se o ambiente onde ele funciona (Microsoft 365, Entra ID, SharePoint) estiver desprotegido, o Copilot poderá acessar dados indevidos. A segurança começa organizando o ambiente!",
            "points": 1000
        }
    else:
        slide_obj = {
            "id": slide_id,
            "type": "content",
            "title": f"Slide {i}",
            "subtitle": "",
            "text": "",
            "image": image_path
        }
    slides.append(slide_obj)

with open("presentation_data.json", "w", encoding="utf-8") as f:
    json.dump(slides, f, ensure_ascii=False, indent=2)

print("Generated presentation_data.json with 89 slides!")
