import fitz  # PyMuPDF
import os
import sys

def pdf_to_images(pdf_path, output_dir):
    print(f"Loading PDF file: {pdf_path}", flush=True)
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file {pdf_path} not found.", flush=True)
        return False
        
    os.makedirs(output_dir, exist_ok=True)
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening PDF: {e}", flush=True)
        return False
        
    # Zoom of 2x renders slides at 150 DPI for crisp text and visuals
    zoom = 2.0
    mat = fitz.Matrix(zoom, zoom)
    
    total_pages = len(doc)
    print(f"Total pages to convert: {total_pages}", flush=True)
    
    for page_num in range(total_pages):
        try:
            page = doc.load_page(page_num)
            pix = page.get_pixmap(matrix=mat)
            output_file = os.path.join(output_dir, f"slide_{page_num + 1}.png")
            pix.save(output_file)
            
            # Print progress
            if (page_num + 1) % 10 == 0 or (page_num + 1) == total_pages:
                print(f"Rendered slide {page_num + 1}/{total_pages}...", flush=True)
        except Exception as e:
            print(f"Error rendering slide {page_num + 1}: {e}", flush=True)
            
    print("Conversion completed successfully!", flush=True)
    return True

if __name__ == "__main__":
    pdf_file = "Template Apresentação com Copilot - Bizapp 2026.pdf"
    output_folder = "public/slides_pdf_images"
    success = pdf_to_images(pdf_file, output_folder)
    if not success:
        sys.exit(1)
