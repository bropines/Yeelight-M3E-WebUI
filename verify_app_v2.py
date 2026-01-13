import os
from playwright.sync_api import sync_playwright, expect

if not os.path.exists("/home/jules/verification"):
    os.makedirs("/home/jules/verification")

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173")

        # Verify title or header
        expect(page.get_by_text("Yeelight")).to_be_visible(timeout=10000)

        # Screenshot Home
        page.screenshot(path="/home/jules/verification/home_v2.png")

        # Navigate to Temp to check layout fixes
        temp_btn = page.get_by_text("Белый").first
        temp_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/temp_v2.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
