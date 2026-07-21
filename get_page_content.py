import asyncio
import sys

async def main():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("playwright not installed in this environment")
        return
        
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Log console messages
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        # Log page errors
        page.on("pageerror", lambda err: print(f"[ERROR] {err}"))
        
        # Log network requests and responses
        page.on("request", lambda req: print(f"[REQUEST] {req.method} {req.url}"))
        page.on("response", lambda res: print(f"[RESPONSE] {res.status} {res.url} - {res.headers.get('content-type')}"))
        
        print("Navigating to http://localhost:3030/admin.html...")
        try:
            await page.goto("http://localhost:3030/admin.html", timeout=10000)
            await page.wait_for_timeout(3000)
            print("Successfully loaded.")
        except Exception as e:
            print(f"Failed to load page: {e}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
