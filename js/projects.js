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
    const outer = element("div", "card repository-card w-100 min-w-0 bg-1 rounded-6");
    const body = element("div", "card-body min-w-0 d-flex flex-column gap-3");
    outer.append(body);
    return [outer, body];
  }
  function repoCard(repo, description = []) {
    const [outer, body] = card();
    const url = "https://github.com/NamTheDev/" + repo.name;
    const title = element("div", "d-flex flex-wrap align-items-center gap-3");
    title.append(link(url, "NamTheDev/" + repo.name, "fw-semibold text-decoration-none text-break"));
    if (repo.archived) title.append(element("span", "badge repository-archive-badge", "Archived"));
    body.append(title);
    const preview = link(url, null, "repo-preview d-block align-self-start max-w-100");
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
    if (description.length) {
      const details = element("details", "fs-sm");
      details.append(element("summary", "fg-2", "Description"), ...description);
      body.append(details);
    }
    outer.id = repo.name.toLowerCase();
    return outer;
  }
  // Keep the Markdown descriptions and historical anchor IDs while presenting one library.
  let revealRepositoryHash = null;
  function repositoryLibrary(article, metadata) {
    const software = article.querySelector("#software");
    const archive = article.querySelector("#archived-projects");
    if (!software || !archive) return;
    const descriptions = new Map();
    const oldNodes = [];
    for (const [heading, archived] of [[software, false], [archive, true]]) {
      oldNodes.push(heading);
      let current = null;
      for (let node = heading.nextElementSibling; node && node.tagName !== "H2"; node = node.nextElementSibling) {
        oldNodes.push(node);
        if (node.tagName === "H3") {
          current = {name: node.textContent.trim(), archived, nodes: []};
          descriptions.set(node.id, current);
        } else if (current) current.nodes.push(node);
      }
    }

    const repos = metadata.filter(repo => typeof repo.name === "string" && validRepo(repo.name));
    const known = new Set(repos.map(repo => repo.name.toLowerCase()));
    // If metadata is incomplete, preserve the existing documented projects without invented stats.
    for (const [id, description] of descriptions) {
      if (!known.has(id) && validRepo(description.name)) {
        repos.push({name: description.name, archived: description.archived});
      }
    }
    const heading = element("h2", null, "Repositories");
    heading.id = "repositories";
    const softwareAlias = element("span", "repository-alias");
    softwareAlias.id = "software";
    heading.append(softwareAlias);
    const library = element("section", "repository-library my-4");
    library.setAttribute("aria-labelledby", heading.id);
    const controls = element("div", "d-flex flex-column gap-3 mb-4");
    const search = element("input", "form-control rounded-5 w-100");
    search.type = "search";
    search.placeholder = "Search repositories...";
    search.setAttribute("aria-label", "Search repositories");
    const filters = element("div", "d-flex flex-wrap gap-2");
    filters.setAttribute("role", "group");
    filters.setAttribute("aria-label", "Repository category");
    const count = element("div", "fg-3 fs-xs");
    count.setAttribute("role", "status");
    controls.append(search, filters, count);
    library.append(controls);

    const sections = new Map();
    const cards = [];
    for (const [key, label] of [["active", "Active"], ["archived", "Archived"]]) {
      const section = element("section", "mb-4");
      const title = element("h3", null, label);
      title.id = key;
      if (key === "archived") {
        const alias = element("span", "repository-alias");
        alias.id = "archived-projects";
        title.append(alias);
      }
      const grid = element("div", "repository-grid gap-3");
      section.append(title, grid);
      sections.set(key, section);
      library.append(section);
      for (const repo of repos.filter(repo => Boolean(repo.archived) === (key === "archived"))) {
        const description = descriptions.get(repo.name.toLowerCase())?.nodes || [];
        const card = repoCard(repo, description);
        grid.append(card);
        cards.push({key, card, name: repo.name.toLowerCase(), searchable: [repo.name, repo.language, ...description.map(node => node.textContent)].filter(Boolean).join(" ").toLowerCase()});
      }
    }
    const empty = element("p", "fg-3 fs-sm", "No matching repositories.");
    library.append(empty);
    let selected = "active";
    const buttons = new Map();
    for (const [key, label] of [["active", "Active"], ["archived", "Archived"], ["all", "All"]]) {
      const total = cards.filter(item => key === "all" || item.key === key).length;
      const button = element("button", "btn btn-outline theme-secondary repository-filter", label + " (" + total + ")");
      button.type = "button";
      button.addEventListener("click", () => { selected = key; render(); });
      buttons.set(key, button);
      filters.append(button);
    }
    function render() {
      const query = search.value.trim().toLowerCase();
      let shown = 0;
      for (const [key, button] of buttons) button.setAttribute("aria-pressed", String(key === selected));
      for (const item of cards) {
        item.card.hidden = !(selected === "all" || item.key === selected) || !item.searchable.includes(query);
        if (!item.card.hidden) shown++;
      }
      for (const [key, section] of sections) section.hidden = !cards.some(item => item.key === key && !item.card.hidden);
      empty.hidden = shown > 0;
      count.textContent = shown + " of " + cards.length + " repositories";
    }
    search.addEventListener("input", render);
    software.before(heading, library);
    // Descriptions have moved into cards; remove only the original section-level nodes.
    for (const node of oldNodes) if (node.parentNode === article) node.remove();
    revealRepositoryHash = id => {
      if (!library.isConnected) return false;
      const item = cards.find(card => card.name === id);
      const key = id === "archived-projects" || id === "archived" ? "archived" : id === "active" || id === "software" ? "active" : item?.key;
      if (!key) return false;
      if (selected !== "all" || id === "active" || id === "archived") selected = key;
      search.value = "";
      render();
      return true;
    };
    render();
    try { revealRepositoryHash(decodeURIComponent(location.hash.slice(1))); } catch {}
  }
  // Reveal hidden categories before navigating from the contents rail or an old deep link.
  document.addEventListener("click", event => {
    const anchor = event.target.closest?.(".toc a, .mobile-contents a");
    const hash = anchor?.getAttribute("href");
    if (hash?.startsWith("#")) {
      try { revealRepositoryHash?.(decodeURIComponent(hash.slice(1))); } catch {}
    }
  });
  window.addEventListener("hashchange", () => {
    try {
      const id = decodeURIComponent(location.hash.slice(1));
      if (revealRepositoryHash?.(id)) document.getElementById(id)?.scrollIntoView();
    } catch {}
  });
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
  // Official player IDs supplied by the artist, in display order.
  const bandcampTracks = [
    {id:"3801929766", title:"May The War End"},
    {id:"4198918332", title:"My Time"}
  ];
  function bandcampPlayers() {
    const group = element("section","my-4");
    group.setAttribute("aria-label","Bandcamp releases");
    group.append(element("p","fw-semibold mb-3","Bandcamp releases"));
    const list = element("div","d-flex flex-column gap-3");
    for (const track of bandcampTracks) {
      const frame = element("iframe","d-block border-0 max-w-100");
      frame.src = "https://bandcamp.com/EmbeddedPlayer/track=" + track.id + "/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/artwork=small/transparent=true/";
      frame.title = track.title + " by Nam — Bandcamp player";
      frame.width = "500";
      frame.height = "120";
      frame.loading = "lazy";
      list.append(frame);
    }
    group.append(list);
    return group;
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
    afterSection(article,"music",bandcampPlayers());
    try {
      const data=await readCatalogue();
      if (!article.contains(marker)) return;
      repositoryLibrary(article, data.repositories || []);
      for (const channel of data.channels || []) if(validChannel(channel.id)&&/^[a-z-]+$/.test(channel.section)) afterSection(article,channel.section,channelUploads(channel));
    } catch(error) { console.warn("Project catalogue unavailable",error); }
    finally { marker.remove(); }
  };
})();
