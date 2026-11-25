const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

test('profile preserves its layout, content and ticker using Bootstrap', async () => {
  const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.md':'text/plain' };
  const server = http.createServer(async (req,res) => {
    try {
      const pathname = new URL(req.url,'http://localhost').pathname;
      const file = path.resolve('.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(process.cwd() + path.sep)) { res.writeHead(403).end(); return; }
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({viewport:{width:1440,height:900}, serviceWorkers:'block'});
    await page.route('https://cdn.jsdelivr.net/**', async route => {
      const file = route.request().url().includes('/marked@') ? 'node_modules/marked/lib/marked.umd.js' : 'node_modules/dompurify/dist/purify.min.js';
      await route.fulfill({path:file,contentType:'application/javascript'});
    });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('#article h1').waitFor();
    assert.equal(await page.locator('head meta[name="color-scheme"]').count(),1);
    assert.equal(await page.locator('head meta[name="color-scheme"]').getAttribute('content'),'dark');
    assert.equal(await page.locator('html').getAttribute('data-bs-theme'),'dark');
    assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).colorScheme),'dark');
    assert.equal(await page.locator('meta[name="darkreader-lock"]').count(),0);
    assert.equal(await page.locator('.page-shell').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3);
    assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(30, 30, 46)');
    assert.equal(await page.locator('#article h1').evaluate(e=>getComputedStyle(e).color),'rgb(166, 227, 161)');
    assert.equal(await page.locator('#page-filter').evaluate(e=>getComputedStyle(e).borderTopLeftRadius),'8px');
    assert.equal(await page.locator('.marquee-group').count(),2);
    assert.equal(await page.locator('.marquee-track').evaluate(e=>getComputedStyle(e).animationName),'marquee-scroll');
    await page.route('https://namthedev.github.io/keep/', route => route.fulfill({body:'<html>Keep preview</html>', contentType:'text/html'}));
    await page.route('https://namthedev.github.io/clipboard/', route => route.fulfill({body:'<html>Clipboard preview</html>', contentType:'text/html'}));
    await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({body:'<html>YouTube player</html>', contentType:'text/html'}));
    await page.locator('#page-nav a').filter({hasText:'Projects'}).click();
    await page.locator('#article h1').filter({hasText:'Projects'}).waitFor();
    assert.equal(await page.locator('#article > iframe').count(), 5);
    for (const [section, playlist] of [["youtube","UUuBqPJLikRQ5ILmeGfouvGA"],["ashes","UU9aLhqg5hrEtU8m1ozH2eiQ"],["music","UUjO88kU2XujBoNmaB9dsVCA"]]) {
      const frame = page.locator('#article > iframe[src="https://www.youtube-nocookie.com/embed/videoseries?list=' + playlist + '"]');
      assert.equal(await frame.count(), 1);
      assert.equal(await frame.evaluate(e=>e.classList.contains('ratio-16x9')), true);
      assert.equal(await frame.getAttribute('loading'), 'lazy');
      assert.equal(await frame.evaluate(e=>e.allowFullscreen), true);
      assert.equal(await frame.evaluate(e=>{let node=e.previousElementSibling;while(node&&!/^H[1-3]$/.test(node.tagName))node=node.previousElementSibling;return node?.id}), section);
    }
    const repositoryCards = page.locator('#article a > img[src^="https://opengraph.githubassets.com/1/NamTheDev/"]');
    assert.equal(await repositoryCards.count(), 10);
    for (const card of await repositoryCards.all()) {
      assert.equal(await card.evaluate(e=>e.classList.contains('img-fluid')), true);
      const imageUrl = await card.getAttribute('src');
      assert.equal(await card.locator('..').getAttribute('href'), imageUrl.replace('https://opengraph.githubassets.com/1/', 'https://github.com/'));
    }
    assert.equal(await page.locator('#article details iframe').count(), 0);
    assert.equal(await page.locator('#article iframe[src*="facebook.com"]').count(), 0);
    assert.equal(await page.locator('#article a[href="https://www.facebook.com/namrythmical"]').count(), 1);
    for (const name of ['keep', 'clipboard']) {
      const frame = page.locator('#article > iframe[src="https://namthedev.github.io/' + name + '/"]');
      assert.equal(await frame.count(), 1);
      assert.equal(await frame.evaluate(e=>e.classList.contains('ratio-4x3')), true);
      assert.equal(await frame.getAttribute('loading'), 'lazy');
    }
    const sections = page.locator('#toc > ul > li');
    assert.equal(await sections.count(), 3);
    assert.deepEqual(await sections.locator(':scope > details > summary > a').allTextContents(),
      ['Creative works', 'Software', 'Archived projects']);
    const headingColor = await page.locator('#article h1').evaluate(e=>getComputedStyle(e).color);
    for (const link of await sections.locator(':scope > details > summary > a').all()) {
      assert.equal(await link.evaluate(e=>getComputedStyle(e).color), headingColor);
    }
    const software = sections.nth(1).locator('details').first();
    const summary = software.locator(':scope > summary');
    const children = software.locator(':scope > ul');
    assert.equal(await children.locator(':scope > li').count(), 6);
    assert.equal(await children.isVisible(), true);
    await summary.focus();
    await summary.press('Space');
    assert.equal(await software.evaluate(e=>e.open), false);
    assert.equal(await children.isVisible(), false);
    await summary.press('Space');
    assert.equal(await children.isVisible(), true);
    await children.getByRole('link', {name:'keep', exact:true}).click();
    assert.equal(new URL(page.url()).hash, '#keep');
    assert.equal(await page.locator('#article h3#keep').count(), 1);
    await page.setViewportSize({width:390,height:844});
    const mobileContents = page.locator('.mobile-contents');
    assert.equal(await page.locator('#toc').isVisible(), false);
    await mobileContents.locator(':scope > summary').click();
    assert.equal(await mobileContents.locator('nav > ul > li').count(), 3);
    const mobileChildren = mobileContents.locator('#mobile-toc-software');
    assert.equal(await mobileChildren.locator(':scope > li').count(), 6);
    const mobileSummary = mobileChildren.locator('..').locator(':scope > summary');
    await mobileSummary.focus();
    await mobileSummary.press('Space');
    assert.equal(await mobileChildren.isVisible(), false);
    await mobileSummary.press('Space');
    assert.equal(await mobileChildren.isVisible(), true);
    await page.locator('#menu-toggle').click();
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
    await page.locator('#page-nav a').first().click();
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.marquee-track').evaluate(e=>getComputedStyle(e).animationName),'none');
    assert.equal(await page.locator('.marquee-group[aria-hidden="true"]').isVisible(),false);
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
