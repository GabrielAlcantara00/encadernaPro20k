/* Papeleira Pro 20K · comportamento da LP
   Preços, links e pixel ficam em config.js. */
(function () {
  "use strict";

  var C = window.LP_CONFIG || {};
  var plans = {
    basic: C.basic || { price: 10, checkout: "" },
    premium: C.premium || { price: 37, checkout: "" },
    upgrade: C.upgrade || { price: 27, checkout: "" }
  };
  var anchor = C.anchor || { basic: 97, premium: 197 };
  var KEY = "pp20k";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck", "fbclid"];
  var params = new URLSearchParams(window.location.search);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ss = {
    get: function (k) { try { return sessionStorage.getItem(KEY + "-" + k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(KEY + "-" + k, v); } catch (e) { /* sem storage */ } }
  };
  var round2 = function (v) { return Math.round(v * 100) / 100; };
  var money = function (v) { return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var moneyShort = function (v) { return Number.isInteger(v) ? "R$ " + v : money(v); };

  /* ---------- textos vindos do config ---------- */
  function fill() {
    if (C.brand) $$("[data-brand]").forEach(function (el) { el.textContent = C.brand; });
    $$("[data-price]").forEach(function (el) {
      var p = plans[el.getAttribute("data-price")];
      if (p) el.textContent = moneyShort(p.price);
    });
    $$("[data-price-full]").forEach(function (el) {
      var p = plans[el.getAttribute("data-price-full")];
      if (p) el.textContent = money(p.price);
    });
    $$("[data-anchor]").forEach(function (el) {
      var v = anchor[el.getAttribute("data-anchor")];
      if (v != null) el.textContent = money(v);
    });
    $$("[data-save]").forEach(function (el) { el.textContent = money(round2(plans.premium.price - plans.upgrade.price)); });
    $$("[data-diff]").forEach(function (el) { el.textContent = moneyShort(round2(plans.upgrade.price - plans.basic.price)); });
    $$("[data-guarantee]").forEach(function (el) { el.textContent = C.guaranteeDays || 30; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var contact = C.supportEmail ? "pelo e-mail " + C.supportEmail : (C.whatsapp ? "pelo WhatsApp +" + String(C.whatsapp).replace(/\D/g, "") : "");
    if (contact) $$("[data-contact]").forEach(function (el) { el.textContent = contact; });

    var sup = $("[data-support]");
    if (sup && (C.whatsapp || C.supportEmail)) {
      sup.hidden = false;
      sup.href = C.whatsapp ? "https://wa.me/" + String(C.whatsapp).replace(/\D/g, "") : "mailto:" + C.supportEmail;
      sup.target = "_blank";
      sup.rel = "noopener";
    }
  }

  /* ---------- preserva UTMs nos links de checkout ---------- */
  function withUtm(url) {
    try {
      var u = new URL(url, window.location.href);
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v && !u.searchParams.get(k)) u.searchParams.set(k, v);
      });
      return u.toString();
    } catch (e) { return url; }
  }

  /* ---------- rastreamento: SOMENTE ViewContent ---------- */
  function cookie(name) {
    var prefix = name + "=";
    var parts = document.cookie ? document.cookie.split(";") : [];
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (part.indexOf(prefix) === 0) return decodeURIComponent(part.slice(prefix.length));
    }
    return "";
  }

  function makeEventId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "vc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 12);
  }

  function buildFbc() {
    var existing = cookie("_fbc");
    if (existing) return existing;
    var fbclid = params.get("fbclid");
    return fbclid ? "fb.1." + Date.now() + "." + fbclid : "";
  }

  function sendServerViewContent(eventId) {
    var payload = {
      event_id: eventId,
      event_source_url: window.location.href,
      fbp: cookie("_fbp"),
      fbc: buildFbc(),
      content_name: C.brand || "Papeleira Pro 20K"
    };

    try {
      window.fetch("/api/meta-view-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        keepalive: true
      }).catch(function () { /* não interfere na LP */ });
    } catch (e) { /* não interfere na LP */ }
  }

  function loadPixel() {
    if (!C.pixelId) return;
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */

    var eventId = makeEventId();
    var content = { content_name: C.brand || "Papeleira Pro 20K" };

    window.fbq("init", String(C.pixelId));
    // Browser Pixel: SOMENTE ViewContent. O eventID é o mesmo enviado pela CAPI para deduplicação.
    window.fbq("track", "ViewContent", content, { eventID: eventId });

    // Dá um pequeno tempo para o Pixel criar/atualizar cookies _fbp/_fbc antes do envio server-side.
    window.setTimeout(function () { sendServerViewContent(eventId); }, 350);
  }

  /* ---------- checkout ---------- */
  function wireCheckouts() {
    $$("[data-checkout]").forEach(function (a) {
      var p = plans[a.getAttribute("data-checkout")];
      if (p && p.checkout) a.href = withUtm(p.checkout);
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-checkout]");
      if (!a) return;
      var plan = a.getAttribute("data-checkout");
      var p = plans[plan];
      if (!p || !p.checkout) {
        e.preventDefault();
        window.alert("Falta colar o link de checkout do plano \"" + plan + "\" no arquivo config.js.");
        return;
      }
      ss.set("checkout", "1");
      a.href = withUtm(p.checkout);
    });
  }

  /* ---------- popup do Básico ---------- */
  var dlg = $("#upgrade");
  function openUpgrade() {
    if (!dlg) return;
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); }
    else { dlg.setAttribute("open", ""); dlg.classList.add("fb"); }
  }
  function closeUpgrade() {
    if (!dlg) return;
    if (typeof dlg.close === "function" && dlg.open) dlg.close();
    else { dlg.removeAttribute("open"); dlg.classList.remove("fb"); }
  }
  function wireUpgrade() {
    if (!dlg) return;
    $$("[data-open-upgrade]").forEach(function (b) { b.addEventListener("click", openUpgrade); });
    $$("[data-close-upgrade]").forEach(function (b) { b.addEventListener("click", closeUpgrade); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeUpgrade(); });
  }

  /* ---------- oferta de saída: presente que abre ---------- */
  var exitEl = $("#exit"), modal = $("#gift-modal"), gift = $("#gift"), giftBox = $("#gift-box");
  var burst = $("#gift-burst"), hintText = $("#gift-hint-text");
  var exitOpened = false, taps = 0, opening = false, timers = [];
  var TAPS = 3;
  var touchUI = !!(window.matchMedia && window.matchMedia("(hover: none)").matches);
  var calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var HINTS = touchUI
    ? ["Toque 3 vezes no presente", "Isso! Mais 2 toques", "Só mais um..."]
    : ["Clique 3 vezes no presente", "Isso! Mais 2 cliques", "Só mais um..."];
  var COLORS = ["#ff2d87", "#ff5ca3", "#ffb6d5", "#ffffff", "#ffd166"];

  function later(fn, ms) { timers.push(window.setTimeout(fn, ms)); }
  function buzz(p) {
    // vibra no Android quando a pessoa toca; o iPhone não tem vibração no navegador
    try {
      if (!navigator.vibrate || (navigator.userActivation && !navigator.userActivation.hasBeenActive)) return;
      navigator.vibrate(p);
    } catch (e) { /* sem vibração */ }
  }
  function motion(el, frames, opts) {
    if (calm || !el || typeof el.animate !== "function") return null;
    try { return el.animate(frames, opts); } catch (e) { return null; }
  }
  function stopBox() {
    if (giftBox && typeof giftBox.getAnimations === "function") {
      giftBox.getAnimations().forEach(function (a) { a.cancel(); });
    }
  }
  function removeNode(el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }

  // o presente balança mais a cada toque; no último ele treme e cresce antes de abrir
  function shake(level) {
    stopBox();
    var last = level >= TAPS, n = last ? 12 : 6, amp = last ? 6 : 5 + level * 3, frames = [];
    for (var i = 0; i <= n; i++) {
      var k = i / n, edge = i === 0 || i === n;
      var force = last ? 0.5 + k * 0.7 : 1 - k * 0.8;
      var rot = edge ? 0 : (i % 2 ? -1 : 1) * amp * force;
      var sx = edge ? 1 : 1 + (i % 2 ? 0.05 : -0.04) * force;
      var grow = last ? 1 + k * 0.12 : 1;
      frames.push({ transform: "rotate(" + rot.toFixed(2) + "deg) scale(" + (sx * grow).toFixed(3) + "," + ((2 - sx) * grow).toFixed(3) + ")" });
    }
    motion(giftBox, frames, { duration: last ? 560 : 380 + level * 60, easing: last ? "ease-in" : "ease-out", fill: last ? "forwards" : "none" });
  }

  // faíscas que saem do presente, numa camada por cima do modal
  function sparks(count, reach, big) {
    if (calm || !burst || !giftBox) return;
    var r = giftBox.getBoundingClientRect(), b = burst.getBoundingClientRect();
    var ox = r.left + r.width / 2 - b.left, oy = r.top + r.height * (big ? 0.5 : 0.42) - b.top;
    for (var i = 0; i < count; i++) {
      var el = document.createElement("i");
      el.className = ["p-paper", "p-dot", "p-star"][i % 3];
      el.style.left = ox.toFixed(1) + "px";
      el.style.top = oy.toFixed(1) + "px";
      el.style.background = COLORS[i % COLORS.length];
      burst.appendChild(el);
      var ang = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      var dist = reach * (0.45 + Math.random() * 0.55);
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - (big ? 40 : 14);
      var fall = big ? 60 + Math.random() * 60 : 20;
      var spin = (Math.random() * 2 - 1) * (big ? 720 : 360);
      var size = big ? 0.8 + Math.random() * 0.8 : 0.6 + Math.random() * 0.5;
      var a = motion(el, [
        { transform: "translate(-50%,-50%) translate(0px,0px) rotate(0deg) scale(" + (size * 0.4).toFixed(2) + ")", opacity: 1 },
        { transform: "translate(-50%,-50%) translate(" + (dx * 0.8).toFixed(1) + "px," + (dy * 0.8).toFixed(1) + "px) rotate(" + Math.round(spin * 0.6) + "deg) scale(" + size.toFixed(2) + ")", opacity: 1, offset: 0.45 },
        { transform: "translate(-50%,-50%) translate(" + dx.toFixed(1) + "px," + (dy + fall).toFixed(1) + "px) rotate(" + Math.round(spin) + "deg) scale(" + (size * 0.5).toFixed(2) + ")", opacity: 0 }
      ], { duration: big ? 1000 + Math.random() * 700 : 520 + Math.random() * 220, easing: "cubic-bezier(.12,.75,.3,1)", fill: "forwards" });
      if (a) a.onfinish = removeNode(el);
      else burst.removeChild(el);
    }
  }

  // chuva de confete na tela toda depois que abre
  function rain() {
    var cf = $("#confetti");
    if (!cf || calm) return;
    var html = "";
    for (var i = 0; i < 54; i++) {
      html += '<i style="left:' + (Math.random() * 100).toFixed(1) + "%;background:" + COLORS[i % COLORS.length] +
        ";animation-delay:" + (Math.random() * 0.6).toFixed(2) + "s;animation-duration:" + (2.2 + Math.random() * 1.4).toFixed(2) + 's"></i>';
    }
    cf.innerHTML = html;
  }

  function resetGift() {
    timers.forEach(function (t) { window.clearTimeout(t); });
    timers = [];
    taps = 0;
    opening = false;
    stopBox();
    if (modal) {
      modal.classList.remove("is-charging");
      modal.classList.remove("is-open");
      modal.classList.remove("is-done");
      modal.setAttribute("data-taps", "0");
    }
    if (gift) gift.disabled = false;
    if (hintText) hintText.textContent = HINTS[0];
    if (burst) burst.innerHTML = "";
    var cf = $("#confetti");
    if (cf) cf.innerHTML = "";
  }

  function openExit(force) {
    if (!exitEl) return;
    if (!force) {
      if (exitOpened || ss.get("exit") === "1" || ss.get("checkout") === "1") return;
      if (dlg && dlg.open) return;
    }
    exitOpened = true;
    ss.set("exit", "1");
    resetGift();
    exitEl.hidden = false;
    document.documentElement.style.overflow = "hidden";
    window.setTimeout(function () { if (modal) modal.focus({ preventScroll: true }); }, 60);
  }

  function closeExit() {
    if (!exitEl) return;
    exitEl.hidden = true;
    document.documentElement.style.overflow = "";
  }

  function tapGift() {
    if (opening || !modal) return;
    taps += 1;
    modal.setAttribute("data-taps", String(taps));
    if (taps < TAPS) {
      shake(taps);
      sparks(5 + taps * 3, 80 + taps * 20, false);
      buzz(taps === 1 ? 14 : 24);
      if (hintText) hintText.textContent = HINTS[taps];
      return;
    }
    opening = true;
    if (gift) gift.disabled = true;
    if (hintText) hintText.textContent = "Abrindo...";
    if (calm) { openGift(); return; }
    modal.classList.add("is-charging");
    shake(TAPS);
    buzz(40);
    later(openGift, 560);
  }

  // a tampa voa, a luz estoura e o cartão do Premium sobe de dentro da caixa
  function openGift() {
    modal.classList.remove("is-charging");
    modal.classList.add("is-open");
    sparks(36, 180, true);
    rain();
    buzz([30, 40, 70]);
    later(function () {
      modal.classList.add("is-done");
      var cta = $("#exit-win [data-checkout]");
      if (cta) cta.focus({ preventScroll: true });
    }, calm ? 60 : 1150);
  }

  function wireExit() {
    if (!exitEl) return;
    if (gift) gift.addEventListener("click", tapGift);
    $$("[data-close-exit]").forEach(function (b) { b.addEventListener("click", closeExit); });
    exitEl.addEventListener("mousedown", function (e) { if (e.target === exitEl) closeExit(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !exitEl.hidden) closeExit(); });

    // computador: o mouse sai pela parte de cima da janela
    document.addEventListener("mouseout", function (e) {
      if (e.clientY <= 0 && !e.relatedTarget) openExit();
    });

    // celular: rolagem rápida para cima no começo da página (mesma regra da LP dos bottons)
    var lastY = window.scrollY, ups = 0, t0 = Date.now();
    window.addEventListener("scroll", function () {
      if (window.innerWidth > 800) return;
      var y = window.scrollY;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (y < lastY - 18) ups += 1;
      else if (y > lastY + 8) ups = 0;
      if (Date.now() - t0 > 9000 && y / max < 0.38 && ups >= 4) openExit();
      lastY = y;
    }, { passive: true });

    // testes: ?presente=1 abre o presente de saída, ?popup=1 abre o popup do Básico
    if (params.get("presente") === "1") window.setTimeout(function () { openExit(true); }, 700);
    if (params.get("popup") === "1") window.setTimeout(openUpgrade, 700);
  }

  /* ---------- barra fixa no celular ---------- */
  function wireSticky() {
    var sticky = $("#sticky"), hero = $(".hero"), planos = $("#planos");
    if (!sticky) return;
    var planosVisible = false;
    var upd = function () {
      var show = window.scrollY > (hero ? hero.offsetHeight - 60 : 700) && !planosVisible && (!exitEl || exitEl.hidden);
      sticky.classList.toggle("show", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
    };
    if ("IntersectionObserver" in window && planos) {
      new IntersectionObserver(function (en) { planosVisible = en[0].isIntersecting; upd(); }, { threshold: 0.08 }).observe(planos);
    }
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  /* ---------- animação de entrada ---------- */
  function wireReveal() {
    var els = $$(".rv");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- calculadora ---------- */
  function wireCalc() {
    var form = $("#calc");
    if (!form) return;
    var ids = ["folhas", "folha", "capa", "wire", "acab", "emb", "tempo", "hora", "taxa", "margem"];
    var inp = {};
    ids.forEach(function (id) { inp[id] = $("#c-" + id); });
    var num = function (id) {
      var v = parseFloat(String(inp[id].value).trim().replace(",", "."));
      return isFinite(v) && v > 0 ? v : 0;
    };
    var set = function (sel, txt) { var el = $(sel); if (el) el.textContent = txt; };

    function compute() {
      var material = num("folhas") * num("folha") + num("capa") + num("wire") + num("acab") + num("emb");
      var trabalho = num("tempo") / 60 * num("hora");
      var custo = material + trabalho;
      var tx = num("taxa") / 100, mg = num("margem") / 100, den = 1 - tx - mg;
      var pay = $("#o-pay");
      if (den <= 0.05) {
        set("#o-preco", "—");
        set("#o-custo", money(custo));
        set("#o-taxa", "—");
        set("#o-lucro", "—");
        if (pay) pay.textContent = "Taxas e margem somadas passam de 95%. Diminua uma das duas.";
        return;
      }
      var preco = custo / den, taxa = preco * tx, lucro = preco * mg;
      set("#o-preco", money(preco));
      set("#o-custo", money(custo));
      set("#o-taxa", money(taxa));
      set("#o-lucro", money(lucro));
      if (pay) {
        if (lucro >= 0.5) {
          var n = Math.ceil(plans.premium.price / lucro);
          pay.innerHTML = "Com esse lucro, <b>" + n + (n === 1 ? " agenda paga" : " agendas pagam") + "</b> o Premium.";
        } else {
          pay.textContent = "Coloque uma margem para ver em quantas agendas o Premium se paga.";
        }
      }
    }
    function reset() {
      ids.forEach(function (id) { inp[id].value = inp[id].getAttribute("data-def"); });
      compute();
    }
    form.addEventListener("input", compute);
    var rb = $("#calc-reset");
    if (rb) rb.addEventListener("click", reset);
    reset();
  }

  /* ---------- início ---------- */
  fill();
  wireCheckouts();
  wireUpgrade();
  wireExit();
  wireSticky();
  wireReveal();
  wireCalc();
  loadPixel();
})();
