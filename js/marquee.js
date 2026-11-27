/* Loop a native horizontal scroller in both directions, with one accessible group. */
(() => {
  const nav = document.querySelector(".header-links");
  if (!nav || nav.querySelector(".marquee-track")) return;
  const make = classes => Object.assign(document.createElement("div"), {className:classes});
  const track = make("marquee-track d-flex align-items-center flex-shrink-0");
  const group = make("marquee-group d-flex align-items-center flex-shrink-0 gap-5 pe-5");
  group.append(...nav.childNodes);
  track.append(group);
  nav.append(track);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let cycle = 0, expected = 0, pauseUntil = 0, pointer = null, last = 0, fraction = 0, hovered = false;
  const pause = () => { pauseUntil = performance.now() + 1500; };
  const set = x => { nav.scrollTo({left:x, behavior:"instant"}); expected = nav.scrollLeft; };
  const wrap = x => cycle + ((x % cycle) + cycle) % cycle;
  const clone = () => {
    const copy = group.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("a,button,[tabindex]").forEach(el=>el.tabIndex=-1);
    return copy;
  };

  function measure() {
    const width = group.getBoundingClientRect().width;
    if (!width || !nav.clientWidth) return;
    const phase = cycle ? ((nav.scrollLeft % cycle) + cycle) % cycle / cycle : 0;
    cycle = width;
    // Original group sits between buffers. Maintain room for the viewport and
    // a full extra cycle on either side, including when the viewport is wider.
    if (track.firstElementChild === group) track.prepend(clone());
    const count = Math.ceil(nav.clientWidth / cycle) + 3;
    while (track.childElementCount < count) track.append(clone());
    while (track.childElementCount > count) track.lastElementChild.remove();
    nav.classList.add("marquee-overflow");
    set(cycle + phase * cycle);
  }
  const observer = new ResizeObserver(measure);
  observer.observe(nav);
  observer.observe(group);
  measure();

  nav.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (!cycle || !event.deltaX || Math.abs(event.deltaY)>Math.abs(event.deltaX)) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? nav.clientWidth : 1;
    pause();
    set(wrap(nav.scrollLeft + event.deltaX * unit));
  }, {passive:false});
  nav.addEventListener("scroll", () => {
    if (!cycle || Math.abs(nav.scrollLeft-expected)<.5) return;
    if (pointer !== null || performance.now() < pauseUntil) pause();
    // Native touch, keyboard and scrollbar input can also cross the physical
    // ends. Recenter only near those ends, not during ordinary momentum.
    const x = nav.scrollLeft, max = nav.scrollWidth-nav.clientWidth;
    if (!nav.querySelector(":focus-visible") && (x<cycle/2 || x>max-cycle/2)) set(wrap(x));
  }, {passive:true});
  nav.addEventListener("pointerdown", event=>{pointer=event.pointerId; pause();});
  const release = event=>{if(event.pointerId===pointer){pointer=null; pause();}};
  window.addEventListener("pointerup",release);
  window.addEventListener("pointercancel",release);
  const trackHover = event => { hovered = event.pointerType === "mouse" || (event.pointerType === "pen" && event.buttons === 0); };
  nav.addEventListener("pointerenter", trackHover);
  nav.addEventListener("pointermove", trackHover);
  nav.addEventListener("pointerleave", event => {
    hovered = false;
    if (event.pointerType !== "touch") pauseUntil = 0;
  });
  window.addEventListener("blur", () => { hovered = false; pointer = null; pauseUntil = 0; });

  function advance(now) {
    const elapsed = last ? Math.min(now-last,50) : 0;
    last = now;
    if (!cycle || reduced.matches || pointer!==null || now<pauseUntil ||
        hovered || (nav.contains(document.activeElement) && document.activeElement.matches(":focus-visible"))) fraction=0;
    else {
      const distance = elapsed*.045+fraction, step = Math.floor(distance);
      fraction=distance-step;
      if(step) set(wrap(nav.scrollLeft+step));
    }
    requestAnimationFrame(advance);
  }
  requestAnimationFrame(advance);
})();
