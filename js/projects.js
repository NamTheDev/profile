/* Project catalogue: public metadata and native Bootstrap components. */
(function () {
  const validChannel = id => /^UC[\w-]{22}$/.test(id);
  const validVideo = id => /^[\w-]{11}$/.test(id);
  const validRepo = name => /^[\w.-]+$/.test(name);
  function element(tag, classes, text) {
    const node = document.createElement(tag);
    if (classes) node.className = classes;
    if (text != null) node.textContent = text;
    return node;
  }
  function link(url, text, classes) {
    const node = element("a", classes, text);
    node.href = url;
    return node;
  }
  function afterSection(article, id, node) {
    const heading = article.querySelector("#" + CSS.escape(id));
    if (!heading) return;
    let last = heading;
    while (last.nextElementSibling && !/^H[1-3]$/.test(last.nextElementSibling.tagName)) last = last.nextElementSibling;
    last.after(node);
  }
  function card() {
    const outer = element("div", "card w-fit max-w-100 bg-1 rounded-6 my-4");
    const body = element("div", "card-body min-w-0 d-flex flex-column gap-3");
    outer.append(body);
    return [outer, body];
  }
  function repoCard(repo) {
    const [outer, body] = card();
    const url = "https://github.com/NamTheDev/" + repo.name;
    const title = element("div", "d-flex flex-wrap align-items-center gap-3");
    title.append(link(url, "NamTheDev/" + repo.name, "fw-semibold text-decoration-none text-break"));
    if (repo.archived) title.append(element("span", "badge theme-secondary", "Archived"));
    body.append(title);
    const preview = link(url, null, "d-block align-self-start max-w-100");
    const image = element("img", "img-fluid rounded-3 d-block");
    image.src = "https://opengraph.githubassets.com/1/NamTheDev/" + repo.name;
    image.alt = repo.name + " — GitHub repository preview";
    image.width = 320;
    image.loading = "lazy";
    preview.append(image);
    body.append(preview);
    const stats = element("div", "d-flex flex-wrap gap-4 fs-sm");
    if (repo.language) stats.append(element("span", "fg-2", repo.language));
    if (repo.license && repo.license !== "NOASSERTION") stats.append(link(url + "/blob/main/LICENSE", repo.license));
    for (const [label, key, path] of [["Stars","stars","stargazers"],["Forks","forks","forks"],["Open issues","issues","issues"]]) {
      if (Number.isInteger(repo[key]) && repo[key] >= 0) stats.append(link(url + "/" + path, label + ": " + repo[key]));
    }
    body.append(stats);
    if (repo.updated) body.append(element("div","fg-3 fs-xs","Last pushed: " + repo.updated));
    const nav = element("div","d-flex flex-wrap gap-4 fs-sm");
    for (const [label, path] of [["Code",""],["Commits","/commits/main/"]]) nav.append(link(url+path,label));
    body.append(nav);
    return outer;
  }
  function channelUploads(channel) {
    const group=element("div","my-4");
    const videos=(channel.videos || []).filter(video=>validVideo(video.id));
    if (videos.length) {
      const list=element("div","d-flex flex-column gap-3");
      list.append(element("p","fw-semibold mb-0",(channel.section === "music" ? "YouTube uploads" : "Uploads")+" ("+videos.length+" listed)"));
      for (const video of videos) {
        const row=link("https://www.youtube.com/watch?v="+video.id,null,"d-flex align-items-start gap-3 text-decoration-none border-bottom pb-3");
        const image=element("img","img-fluid rounded-3 flex-shrink-0"); image.src="https://i.ytimg.com/vi/"+video.id+"/mqdefault.jpg"; image.alt=""; image.width=120; image.height=68; image.loading="lazy";
        const details=element("div","min-w-0 d-flex flex-column gap-1");
        details.append(element("span","fw-medium text-break",video.title || video.id));
        if (video.published) details.append(element("span","fg-3 fs-xs",video.published.slice(0,10)));
        row.append(image,details); list.append(row);
      }
      group.append(list);
    } else {
      group.append(link("https://www.youtube.com/channel/" + channel.id + "/videos", "View uploads on YouTube", "fs-sm"));
    }
    return group;
  }
  const bandcampHome = "https://namchill235.bandcamp.com/";
  function safeReleaseUrl(value) {
    try {
      const url = new URL(value);
      return url.origin === new URL(bandcampHome).origin && /^\/(album|track)\/[^/]+\/?$/.test(url.pathname) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }
  function safeArtwork(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && /^(?:[a-z0-9-]+\.)*bcbits\.com$/i.test(url.hostname) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }
  function bandcampReleases(data) {
    const group = element("section", "my-4");
    group.setAttribute("aria-label", "Bandcamp releases");
    const releases = Array.isArray(data?.releases) ? data.releases : [];
    const seen = new Set();
    const items = releases.filter(r => r && typeof r.title === "string" && r.title.trim() && safeReleaseUrl(r.url))
      .map(r => ({...r, url:safeReleaseUrl(r.url)}))
      .sort((a,b) => String(b.released || "").localeCompare(String(a.released || "")))
      .filter(r => { if(seen.has(r.url)) return false; seen.add(r.url); return true; });
    group.append(element("p","fw-semibold mb-3","Bandcamp releases"));
    const list = element("div","d-flex flex-column gap-3");
    for (const release of items) {
      const row = link(release.url,null,"d-flex align-items-center gap-3 text-decoration-none");
      const art = safeArtwork(release.artwork);
      if (art) {
        const image = element("img","img-fluid rounded-3 flex-shrink-0");
        image.src = art; image.alt = ""; image.width = 76; image.height = 76; image.loading = "lazy";
        row.append(image);
      }
      const details = element("div","min-w-0 d-flex flex-column gap-1");
      details.append(element("span","fw-medium text-break",release.title));
      const type = ["Album","EP","Single"].includes(release.type) ? release.type : "";
      const date = /^\d{4}-\d{2}-\d{2}$/.test(release.released || "") ? release.released : "";
      const metadata = [type,date].filter(Boolean).join(" · ");
      if (metadata) details.append(element("span","fg-3 fs-xs",metadata));
      row.append(details); list.append(row);
    }
    group.append(list,link(bandcampHome+"music","View all releases on Bandcamp","d-inline-block mt-3 fs-sm"));
    return group;
  }
  async function readBandcamp() {
    const read = async (url, options) => {
      const response = await fetch(url,options);
      if (!response.ok) throw Error("Bandcamp catalogue "+response.status);
      const data = await response.json();
      if (!Array.isArray(data.releases)) throw Error("Invalid Bandcamp catalogue");
      return data;
    };
    try {
      return await read("https://raw.githubusercontent.com/NamTheDev/profile/main/data/bandcamp.json",{cache:"no-cache",signal:AbortSignal.timeout(4000)});
    } catch {
      try { return await read("data/bandcamp.json"); }
      catch { return {releases:[]}; }
    }
  }
  async function readCatalogue() {
    const local=await fetch("data/catalogue.json").then(r=>{if(!r.ok)throw Error("Catalogue "+r.status);return r.json()});
    try {
      const response=await fetch("https://raw.githubusercontent.com/NamTheDev/profile/main/data/catalogue.json",{cache:"no-cache",signal:AbortSignal.timeout(4000)});
      if(response.ok) { const current=await response.json(); if(Array.isArray(current.channels)&&Array.isArray(current.repositories))return current; }
    } catch {}
    return local;
  }
  window.renderProjectCatalogue=async function(article) {
    const marker=document.createComment("project catalogue");
    article.append(marker);
    try {
      const bandcamp = readBandcamp().then(data => { if (article.contains(marker)) afterSection(article,"music",bandcampReleases(data)); });
      const data=await readCatalogue().catch(error => { console.warn("Project catalogue unavailable",error); return {repositories:[],channels:[]}; });
      await bandcamp;
      if (!article.contains(marker)) return;
      for (const repo of data.repositories || []) if(validRepo(repo.name)) afterSection(article,repo.name.toLowerCase(),repoCard(repo));
      for (const channel of data.channels || []) if(validChannel(channel.id)&&/^[a-z-]+$/.test(channel.section)) afterSection(article,channel.section,channelUploads(channel));
    } catch(error) { console.warn("Project catalogue unavailable",error); }
    finally { marker.remove(); }
  };
})();
