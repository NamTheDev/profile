const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

test('profile preserves its layout, content and ticker using Bootstrap', async () => {
  const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.md':'text/plain', '.png':'image/png', '.jpg':'image/jpeg', '.xml':'application/xml' };
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
    assert.equal(await page.title(), 'Nam — Personal Archive');
    assert.equal(await page.locator('head meta[name="description"]').getAttribute('content'), 'A personal archive of Nam.');
    assert.equal(await page.locator('head meta[name="author"]').getAttribute('content'), 'namchill235');
    assert.equal(await page.locator('head meta[name="theme-color"]').getAttribute('content'), '#1e1e2e');
    assert.equal(await page.locator('head link[rel="canonical"]').getAttribute('href'), 'https://namthedev.github.io/profile/');
    for (const [property, value] of Object.entries({
      'og:title':'Nam — Personal Archive', 'og:description':'A personal archive of Nam.',
      'og:type':'profile', 'og:site_name':'Personal Archive', 'og:url':'https://namthedev.github.io/profile/', 'og:locale':'en_US',
      'og:image':'https://namthedev.github.io/profile/assets/social-preview.jpg', 'og:image:type':'image/jpeg',
      'og:image:width':'1200', 'og:image:height':'630', 'og:image:alt':'Purple stylized Nam wordmark on a dark background.'
    })) {
      const meta = page.locator('head meta[property="' + property + '"]');
      assert.equal(await meta.count(), 1);
      assert.equal(await meta.getAttribute('content'), value);
    }
    assert.equal(await page.locator('head meta[name="twitter:card"]').getAttribute('content'), 'summary_large_image');
    const structured = JSON.parse(await page.locator('head script[type="application/ld+json"]').textContent());
    assert.deepEqual(structured['@graph'].map(node=>node['@type']), ['WebSite','ProfilePage','Person']);
    assert.equal(structured['@graph'][1].mainEntity['@id'], structured['@graph'][2]['@id']);
    const bannerDimensions = await page.evaluate(async () => {
      const banner = new Image();
      banner.src = 'assets/social-preview.jpg';
      await banner.decode();
      return [banner.naturalWidth, banner.naturalHeight];
    });
    assert.deepEqual(bannerDimensions, [1200,630]);
    const sitemap = await page.request.get('http://127.0.0.1:' + server.address().port + '/sitemap.xml');
    assert.ok(sitemap.ok());
    assert.ok((await sitemap.text()).includes('<loc>https://namthedev.github.io/profile/</loc>'));
    const favicon = page.locator('head link[rel="icon"]');
    assert.equal(await favicon.getAttribute('href'), 'assets/icon.png');
    assert.equal((await page.request.get('http://127.0.0.1:' + server.address().port + '/assets/icon.png')).ok(), true);
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
    assert.equal(await page.locator('#page-filter').count(),0);
    assert.equal(await page.locator('.site-brand').evaluate(e=>e.tagName),'DIV');
    assert.equal(await page.locator('.site-brand a, a.site-brand').count(),0);
    const ticker = page.locator('.header-links');
    const original = ticker.locator('.marquee-group:not([aria-hidden])');
    const tickerLinks = original.locator('a');
    assert.equal(await tickerLinks.count(),12);
    for (const link of await tickerLinks.all()) {
      assert.equal(await link.evaluate(e=>e.childNodes.length===1 && e.firstChild.nodeType===Node.TEXT_NODE && e.textContent.includes(' - ')),true);
      assert.equal(await link.evaluate(e=>getComputedStyle(e).display.includes('flex')),false);
    }
    for (const width of [1440,1920,2560,390]) {
      await page.setViewportSize({width,height:900});
      await page.mouse.move(0,899);
      await page.waitForFunction(()=>{
        const n=document.querySelector('.header-links'), w=n.querySelector('.marquee-group:not([aria-hidden])').getBoundingClientRect().width;
        return n.scrollWidth-n.clientWidth>=2*w-2;
      });
      const geometry=await ticker.evaluate(n=>{
        const g=n.querySelector('.marquee-group:not([aria-hidden])'), items=[...g.children];
        return {gap:Math.min(...items.slice(1).map((item,i)=>item.getBoundingClientRect().left-items[i].getBoundingClientRect().right)),
          padding:parseFloat(getComputedStyle(g).paddingRight), clipped:n.getBoundingClientRect().right<=innerWidth,
          overflowX:getComputedStyle(n).overflowX, overflowY:getComputedStyle(n).overflowY, scrollbar:getComputedStyle(n).scrollbarWidth};
      });
      assert.ok(geometry.gap>=8 && geometry.padding>=8 && geometry.clipped);
      assert.equal(geometry.overflowX,'auto');
      assert.equal(geometry.overflowY,'hidden');
      assert.equal(geometry.scrollbar,'none');
      const before=await ticker.evaluate(n=>({x:n.scrollLeft,w:n.querySelector('.marquee-group:not([aria-hidden])').getBoundingClientRect().width}));
      await page.waitForFunction(({x,w})=>((document.querySelector('.header-links').scrollLeft-x)%w+w)%w>12,before,{timeout:4000});
    }
    await page.setViewportSize({width:1440,height:900});
    await ticker.hover();
    const cycle=await ticker.evaluate(n=>n.querySelector('.marquee-group:not([aria-hidden])').getBoundingClientRect().width);
    await ticker.evaluate((n,w)=>{n.scrollLeft=w+12;},cycle);
    const initial=await ticker.evaluate(n=>n.scrollLeft);
    const pagePosition=await page.evaluate(()=>window.scrollY);
    await page.mouse.wheel(0,240);
    await page.waitForTimeout(150);
    assert.equal(await ticker.evaluate(n=>n.scrollLeft),initial);
    assert.equal(await page.evaluate(()=>window.scrollY),pagePosition);
    for(const delta of [-40,Math.round(cycle*3+75),-Math.round(cycle*4+100),120]){
      const before=await ticker.evaluate(n=>n.scrollLeft);
      await page.mouse.wheel(delta,0);
      await page.waitForFunction(({before,delta,w})=>{
        const n=document.querySelector('.header-links'), mod=x=>((x%w)+w)%w;
        return Math.min(mod(n.scrollLeft-before-delta),mod(before+delta-n.scrollLeft))<3 &&
          n.scrollLeft>=w-2 && n.scrollLeft<2*w+2;
      },{before,delta,w:cycle});
      assert.ok(Math.abs(await ticker.evaluate(n=>n.scrollLeft)-before)>5);
    }
    const held=await ticker.evaluate(n=>n.scrollLeft);
    await page.waitForTimeout(300);
    assert.equal(await ticker.evaluate(n=>n.scrollLeft),held);
    for(const side of ['start','end']){
      await ticker.evaluate((n,s)=>{n.scrollLeft=s==='start'?0:n.scrollWidth-n.clientWidth;},side);
      await page.waitForFunction(w=>{
        const x=document.querySelector('.header-links').scrollLeft;
        return x>=w-2 && x<2*w+2;
      },cycle);
    }
    await page.mouse.move(0,899);
    const resumed=await ticker.evaluate(n=>n.scrollLeft);
    await page.waitForFunction(({x,w})=>((document.querySelector('.header-links').scrollLeft-x)%w+w)%w>12,{x:resumed,w:cycle},{timeout:3000});
    await page.route('https://raw.githubusercontent.com/NamTheDev/profile/main/data/catalogue.json', route => route.abort());
    await page.route('https://bandcamp.com/EmbeddedPlayer/**',route=>route.fulfill({contentType:'text/html',body:'<html><body>Bandcamp player test fixture</body></html>'}));
    await page.locator('#page-nav a').filter({hasText:'Projects'}).click();
    await page.locator('#article h1').filter({hasText:'Projects'}).waitFor();
    assert.equal(await page.locator('#site-wrapper').evaluate(e=>Math.abs(e.getBoundingClientRect().width-document.documentElement.clientWidth)<=1),true);
    await page.locator('#article .card').first().waitFor();
    const bandcamp = page.locator('section[aria-label="Bandcamp releases"]');
    await bandcamp.waitFor();
    assert.equal(await bandcamp.locator('iframe').count(),2);
    assert.deepEqual(await bandcamp.locator('iframe').evaluateAll(frames=>frames.map(frame=>frame.getAttribute('src'))),[
      'https://bandcamp.com/EmbeddedPlayer/track=3801929766/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/artwork=small/transparent=true/',
      'https://bandcamp.com/EmbeddedPlayer/track=4198918332/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/artwork=small/transparent=true/'
    ]);
    assert.deepEqual(await bandcamp.locator('iframe').evaluateAll(frames=>frames.map(frame=>[frame.width,frame.height,frame.loading])),[['640','120','lazy'],['640','120','lazy']]);
    assert.equal(await page.locator('#article iframe:not([src^="https://bandcamp.com/EmbeddedPlayer/"])').count(),0);
    assert.equal(await page.locator('#article a[href="https://namchill235.bandcamp.com"]').count(), 1);
    const catalogue = JSON.parse(await fs.readFile('data/catalogue.json','utf8'));
    const library = page.locator('.repository-library');
    assert.equal(await library.count(), 1);
    assert.equal(await library.locator('input, button, [role="status"]').count(), 0);
    const activeRepos = catalogue.repositories.filter(repo=>!repo.archived);
    assert.equal(await library.locator('.repository-card').count(), activeRepos.length);
    assert.equal(await library.locator('.repository-grid').count(), 1);
    assert.equal(await library.locator('h3, .repository-archive-badge').count(), 0);
    for (const repo of catalogue.repositories) {
      const card = library.locator('.repository-card[id="' + repo.name.toLowerCase() + '"]');
      assert.equal(await card.count(), repo.archived ? 0 : 1);
      if (!repo.archived) assert.equal(await card.isVisible(), true);
      else assert.equal(await page.locator('.header-links a[href="https://github.com/NamTheDev/' + repo.name + '"]').count(), 0);
    }
    assert.equal(await page.locator('#article .card a[href$="/releases"]').count(), 0);
    for (const card of await page.locator('#article .card').all()) {
      assert.equal(await card.evaluate(e=>e.classList.contains('repository-card')), true);
      assert.equal(await card.evaluate(e=>getComputedStyle(e).backgroundColor), 'rgb(24, 24, 37)');
      assert.equal(await card.evaluate(e=>e.getBoundingClientRect().width <= e.parentElement.clientWidth + 1), true);
    }
    assert.equal(await page.locator('#article a[href="https://github.com/NamTheDev/keep/stargazers"]').count(), 1);
    const previews = page.locator('#article .card a > img[src^="https://opengraph.githubassets.com/1/NamTheDev/"]');
    assert.equal(await previews.count(), activeRepos.length);
    for (const image of await previews.all()) {
      assert.equal(await image.getAttribute('width'), '320');
      assert.equal(await image.evaluate(e=>e.classList.contains('img-fluid')), true);
      assert.equal(await image.getAttribute('loading'), 'lazy');
      assert.equal(await image.locator('..').getAttribute('href'), (await image.getAttribute('src')).replace('https://opengraph.githubassets.com/1/', 'https://github.com/'));
    }
    for (const channel of catalogue.channels) {
      for (const video of channel.videos) {
        const row = page.locator('#article a[href="https://www.youtube.com/watch?v=' + video.id + '"]');
        assert.ok(await row.count() >= 1);
        assert.equal(await row.first().locator('img').getAttribute('src'), 'https://i.ytimg.com/vi/' + video.id + '/mqdefault.jpg');
        assert.equal(await row.first().locator('img').getAttribute('width'), '304');
        assert.equal(await row.first().locator('img').getAttribute('height'), '171');
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
    assert.equal(await sections.count(), 2);
    const sectionLinks = sections.locator(':scope > details > summary > a, :scope > a');
    assert.deepEqual(await sectionLinks.allTextContents(), ['Creative works', 'GitHub Repositories']);
    const headingColor = await page.locator('#article h1').evaluate(e=>getComputedStyle(e).color);
    for (const link of await sectionLinks.all()) {
      assert.equal(await link.evaluate(e=>getComputedStyle(e).color), headingColor);
    }
    const repoLink = sections.nth(1).locator(':scope > a');
    assert.equal(await sections.nth(1).locator('details').count(), 0);
    await repoLink.click();
    assert.equal(new URL(page.url()).hash, '#repositories');
    await page.locator('#article h2#repositories').waitFor();
    assert.equal(await page.locator('#article .repository-card').count(), activeRepos.length);
    await page.goto('http://127.0.0.1:' + server.address().port + '/?page=projects#keep');
    await page.locator('.repository-card#keep').waitFor();
    assert.equal(await page.locator('.repository-card#keep').isVisible(), true);
    await page.setViewportSize({width:390,height:844});
    for (const frame of await bandcamp.locator('iframe').all()) assert.equal(await frame.evaluate(e=>e.getBoundingClientRect().width<=e.parentElement.clientWidth+1),true);
    for (const image of await page.locator('.upload-thumbnail').all()) {
      assert.equal(await image.evaluate(e=>e.getBoundingClientRect().width <= e.parentElement.clientWidth * .48 + 1), true);
      assert.equal(await image.evaluate(e=>e.parentElement.scrollWidth <= e.parentElement.clientWidth + 1), true);
    }
    for (const card of await page.locator('#article .card').all()) {
      assert.equal(await card.evaluate(e=>e.getBoundingClientRect().width <= e.parentElement.clientWidth + 1), true);
      assert.equal(await card.evaluate(e=>e.scrollWidth <= e.clientWidth + 1), true);
    }
    for (const grid of await library.locator('.repository-grid').all()) {
      assert.equal(await grid.evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length), 1);
    }
    const mobileContents = page.locator('.mobile-contents');
    await mobileContents.waitFor();
    assert.equal(await page.locator('#toc').isVisible(), false);
    await mobileContents.locator(':scope > summary').click();
    assert.equal(await mobileContents.locator('nav > ul > li').count(), 2);
    const mobileRepo = mobileContents.locator('nav > ul > li').nth(1);
    assert.equal(await mobileRepo.locator('details').count(), 0);
    assert.equal(await mobileRepo.locator('a').textContent(), 'GitHub Repositories');
    await page.locator('#menu-toggle').click();
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
    await page.locator('#page-nav a').first().click();
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(100);
    const still=await ticker.evaluate(n=>n.scrollLeft);
    await page.waitForTimeout(250);
    assert.equal(await ticker.evaluate(n=>n.scrollLeft),still);
    await ticker.hover();
    await page.mouse.wheel(-70,0);
    await page.waitForFunction(x=>Math.abs(document.querySelector('.header-links').scrollLeft-x)>10,still);
    assert.equal(await ticker.locator('.marquee-group[aria-hidden="true"] a:not([tabindex="-1"])').count(),0);
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
