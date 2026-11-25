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
    await page.setViewportSize({width:1920,height:1080});
    assert.equal(await page.locator('#site-wrapper').evaluate(e=>Math.abs(e.getBoundingClientRect().width-document.documentElement.clientWidth)<=1),true);
    const spacing = await page.evaluate(()=>{
      const wrapper = document.querySelector('#site-wrapper');
      const header = document.querySelector('.header-inner');
      const shell = document.querySelector('.page-shell');
      const inset = parseFloat(getComputedStyle(wrapper).paddingLeft);
      const aligned = Math.abs(header.getBoundingClientRect().left-shell.getBoundingClientRect().left)<=1 &&
        Math.abs(shell.getBoundingClientRect().left-inset)<=1 &&
        Math.abs(header.getBoundingClientRect().right-shell.getBoundingClientRect().right)<=1;
      const unpadded = [header,shell,...shell.children].every(el=>parseFloat(getComputedStyle(el).paddingLeft)===0 && parseFloat(getComputedStyle(el).paddingRight)===0);
      return aligned && unpadded && inset>0;
    });
    assert.equal(spacing,true);
    assert.equal(await page.locator('#article').evaluate(e=>e.clientWidth>1100),true);
    await page.setViewportSize({width:1440,height:900});
    assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(30, 30, 46)');
    assert.equal(await page.locator('#article h1').evaluate(e=>getComputedStyle(e).color),'rgb(166, 227, 161)');
    assert.equal(await page.locator('#page-filter').evaluate(e=>getComputedStyle(e).borderTopLeftRadius),'8px');
    assert.equal(await page.locator('.marquee-group').count(),2);
    assert.equal(await page.locator('.marquee-track').evaluate(e=>getComputedStyle(e).animationName),'marquee-scroll');
    await page.route('https://raw.githubusercontent.com/NamTheDev/profile/main/data/catalogue.json', route => route.abort());
    // Test fixtures only; never published as the artist's releases.
    const players = [
      {title:'Album fixture',src:'https://bandcamp.com/EmbeddedPlayer/album=12345/size=small/'},
      {title:'Track fixture',src:'https://bandcamp.com/EmbeddedPlayer/track=67890/size=small/'},
      {title:'Duplicate fixture',src:'https://bandcamp.com/EmbeddedPlayer/album=12345/size=large/'},
      {title:'Invalid fixture',src:'https://example.com/EmbeddedPlayer/album=12345/size=small/'}
    ];
    await page.route('**/data/bandcamp.json',route=>route.fulfill({json:{players}}));
    await page.route('https://bandcamp.com/EmbeddedPlayer/**',route=>route.fulfill({contentType:'text/html',body:'<html><body>Player test fixture</body></html>'}));
    await page.locator('#page-nav a').filter({hasText:'Projects'}).click();
    await page.locator('#article h1').filter({hasText:'Projects'}).waitFor();
    assert.equal(await page.locator('#site-wrapper').evaluate(e=>Math.abs(e.getBoundingClientRect().width-document.documentElement.clientWidth)<=1),true);
    await page.locator('#article .card').first().waitFor();
    const bandcamp = page.locator('section[aria-label="Bandcamp players"]');
    await bandcamp.waitFor();
    assert.equal(await bandcamp.locator('iframe').count(),2);
    assert.deepEqual(await bandcamp.locator('iframe').evaluateAll(frames=>frames.map(frame=>frame.getAttribute('src'))),[
      'https://bandcamp.com/EmbeddedPlayer/album=12345/size=small/bgcol=333333/linkcol=89b4fa/transparent=true/',
      'https://bandcamp.com/EmbeddedPlayer/track=67890/size=small/bgcol=333333/linkcol=89b4fa/transparent=true/'
    ]);
    assert.equal(await bandcamp.locator('iframe').first().getAttribute('height'),'42');
    assert.equal(await page.locator('#article iframe:not([src^="https://bandcamp.com/EmbeddedPlayer/"])').count(),0);
    assert.equal(await page.locator('#article .card').count(), 10);
    assert.equal(await page.locator('#article .card a[href$="/releases"]').count(), 0);
    for (const card of await page.locator('#article .card').all()) {
      assert.equal(await card.evaluate(e=>e.classList.contains('w-fit')), true);
      assert.equal(await card.evaluate(e=>getComputedStyle(e).backgroundColor), 'rgb(24, 24, 37)');
      assert.equal(await card.evaluate(e=>e.getBoundingClientRect().width < e.parentElement.clientWidth), true);
    }
    assert.equal(await page.locator('#article a[href="https://github.com/NamTheDev/keep/stargazers"]').count(), 1);
    const previews = page.locator('#article .card a > img[src^="https://opengraph.githubassets.com/1/NamTheDev/"]');
    assert.equal(await previews.count(), 10);
    for (const image of await previews.all()) {
      assert.equal(await image.getAttribute('width'), '320');
      assert.equal(await image.evaluate(e=>e.classList.contains('img-fluid')), true);
      assert.equal(await image.getAttribute('loading'), 'lazy');
      assert.equal(await image.locator('..').getAttribute('href'), (await image.getAttribute('src')).replace('https://opengraph.githubassets.com/1/', 'https://github.com/'));
    }
    const catalogue = JSON.parse(await fs.readFile('data/catalogue.json','utf8'));
    for (const channel of catalogue.channels) {
      for (const video of channel.videos) {
        const row = page.locator('#article a[href="https://www.youtube.com/watch?v=' + video.id + '"]');
        assert.ok(await row.count() >= 1);
        assert.equal(await row.first().locator('img').getAttribute('src'), 'https://i.ytimg.com/vi/' + video.id + '/mqdefault.jpg');
      }
    }
    assert.equal(await page.locator('#article a[href*="sub_confirmation"]').count(), 0);
    assert.equal(await page.locator('#article details iframe').count(), 0);
    assert.equal(await page.locator('#article iframe[src*="facebook.com"]').count(), 0);
    assert.equal(await page.locator('#article a[href="https://www.facebook.com/namrythmical"]').count(), 1);
    for (const name of ['keep','clipboard']) {
      assert.equal(await page.locator('#article iframe[src="https://namthedev.github.io/' + name + '/"]').count(), 0);
      assert.equal(await page.locator('#article a[href="https://namthedev.github.io/' + name + '/"]').count(), 1);
    }
    await page.locator('#toc > ul > li').first().waitFor();
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
    for (const card of await page.locator('#article .card').all()) {
      assert.equal(await card.evaluate(e=>e.getBoundingClientRect().width <= e.parentElement.clientWidth + 1), true);
      assert.equal(await card.evaluate(e=>e.scrollWidth <= e.clientWidth + 1), true);
    }
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
