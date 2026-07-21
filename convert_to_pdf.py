import os
import sys
import comtypes.client

def convert_pptx_to_pdf(input_file, output_file):
    print(f"Opening PowerPoint (Visible Mode)...", flush=True)
    print(f"Input: {input_file}", flush=True)
    print(f"Output: {output_file}", flush=True)
    
    # Initialize powerpoint application
    try:
        powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
    except Exception as e:
        print(f"Error initializing PowerPoint application: {e}", flush=True)
        print("Please make sure Microsoft PowerPoint is installed on this Windows system.", flush=True)
        return False
        
    # PowerPoint requires Visible = 1 to open and save files
    powerpoint.Visible = 1
    
    try:
        print("Opening presentation deck...", flush=True)
        # Open presentation normally
        deck = powerpoint.Presentations.Open(input_file)
        print("Saving presentation as PDF (Type 32)...", flush=True)
        deck.SaveAs(output_file, 32)
        deck.Close()
        print("Successfully exported to PDF!", flush=True)
        return True
    except Exception as e:
        print(f"Error during PDF conversion: {e}", flush=True)
        return False
    finally:
        try:
            print("Quitting PowerPoint application...", flush=True)
            powerpoint.Quit()
        except Exception:
            pass

def main():
    ppt_filename = "Template Apresentação com Copilot - Bizapp 2026.pptx"
    pdf_filename = "Template Apresentação com Copilot - Bizapp 2026.pdf"
    
    input_path = os.path.abspath(ppt_filename)
    output_path = os.path.abspath(pdf_filename)
    
    if not os.path.exists(input_path):
        print(f"Error: PowerPoint file not found at {input_path}", flush=True)
        sys.exit(1)
        
    success = convert_pptx_to_pdf(input_path, output_path)
    if success:
        print("Conversion process finished successfully.", flush=True)
    else:
        print("Conversion process failed.", flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
