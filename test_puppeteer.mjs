import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/api-docs', { waitUntil: 'networkidle0' });
  const styles = await page.evaluate(() => {
    const el = document.querySelector('.faq-item');
    if (!el) return 'Element not found';
    return {
      className: el.className,
      display: window.getComputedStyle(el).display,
      border: window.getComputedStyle(el).border,
      margin: window.getComputedStyle(el).margin
    };
  });
  console.log(styles);
  await browser.close();
})();
