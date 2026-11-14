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

  /* ---------- roleta de saída ---------- */
  var exitEl = $("#exit"), wheel = $("#wheel"), spinBtn = $("#spin"), play = $("#exit-play"), win = $("#exit-win");
  var exitOpened = false, spinning = false, spun = false;
  var SPIN_LABEL = "Girar minha roleta 🎁";

  function buildWheel() {
    if (!wheel) return;
    var P = plans.premium.price, U = plans.upgrade.price;
    var decoy = [P - 3, P - 5, P - 8].filter(function (v) { return v > U; });
    var segs = [
      ["PREMIUM", moneyShort(U)],          // 0 · é sempre aqui que a roleta para
      ["BÔNUS", "EXTRA"],
      ["PREMIUM", moneyShort(decoy[0] || P)],
      ["5%", "OFF"],
      ["PREMIUM", moneyShort(decoy[1] || P)],
      ["10%", "OFF"],
      ["PREMIUM", moneyShort(decoy[2] || P)],
      ["FICHAS", "GRÁTIS"]
    ];
    var colors = ["#ff2d87", "#1c1222", "#b5105a", "#0e0a11", "#ff5ca3", "#1c1222", "#8f0c48", "#0e0a11"];
    var n = segs.length, step = 360 / n, cx = 200, cy = 200;
    var pt = function (a, r) { var rad = (a - 90) * Math.PI / 180; return [(cx + r * Math.cos(rad)).toFixed(2), (cy + r * Math.sin(rad)).toFixed(2)]; };
    var svg = '<circle cx="200" cy="200" r="199" fill="#2a0f1f"/>';
    for (var i = 0; i < n; i++) {
      var p0 = pt(i * step - step / 2, 186), p1 = pt(i * step + step / 2, 186);
      svg += '<path d="M200 200 L' + p0[0] + " " + p0[1] + " A186 186 0 0 1 " + p1[0] + " " + p1[1] + ' Z" fill="' + colors[i] + '" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>';
      svg += '<g transform="rotate(' + i * step + ' 200 200)"><text x="200" y="64" text-anchor="middle" font-size="16">' + segs[i][0] + '</text><text x="200" y="90" text-anchor="middle" font-size="22">' + segs[i][1] + "</text></g>";
    }
    svg += '<circle cx="200" cy="200" r="190" fill="none" stroke="#ff5ca3" stroke-width="5"/>';
    for (var b = 0; b < 16; b++) {
      var q = pt(b * 22.5 + 11.25, 193);
      svg += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="3.6" fill="' + (b % 2 ? "#ffffff" : "#ffb6d5") + '"/>';
    }
    wheel.innerHTML = svg;
  }

  function resetWheel() {
    spinning = false;
    spun = false;
    if (play) play.hidden = false;
    if (win) win.hidden = true;
    if (spinBtn) { spinBtn.disabled = false; spinBtn.textContent = SPIN_LABEL; }
    if (wheel) { wheel.style.transition = "none"; wheel.style.transform = "rotate(180deg)"; }
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
    resetWheel();
    exitEl.hidden = false;
    document.documentElement.style.overflow = "hidden";
    window.setTimeout(function () { if (spinBtn) spinBtn.focus({ preventScroll: true }); }, 60);
  }

  function closeExit() {
    if (!exitEl) return;
    exitEl.hidden = true;
    document.documentElement.style.overflow = "";
  }

  function spin() {
    if (spinning || spun || !wheel) return;
    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = "Girando...";
    var jitter = Math.random() * 24 - 12; // fica dentro da fatia do Premium com desconto
    // força o navegador a aplicar a posição inicial antes da animação
    void wheel.getBoundingClientRect();
    wheel.style.transition = "transform 5s cubic-bezier(.12,.68,.08,1)";
    wheel.style.transform = "rotate(" + (360 * 6 + jitter) + "deg)";
    var stage = wheel.parentNode;
    // para no "PREMIUM R$ 27", mostra por um instante e só então abre o resultado
    window.setTimeout(function () { if (stage) stage.classList.add("landed"); spinBtn.textContent = "Premium por " + moneyShort(plans.upgrade.price) + "!"; }, 5050);
    window.setTimeout(function () { spinning = false; spun = true; if (stage) stage.classList.remove("landed"); showWin(); }, 6300);
  }

  function showWin() {
    if (play) play.hidden = true;
    if (win) win.hidden = false;
    var cf = $("#confetti");
    if (cf) {
      var colors = ["#ff2d87", "#ff5ca3", "#ffb6d5", "#ffffff", "#ffd166"], html = "";
      for (var i = 0; i < 54; i++) {
        html += '<i style="left:' + (Math.random() * 100).toFixed(1) + "%;background:" + colors[i % colors.length] +
          ";animation-delay:" + (Math.random() * 0.6).toFixed(2) + "s;animation-duration:" + (2.2 + Math.random() * 1.4).toFixed(2) + 's"></i>';
      }
      cf.innerHTML = html;
    }
    var cta = $("#exit-win [data-checkout]");
    if (cta) cta.focus({ preventScroll: true });
  }

  function wireExit() {
    if (!exitEl) return;
    buildWheel();
    if (spinBtn) spinBtn.addEventListener("click", spin);
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

    // testes: ?roleta=1 abre a roleta, ?popup=1 abre o popup do Básico
    if (params.get("roleta") === "1") window.setTimeout(function () { openExit(true); }, 700);
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
