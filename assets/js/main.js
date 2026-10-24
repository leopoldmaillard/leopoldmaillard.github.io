// Page behaviors: theme, nav, reveal-on-scroll, news, publication hover, BibTeX.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- Theme (light by default, remembered per visitor) ----------
  $("#theme-toggle")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---------- Nav: hairline + name once scrolled, active section ----------
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 140);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = new Map($$(".nav-links a").map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("is-active"));
      links.get(e.target.id)?.classList.add("is-active");
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  // ---------- News: show more ----------
  const news = $(".news");
  const moreBtn = $("#news-more");
  if (news && moreBtn) {
    const hidden = $$("li.is-hidden", news).length;
    const label = $("span", moreBtn);
    label.textContent = `Show ${hidden} more`;
    moreBtn.hidden = !hidden;
    moreBtn.addEventListener("click", () => {
      const open = news.classList.toggle("is-open");
      moreBtn.setAttribute("aria-expanded", open);
      label.textContent = open ? "Show less" : `Show ${hidden} more`;
    });
  }

  // ---------- Publication cards: light follows the pointer ----------
  // The glow lives in its own element; only that element is updated on mouse move.
  $$(".pub").forEach((card) => {
    const glow = document.createElement("span");
    glow.className = "pub-glow";
    glow.setAttribute("aria-hidden", "true");
    card.prepend(glow);
    let raf = 0;
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        glow.style.setProperty("--mx", `${e.clientX - r.left}px`);
        glow.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  });

  // ---------- BibTeX toggle + copy ----------
  $$("[data-bibtex]").forEach((btn) => {
    const panel = document.getElementById(btn.dataset.bibtex);
    panel.inert = true;
    btn.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open);
      panel.inert = !open;
    });
  });
  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.closest("pre").querySelector("code").textContent);
        const label = $("span", btn);
        label.textContent = "Copied";
        setTimeout(() => (label.textContent = "Copy"), 1600);
      } catch (e) {}
    });
  });
})();
