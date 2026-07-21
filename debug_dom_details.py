import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto("http://localhost:3030/admin.html")
        await page.wait_for_timeout(2000)
        
        # Get coordinates of elements
        header_box = await page.locator("header").bounding_box()
        main_box = await page.locator("main").bounding_box()
        canvas_box = await page.locator("#confetti-canvas").bounding_box()
        
        print(f"Confetti Canvas box: {canvas_box}")
        print(f"Header box: {header_box}")
        print(f"Main box: {main_box}")
        
        # Get active styles of header and main
        header_style = await page.evaluate("const el = document.querySelector('header'); const s = window.getComputedStyle(el); return { display: s.display, opacity: s.opacity, visibility: s.visibility, height: s.height, width: s.width };")
        main_style = await page.evaluate("const el = document.querySelector('main'); const s = window.getComputedStyle(el); return { display: s.display, opacity: s.opacity, visibility: s.visibility, height: s.height, width: s.width };")
        
        print(f"Header styles: {header_style}")
        print(f"Main styles: {main_style}")
        
        # Check for Javascript errors on the page
        logs = []
        page.on("console", lambda msg: logs.append(msg.text))
        await page.reload()
        await page.wait_for_timeout(1000)
        print(f"Console logs on reload: {logs}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
