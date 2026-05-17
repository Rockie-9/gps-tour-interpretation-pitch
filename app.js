// GPS Tour Interpretation · Handbook
// Static SPA. No build step. Loads JSON, routes via hash, renders into #main.
// Search via Cmd/Ctrl-K, language picker (TC/EN/JP), theme toggle, localStorage checklist.

(function() {
  'use strict';

  const STATE = {
    data: {},           // populated by loadData()
    lang: localStorage.getItem('hb-lang') || 'tc',
    theme: localStorage.getItem('hb-theme') || 'auto',
    checks: JSON.parse(localStorage.getItem('hb-checks') || '{}'),
  };

  const VALID_LANGS = ['tc', 'en', 'jp'];
  const ROUTES = {
    'home': renderHome,
    'capabilities': renderCapabilities,
    'capability': renderCapability,
    'scenarios': renderScenarios,
    'scenario': renderScenario,
    'bars': renderBars,
    'modules': renderModules,
    'module': renderModule,
    'tiers': renderTiers,
    'tier': renderTier,
    'substrate': renderSubstrate,
    'artifacts': renderArtifacts,
    'about': renderAbout,
  };

  // ============================================================
  // BOOTSTRAP
  // ============================================================
  document.addEventListener('DOMContentLoaded', async () => {
    applyLang(STATE.lang);
    applyTheme(STATE.theme);
    bindHeader();
    bindSearch();
    await loadData();
    route();
    window.addEventListener('hashchange', route);
  });

  async function loadData() {
    const files = ['capabilities', 'scenarios', 'bars', 'modules', 'tiers'];
    try {
      await Promise.all(files.map(async name => {
        const r = await fetch(`data/${name}.json`);
        STATE.data[name] = await r.json();
      }));
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }

  // ============================================================
  // ROUTER
  // ============================================================
  function route() {
    const hash = (location.hash || '#home').slice(1);
    const [path, ...rest] = hash.split('/');
    const param = rest.join('/');
    const fn = ROUTES[path] || renderNotFound;
    document.querySelectorAll('.site-nav a').forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${path}`);
    });
    const main = document.getElementById('main');
    main.innerHTML = '';
    fn(main, param);
    window.scrollTo(0, 0);
  }

  // ============================================================
  // PICK (trilingual content -> active-lang string)
  // ============================================================
  function pick(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[STATE.lang] || obj.en || obj.tc || obj.jp || '';
  }
  function pickBlock(obj) {
    // Returns HTML with primary + secondary lang previews.
    if (!obj) return '';
    const primary = pick(obj);
    const others = VALID_LANGS.filter(l => l !== STATE.lang && obj[l])
      .map(l => `<span class="body-${l === 'en' ? 'en' : (l === 'jp' ? 'jp' : 'tc')}" lang="${l === 'jp' ? 'ja' : l === 'tc' ? 'zh-Hant' : 'en'}">${escapeHtml(obj[l])}</span>`)
      .join('');
    return `<div>${escapeHtml(primary)}${others}</div>`;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ============================================================
  // LANG + THEME
  // ============================================================
  function applyLang(lang) {
    if (!VALID_LANGS.includes(lang)) lang = 'tc';
    STATE.lang = lang;
    localStorage.setItem('hb-lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang === 'jp' ? 'ja' : lang === 'en' ? 'en' : 'zh-Hant');
    document.querySelectorAll('[data-lang-set]').forEach(b => {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang-set') === lang ? 'true' : 'false');
    });
    if (Object.keys(STATE.data).length) route();
  }
  function applyTheme(theme) {
    STATE.theme = theme;
    localStorage.setItem('hb-theme', theme);
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-set]').forEach(b => {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme-set') === theme ? 'true' : 'false');
    });
  }

  function bindHeader() {
    document.querySelectorAll('[data-lang-set]').forEach(b => {
      b.addEventListener('click', () => applyLang(b.getAttribute('data-lang-set')));
    });
    document.querySelectorAll('[data-theme-set]').forEach(b => {
      b.addEventListener('click', () => applyTheme(b.getAttribute('data-theme-set')));
    });
  }

  // ============================================================
  // CHECKLIST PERSISTENCE
  // ============================================================
  function isChecked(key) { return !!STATE.checks[key]; }
  function setChecked(key, val) {
    if (val) STATE.checks[key] = Date.now();
    else delete STATE.checks[key];
    localStorage.setItem('hb-checks', JSON.stringify(STATE.checks));
  }
  function bindChecks(scope) {
    scope.querySelectorAll('input[data-check-key]').forEach(el => {
      const k = el.getAttribute('data-check-key');
      el.checked = isChecked(k);
      el.addEventListener('change', () => setChecked(k, el.checked));
    });
  }

  // ============================================================
  // RENDERERS
  // ============================================================
  function pageHead(eyebrow, titleObj, subtitle) {
    const en = titleObj && titleObj.en ? `<div class="page-title-en">${escapeHtml(titleObj.en)}</div>` : '';
    return `
      ${eyebrow ? `<div class="page-eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
      <h1 class="page-title">${escapeHtml(pick(titleObj))}</h1>
      ${en}
      ${subtitle ? `<p class="page-subtitle">${escapeHtml(pick(subtitle))}</p>` : ''}
    `;
  }

  // ---- HOME ----
  function renderHome(main) {
    const caps = STATE.data.capabilities?.capabilities?.length || 0;
    const scens = STATE.data.scenarios?.scenarios?.length || 0;
    const bars = STATE.data.bars?.anchors?.length || 0;
    const mods = STATE.data.modules?.modules?.length || 0;
    const tiers = STATE.data.tiers?.tiers?.length || 0;
    main.innerHTML = `
      <section class="home-hero">
        <h1 lang="zh-Hant">從接待,到大使。</h1>
        <div class="hero-en" lang="en">From Reception to Ambassadorship.</div>
        <div class="hero-jp" lang="ja">受付から、大使へ。</div>
        <p class="hero-desc">GPS 詢問台接待解說能力的查閱與練功用知識庫。把 12 種能力、10 個場景、72 個 BARS 行為錨(其中 12 個已範例化)、9 個訓練模組、6 個階位、與支撐這一切的稽核機制,放在一個可檢索、可深連結、可勾選練功的地方。</p>
      </section>
      <section class="hub-grid">
        <a class="hub-card" href="#capabilities">
          <div class="hub-code">01 · Capabilities</div>
          <div class="hub-title">能力模型</div>
          <div class="hub-title-en">Twelve capabilities, three clusters.</div>
          <div class="hub-blurb">在自我準備、對人、收束三個層面之中,什麼是被訓練、被觀察、被表揚的。</div>
          <div class="hub-count">${caps} 項 · ${caps} items</div>
        </a>
        <a class="hub-card" href="#scenarios">
          <div class="hub-code">02 · Scenarios</div>
          <div class="hub-title">應用場景</div>
          <div class="hub-title-en">Ten scenarios from wayfinding to handover.</div>
          <div class="hub-blurb">日常接待會碰到的十個典型場景。每個有時長、所需能力、與成功的判準。</div>
          <div class="hub-count">${scens} 場景 · ${scens} scenarios</div>
        </a>
        <a class="hub-card" href="#bars">
          <div class="hub-code">03 · BARS</div>
          <div class="hub-title">行為錨判斷量表</div>
          <div class="hub-title-en">12 of 72 anchors illustrated.</div>
          <div class="hub-blurb">每個能力 L0–L5 的可觀察行為。可勾選「我已在工作中見到」。</div>
          <div class="hub-count">${bars} / 72 anchors</div>
        </a>
        <a class="hub-card" href="#modules">
          <div class="hub-code">04 · Modules</div>
          <div class="hub-title">訓練模組</div>
          <div class="hub-title-en">Nine modules · three phases.</div>
          <div class="hub-blurb">從 TORE 入門到帶人認證,九個模組分三個階段。模組內容 v0.1 大綱,等 SME 內容。</div>
          <div class="hub-count">${mods} 模組 · ${mods} modules</div>
        </a>
        <a class="hub-card" href="#tiers">
          <div class="hub-code">05 · Tiers</div>
          <div class="hub-title">階位與表揚</div>
          <div class="hub-title-en">L0–L5 · craft, status, conditions.</div>
          <div class="hub-blurb">從應對者到文化大使的六個階段。每階對應的訪客感受、徽記、與晉階條件。</div>
          <div class="hub-count">${tiers} 階 · L0–L5</div>
        </a>
        <a class="hub-card" href="#substrate">
          <div class="hub-code">06 · Substrate</div>
          <div class="hub-title">工具・日誌・稽核</div>
          <div class="hub-title-en">Tooling, logs, audit.</div>
          <div class="hub-blurb">讓表揚可被質疑、讓問題可被找回的底層機制。連結到 /spec/ 的工程規格。</div>
          <div class="hub-count">spec → docs</div>
        </a>
        <a class="hub-card" href="#artifacts">
          <div class="hub-code">07 · Artifacts</div>
          <div class="hub-title">訪客可觸物件</div>
          <div class="hub-title-en">Desk card · parting lines · post-visit signal.</div>
          <div class="hub-blurb">把品牌想法帶出簡報、送到訪客手上的三件實物設計。</div>
          <div class="hub-count">3 specs</div>
        </a>
        <a class="hub-card" href="#about">
          <div class="hub-code">00 · About</div>
          <div class="hub-title">關於這份手冊</div>
          <div class="hub-title-en">About this handbook.</div>
          <div class="hub-blurb">版本、限制、來源、稽核紀錄、5-user 回饋計畫。</div>
          <div class="hub-count">v3.0 handbook</div>
        </a>
      </section>
    `;
  }

  // ---- CAPABILITIES list ----
  function renderCapabilities(main) {
    const d = STATE.data.capabilities;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    let html = pageHead('Layer 02', { tc: '能力模型', en: 'Capabilities' }, {
      tc: '十二項能力,按「發生時機」分為三組:在沒人面前的自我準備、面對訪客時、與收束的瞬間。',
      en: 'Twelve capabilities grouped by when they happen: self-readiness, audience-facing, site & closure.',
      jp: '十二の能力を「発生する時点」で三群に分ける:内的準備、対人、現場と収束。'
    });
    d.clusters.forEach(cluster => {
      const items = d.capabilities.filter(c => c.cluster === cluster.code);
      html += `
        <section class="list-section">
          <div class="list-section-head">
            <span class="list-section-code">Cluster ${cluster.code}</span>
            <span class="list-section-name">${escapeHtml(pick({tc: cluster.label_tc, en: cluster.label_en, jp: cluster.label_jp}))}</span>
            <span class="list-section-name-en">${escapeHtml(cluster.label_en)} — ${escapeHtml(cluster.subtitle_en || '')}</span>
          </div>
          <div class="list-grid">
            ${items.map(c => `
              <a class="list-card" href="#capability/${c.id}">
                <span class="lc-id">${c.id}</span>
                <div class="lc-name">${escapeHtml(pick(c.name))}</div>
                <div class="lc-name-en">${escapeHtml(c.name.en)}${c.hospitality_anchor ? ' · ⚓' : ''}</div>
              </a>
            `).join('')}
          </div>
        </section>
      `;
    });
    main.innerHTML = html;
  }

  // ---- CAPABILITY detail ----
  function renderCapability(main, id) {
    const d = STATE.data.capabilities;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    const c = d.capabilities.find(x => x.id === id);
    if (!c) return renderNotFound(main);
    const cluster = d.clusters.find(cl => cl.code === c.cluster);
    const bars = STATE.data.bars?.anchors?.filter(a => a.capability_id === id) || [];
    const scenarios = STATE.data.scenarios?.scenarios?.filter(s => s.capabilities.includes(id)) || [];
    const modules = STATE.data.modules?.modules?.filter(m => m.capabilities.includes(id) || m.capabilities.includes('all')) || [];

    let html = `
      <div class="page-eyebrow">Capability · 能力 #${c.id} · Cluster ${c.cluster} · ${escapeHtml(cluster.label_en)}</div>
      <h1 class="page-title">${escapeHtml(pick(c.name))}</h1>
      <div class="page-title-en">${escapeHtml(c.name.en)}</div>

      <section class="detail-section">
        <h2>定義 <span class="h2-en">Definition</span></h2>
        <p class="body">${escapeHtml(pick(c.def))}</p>
        ${STATE.lang !== 'en' ? `<div class="body-en" lang="en">${escapeHtml(c.def.en)}</div>` : ''}
        ${STATE.lang !== 'jp' ? `<div class="body-jp" lang="ja">${escapeHtml(c.def.jp)}</div>` : ''}
        ${STATE.lang !== 'tc' ? `<div lang="zh-Hant" style="font-family:var(--serif-tc); color:var(--ink-soft); font-size:14px; margin-top:6px;">${escapeHtml(c.def.tc)}</div>` : ''}
        ${c.hospitality_anchor ? `<div class="hospitality-anchor">${escapeHtml(pick(c.hospitality_anchor))}</div>` : ''}
      </section>

      ${bars.length ? `
      <section class="detail-section">
        <h2>BARS 行為錨 <span class="h2-en">Observable behaviors L0–L5</span></h2>
        <p style="font-size:13px; color:var(--ink-mute);">勾選你已在工作中觀察到的行為(localStorage 儲存,只在這台裝置)。</p>
        <div class="bars-table">
          <div class="bt-head">Level</div>
          <div class="bt-head">Behavior anchor</div>
          <div class="bt-head" style="text-align:center;">✓</div>
          ${bars.map(b => `
            <div class="bt-level">${b.level}</div>
            <div class="bt-text">
              ${escapeHtml(pick(b.behavior))}
              ${STATE.lang !== 'en' ? `<span class="bt-en" lang="en">${escapeHtml(b.behavior.en)}</span>` : ''}
              ${STATE.lang !== 'jp' ? `<span class="bt-jp" lang="ja">${escapeHtml(b.behavior.jp)}</span>` : ''}
            </div>
            <div class="bt-check">
              <input type="checkbox" class="bars-check" id="bars-${c.id}-${b.level}" data-check-key="bars-${c.id}-${b.level}" aria-label="Observed ${c.id} ${b.level}">
            </div>
          `).join('')}
        </div>
      </section>` : ''}

      ${scenarios.length ? `
      <section class="detail-section">
        <h2>用在哪些場景 <span class="h2-en">Appears in scenarios</span></h2>
        <div class="list-grid">
          ${scenarios.map(s => `
            <a class="list-card" href="#scenario/${s.code}">
              <span class="lc-id">${s.code}</span>
              <div class="lc-name">${escapeHtml(pick(s.name))}</div>
              <div class="lc-name-en">${escapeHtml(s.name.en)}</div>
            </a>
          `).join('')}
        </div>
      </section>` : ''}

      ${modules.length ? `
      <section class="detail-section">
        <h2>相關訓練模組 <span class="h2-en">Trained by</span></h2>
        <div class="list-grid">
          ${modules.map(m => `
            <a class="list-card" href="#module/${m.code}">
              <span class="lc-id">${m.code}</span>
              <div class="lc-name">${escapeHtml(pick(m.name))}</div>
              <div class="lc-name-en">${escapeHtml(m.name.en)}</div>
              <div class="lc-meta"><span class="lc-meta-pill">${m.phase}</span></div>
            </a>
          `).join('')}
        </div>
      </section>` : ''}
    `;
    main.innerHTML = html;
    bindChecks(main);
  }

  // ---- SCENARIOS list ----
  function renderScenarios(main) {
    const d = STATE.data.scenarios;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    let html = pageHead('Layer 04', { tc: '應用場景', en: 'Application Scenarios' }, {
      tc: '日常接待會碰到的十個典型場景,分為前線解說、重點接待、服務恢復、前後台連結四類。',
      en: 'Ten typical scenarios in four categories: frontline interpretation, special reception, service recovery, pre/post & backstage.',
      jp: '日常接遇で出会う十の典型場面を四つのカテゴリーに分けた。'
    });
    d.categories.forEach(cat => {
      const items = d.scenarios.filter(s => s.category === cat.code);
      html += `
        <section class="list-section">
          <div class="list-section-head">
            <span class="list-section-code">Category ${cat.code}</span>
            <span class="list-section-name">${escapeHtml(pick({tc: cat.label_tc, en: cat.label_en, jp: cat.label_jp}))}</span>
            <span class="list-section-name-en">${escapeHtml(cat.label_en)}</span>
          </div>
          <div class="list-grid">
            ${items.map(s => `
              <a class="list-card" href="#scenario/${s.code}">
                <span class="lc-id">${s.code}</span>
                <div class="lc-name">${escapeHtml(pick(s.name))}</div>
                <div class="lc-name-en">${escapeHtml(s.name.en)}</div>
                <div class="lc-meta">
                  <span class="lc-meta-pill">${escapeHtml(pick(s.duration))}</span>
                  ${s.capabilities.map(c => `<span class="lc-meta-pill">${c}</span>`).join('')}
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      `;
    });
    main.innerHTML = html;
  }

  // ---- SCENARIO detail ----
  function renderScenario(main, code) {
    const d = STATE.data.scenarios;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    const s = d.scenarios.find(x => x.code === code);
    if (!s) return renderNotFound(main);

    let html = `
      <div class="page-eyebrow">Scenario · 場景 ${s.code} · ${escapeHtml(s.category)}</div>
      <h1 class="page-title">${escapeHtml(pick(s.name))}</h1>
      <div class="page-title-en">${escapeHtml(s.name.en)} · <span lang="ja" style="font-family:var(--serif-jp);">${escapeHtml(s.name.jp)}</span></div>

      <dl class="detail-meta">
        <div><dt>Duration · 時長</dt><dd>${escapeHtml(pick(s.duration))}</dd></div>
        <div><dt>Required capabilities · 所需能力</dt><dd>${s.capabilities.map(cid => {
          const c = STATE.data.capabilities?.capabilities.find(x => x.id === cid);
          return `<a class="meta-pill" href="#capability/${cid}">${cid}${c ? ' · ' + escapeHtml(pick(c.name)) : ''}</a>`;
        }).join(' ')}</dd></div>
      </dl>

      <section class="detail-section">
        <h2>成功的判準 <span class="h2-en">Success criterion</span></h2>
        <p class="body">${escapeHtml(pick(s.success))}</p>
        ${STATE.lang !== 'en' ? `<div class="body-en" lang="en">${escapeHtml(s.success.en)}</div>` : ''}
        ${STATE.lang !== 'jp' ? `<div class="body-jp" lang="ja">${escapeHtml(s.success.jp)}</div>` : ''}
      </section>

      ${s.register_anchor ? `
      <section class="detail-section">
        <h2>接待語體 <span class="h2-en">Register anchor</span></h2>
        <div class="hospitality-anchor">${escapeHtml(pick(s.register_anchor))}</div>
      </section>` : ''}

      ${s.is_loopback ? `
      <section class="detail-section">
        <p style="font-size:13px; color:var(--ink-mute);">★ 此場景既是接觸點,也是校準的源頭(D3 回流)。蒐集到的回饋會回到 BARS 與腳本庫修訂。</p>
      </section>` : ''}
    `;
    main.innerHTML = html;
  }

  // ---- BARS ----
  function renderBars(main) {
    const d = STATE.data.bars;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    const caps = STATE.data.capabilities?.capabilities || [];
    let html = pageHead('Layer 03', { tc: 'BARS 行為錨判斷量表', en: 'Behaviorally Anchored Rating Scale' }, {
      tc: `${d.anchors_in_file} of ${d.anchors_total} 行為錨已範例化;每個能力 L0-L5 各一個觀察錨點。其餘 60 個由 SME 補完。`,
      en: `${d.anchors_in_file} of ${d.anchors_total} behavior anchors illustrated; one observable anchor per L0-L5 per capability. Remaining 60 pending SME.`,
      jp: `全${d.anchors_total}個中、${d.anchors_in_file}個の行動指標を例示。各能力のL0〜L5に一つずつ。残り60個はSME待ち。`
    });
    d.capabilities_illustrated.forEach(cid => {
      const c = caps.find(x => x.id === cid);
      const anchors = d.anchors.filter(a => a.capability_id === cid);
      html += `
        <section class="list-section">
          <div class="list-section-head">
            <span class="list-section-code">Capability ${cid}</span>
            <span class="list-section-name">${escapeHtml(pick(c.name))}</span>
            <span class="list-section-name-en">${escapeHtml(c.name.en)} · <a href="#capability/${cid}">→ detail</a></span>
          </div>
          <div class="bars-table">
            <div class="bt-head">Level</div>
            <div class="bt-head">Behavior anchor</div>
            <div class="bt-head" style="text-align:center;">✓</div>
            ${anchors.map(a => `
              <div class="bt-level">${a.level}</div>
              <div class="bt-text">
                ${escapeHtml(pick(a.behavior))}
                ${STATE.lang !== 'en' ? `<span class="bt-en" lang="en">${escapeHtml(a.behavior.en)}</span>` : ''}
                ${STATE.lang !== 'jp' ? `<span class="bt-jp" lang="ja">${escapeHtml(a.behavior.jp)}</span>` : ''}
              </div>
              <div class="bt-check">
                <input type="checkbox" class="bars-check" data-check-key="bars-${cid}-${a.level}" aria-label="Observed ${cid} ${a.level}">
              </div>
            `).join('')}
          </div>
        </section>
      `;
    });
    main.innerHTML = html;
    bindChecks(main);
  }

  // ---- MODULES list ----
  function renderModules(main) {
    const d = STATE.data.modules;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    let html = pageHead('Layer 05', { tc: '訓練模組', en: 'Training Modules' }, {
      tc: '九個模組分三個階段:探索期(4週)、建構期(8週)、構築期(持續)。每個模組目前是 v0.1 大綱,內容由 SME 補完。',
      en: 'Nine modules across three phases (Explorer 4w · Builder 8w · Architect ongoing). Each card is a v0.1 outline pending SME content.',
      jp: '九つの講座を三つの段階に分ける。各カードはv0.1大綱、内容はSME待ち。'
    });
    d.phases.forEach(ph => {
      const items = d.modules.filter(m => m.phase === ph.code);
      html += `
        <section class="list-section">
          <div class="list-section-head">
            <span class="list-section-code">Phase · ${ph.duration}</span>
            <span class="list-section-name">${escapeHtml(pick({tc: ph.label_tc, en: ph.label_en, jp: ph.label_jp}))}</span>
            <span class="list-section-name-en">${escapeHtml(ph.label_en)} · for ${ph.for_tiers.join('/')}</span>
          </div>
          <div class="list-grid">
            ${items.map(m => `
              <a class="list-card" href="#module/${m.code}">
                <span class="lc-id">${m.code}</span>
                <div class="lc-name">${escapeHtml(pick(m.name))}</div>
                <div class="lc-name-en">${escapeHtml(m.name.en)}</div>
                <div class="lc-meta">
                  ${m.capabilities.slice(0, 3).map(c => `<span class="lc-meta-pill">${c}</span>`).join('')}
                  ${m.sme_blocker ? '<span class="lc-meta-pill" style="background:rgba(232,155,126,0.12); color:#B86E50; border-color:rgba(232,155,126,0.3);">SME gap</span>' : ''}
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      `;
    });
    main.innerHTML = html;
  }

  // ---- MODULE detail ----
  function renderModule(main, code) {
    const d = STATE.data.modules;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    const m = d.modules.find(x => x.code === code);
    if (!m) return renderNotFound(main);
    const ph = d.phases.find(p => p.code === m.phase);
    const caps = STATE.data.capabilities?.capabilities || [];

    let html = `
      <div class="page-eyebrow">Module · 模組 ${m.code} · ${escapeHtml(ph.label_en)} (${ph.duration})</div>
      <h1 class="page-title">${escapeHtml(pick(m.name))}</h1>
      <div class="page-title-en">${escapeHtml(m.name.en)} · <span lang="ja" style="font-family:var(--serif-jp);">${escapeHtml(m.name.jp)}</span></div>

      ${m.sme_blocker ? `<div class="sme-banner"><strong>SME content pending:</strong> ${escapeHtml(m.sme_blocker)}</div>` : ''}

      <dl class="detail-meta">
        <div><dt>Phase · 階段</dt><dd>${escapeHtml(pick({tc: ph.label_tc, en: ph.label_en, jp: ph.label_jp}))} · ${ph.duration}</dd></div>
        <div><dt>Maps to capabilities · 對應能力</dt><dd>${m.capabilities.map(cid => {
          if (cid === 'all') return '<span class="meta-pill">all 12</span>';
          const c = caps.find(x => x.id === cid);
          return `<a class="meta-pill" href="#capability/${cid}">${cid}${c ? ' · ' + escapeHtml(pick(c.name)) : ''}</a>`;
        }).join(' ')}</dd></div>
        <div><dt>State · 狀態</dt><dd>${escapeHtml(m.state)}</dd></div>
        ${m.required_for_l5 ? `<div><dt>Required for · 必修</dt><dd>L5 promotion</dd></div>` : ''}
      </dl>

      <section class="detail-section">
        <h2>內容 <span class="h2-en">Content</span></h2>
        <p class="body">${escapeHtml(pick(m.content))}</p>
        ${STATE.lang !== 'en' ? `<div class="body-en" lang="en">${escapeHtml(m.content.en)}</div>` : ''}
        ${STATE.lang !== 'jp' ? `<div class="body-jp" lang="ja">${escapeHtml(m.content.jp)}</div>` : ''}
      </section>

      <section class="detail-section">
        <h2>驗收 <span class="h2-en">Validation</span></h2>
        <p class="body">${escapeHtml(pick(m.validation))}</p>
        ${STATE.lang !== 'en' ? `<div class="body-en" lang="en">${escapeHtml(m.validation.en)}</div>` : ''}
        ${STATE.lang !== 'jp' ? `<div class="body-jp" lang="ja">${escapeHtml(m.validation.jp)}</div>` : ''}
      </section>

      <section class="detail-section">
        <h2>我的進度 <span class="h2-en">My progress</span></h2>
        <label style="display:flex; align-items:center; gap:10px; font-family:var(--serif-tc); font-size:14px;">
          <input type="checkbox" class="bars-check" data-check-key="module-completed-${m.code}" aria-label="Module ${m.code} completed">
          完成這個模組 / Mark this module complete
        </label>
        <p style="font-size:12px; color:var(--ink-mute); margin-top:6px;">記錄只存在這台裝置的 localStorage。</p>
      </section>

      <section class="detail-section">
        <h2>規格詳情 <span class="h2-en">Full v0.1 card</span></h2>
        <p><a href="${m.details_url}README.md" target="_blank" rel="noopener">${m.details_url}README.md ↗</a></p>
      </section>
    `;
    main.innerHTML = html;
    bindChecks(main);
  }

  // ---- TIERS list ----
  function renderTiers(main) {
    const d = STATE.data.tiers;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    let html = pageHead('Recognition', { tc: '階位與表揚', en: 'Recognition Tiers' }, {
      tc: '從應對者到文化大使的六個階段。每階對應的訪客感受、徽記、晉階條件。',
      en: 'Six tiers from Clerk to Cultural Ambassador. For each: visitor experience, insignia, conditions for promotion.',
      jp: '応対者から文化大使までの六段階。各段階の客様の感覚、徽章、昇格条件。'
    });
    html += '<div class="list-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">';
    d.tiers.forEach(t => {
      html += `
        <a class="list-card" href="#tier/${t.level}">
          <span class="lc-id">${t.level}</span>
          <div class="lc-name">${escapeHtml(pick(t.staff_title))}</div>
          <div class="lc-name-en">${escapeHtml(t.staff_title.en)}</div>
          <div class="lc-meta"><span class="lc-meta-pill">${escapeHtml(pick(t.craft))}</span></div>
        </a>
      `;
    });
    html += '</div>';
    main.innerHTML = html;
  }

  // ---- TIER detail ----
  function renderTier(main, level) {
    const d = STATE.data.tiers;
    if (!d) return main.innerHTML = '<p>Loading…</p>';
    const t = d.tiers.find(x => x.level === level);
    if (!t) return renderNotFound(main);

    let html = `
      <div class="page-eyebrow">Tier · 階位 ${t.level}</div>
      <h1 class="page-title">${escapeHtml(pick(t.staff_title))}</h1>
      <div class="page-title-en">${escapeHtml(t.staff_title.en)} · <span lang="ja" style="font-family:var(--serif-jp);">${escapeHtml(t.staff_title.jp)}</span></div>

      <section class="detail-section">
        <h2>訪客感受 <span class="h2-en">Visitor experience</span></h2>
        <p class="body">${escapeHtml(pick(t.visitor_experience))}</p>
        ${STATE.lang !== 'en' ? `<div class="body-en" lang="en">${escapeHtml(t.visitor_experience.en)}</div>` : ''}
        ${STATE.lang !== 'jp' ? `<div class="body-jp" lang="ja">${escapeHtml(t.visitor_experience.jp)}</div>` : ''}
      </section>

      <section class="detail-section">
        <h2>工藝認可 <span class="h2-en">Craft recognition</span></h2>
        <p class="body">${escapeHtml(pick(t.craft))}</p>
      </section>

      <section class="detail-section">
        <h2>身分與徽記 <span class="h2-en">Status & insignia</span></h2>
        <p class="body">${escapeHtml(pick(t.insignia))}</p>
      </section>

      <section class="detail-section">
        <h2>當階可做 <span class="h2-en">Conditions at this tier</span></h2>
        <p class="body">${escapeHtml(pick(t.conditions))}</p>
      </section>

      ${t.unlock_to_next ? `
      <section class="detail-section">
        <h2>晉至下一階解鎖 <span class="h2-en">Unlock to next tier</span></h2>
        <p class="body">${escapeHtml(pick(t.unlock_to_next))}</p>
      </section>` : ''}
    `;
    main.innerHTML = html;
  }

  // ---- SUBSTRATE ----
  function renderSubstrate(main) {
    main.innerHTML = `
      ${pageHead('Substrate', { tc: '工具・日誌・稽核', en: 'Substrate · Tooling · Logs · Audit' }, {
        tc: '骨架之下、追蹤可能之網。每一筆判讀都能被找回、被覆盤、被校準。詳細規格在 /spec/。',
        en: 'Beneath the frame, a traceable mesh. Every reading retrievable, replayable, recalibratable. Full spec in /spec/.',
        jp: '骨格の下に追跡可能な網。すべての判断が呼び戻せ、再検証し、再校正できる。'
      })}
      <section class="list-section">
        <div class="list-section-head"><span class="list-section-code">Spec files</span></div>
        <div class="list-grid">
          <a class="list-card" href="spec/" target="_blank" rel="noopener">
            <span class="lc-id">README</span>
            <div class="lc-name">Spec 索引</div>
            <div class="lc-name-en">Index + honest-state banner</div>
          </a>
          <a class="list-card" href="spec/logging.md" target="_blank" rel="noopener">
            <span class="lc-id">LOG</span>
            <div class="lc-name">日誌規格</div>
            <div class="lc-name-en">5W1H schema, retention, PII</div>
          </a>
          <a class="list-card" href="spec/audit-events.json" target="_blank" rel="noopener">
            <span class="lc-id">JSON</span>
            <div class="lc-name">稽核分類</div>
            <div class="lc-name-en">4 domains · 14 actions · 4 triggers</div>
          </a>
          <a class="list-card" href="spec/payloads.md" target="_blank" rel="noopener">
            <span class="lc-id">SAMPLE</span>
            <div class="lc-name">範例事件</div>
            <div class="lc-name-en">One realistic payload per action_type</div>
          </a>
          <a class="list-card" href="spec/versioning.md" target="_blank" rel="noopener">
            <span class="lc-id">SEMVER</span>
            <div class="lc-name">版本策略</div>
            <div class="lc-name-en">Append-only contract</div>
          </a>
          <a class="list-card" href="spec/storage.md" target="_blank" rel="noopener">
            <span class="lc-id">STORAGE</span>
            <div class="lc-name">儲存層</div>
            <div class="lc-name-en">Hot / warm / cold tier placement</div>
          </a>
          <a class="list-card" href="spec/i18n.md" target="_blank" rel="noopener">
            <span class="lc-id">I18N</span>
            <div class="lc-name">在地化</div>
            <div class="lc-name-en">Measurement, date, name-order, RTL</div>
          </a>
          <a class="list-card" href="spec/accessibility.md" target="_blank" rel="noopener">
            <span class="lc-id">A11Y</span>
            <div class="lc-name">無障礙</div>
            <div class="lc-name-en">Commitments + test plan</div>
          </a>
          <a class="list-card" href="spec/validation.md" target="_blank" rel="noopener">
            <span class="lc-id">PANEL</span>
            <div class="lc-name">評估方法</div>
            <div class="lc-name-en">Persona panel + cadence</div>
          </a>
          <a class="list-card" href="spec/dependencies.md" target="_blank" rel="noopener">
            <span class="lc-id">DEPS</span>
            <div class="lc-name">第三方依賴</div>
            <div class="lc-name-en">Audit + fallback strategy</div>
          </a>
        </div>
      </section>
      <div class="sme-banner"><strong>v0.1 design intent.</strong> 這些檔案是設計意圖,不是已經建好的系統。實際 LINE OA、Web Console、資料庫、稽核工作流由工程實作。</div>
    `;
  }

  // ---- ARTIFACTS ----
  function renderArtifacts(main) {
    main.innerHTML = `
      ${pageHead('Artifacts', { tc: '訪客可觸物件', en: 'Visitor-Touchable Artifacts' }, {
        tc: '把品牌想法帶出簡報、送到訪客手上的三件實物設計。詳細規格在 /artifacts/。',
        en: 'Three physical artifacts that take the brand idea out of the deck and into the visitor\'s world.',
        jp: 'ブランドの考えを資料の外、お客様の手元へ届ける三つの物的設計。'
      })}
      <div class="list-grid">
        <a class="list-card" href="artifacts/desk-card.md" target="_blank" rel="noopener">
          <span class="lc-id">CARD</span>
          <div class="lc-name">桌牌・名片</div>
          <div class="lc-name-en">Desk card — 85×55mm cotton, tier insignia</div>
        </a>
        <a class="list-card" href="artifacts/parting-lines.md" target="_blank" rel="noopener">
          <span class="lc-id">LINES</span>
          <div class="lc-name">送別句型</div>
          <div class="lc-name-en">Parting lines — 3 intensities × 6 tiers</div>
        </a>
        <a class="list-card" href="artifacts/post-visit-signal.md" target="_blank" rel="noopener">
          <span class="lc-id">SIGNAL</span>
          <div class="lc-name">後續記號</div>
          <div class="lc-name-en">Post-visit handwritten note</div>
        </a>
      </div>
    `;
  }

  // ---- ABOUT ----
  function renderAbout(main) {
    main.innerHTML = `
      ${pageHead('About', { tc: '關於這份手冊', en: 'About this Handbook' }, null)}
      <section class="detail-section">
        <h2>版本 <span class="h2-en">Version</span></h2>
        <p class="body">v3.0 · handbook · 2026-05-17. 取代了 v2.0 deck (見 git 紀錄)。</p>
      </section>
      <section class="detail-section">
        <h2>形式選擇 <span class="h2-en">Form factor</span></h2>
        <p class="body">這是一個靜態知識庫:可檢索、可深連結、可勾選自我練功的手冊。不是簡報、不是 LMS、沒有帳號、沒有伺服器寫入。所有狀態存在你的瀏覽器 (localStorage)。</p>
      </section>
      <section class="detail-section">
        <h2>限制 <span class="h2-en">Honest limitations</span></h2>
        <ul style="font-size:14px; line-height:1.8; color:var(--ink); padding-left:20px;">
          <li>72 個 BARS 行為錨,只有 12 個範例化。其餘 60 個需 SME 補完。</li>
          <li>9 個訓練模組是 v0.1 大綱;真正的課程內容(尤其 M5 跨文化的禁忌、手勢、距離卡)需要 NAI / 文化顧問 4-6 週的 SME 投入。</li>
          <li>5-power-user 回饋 — 你選擇了「不等 5-user 先做最小可用版」。第一版可能還有方向錯誤,等真實使用者回饋再迭代。</li>
          <li>沒有後端、沒有帳號、沒有真實的「晉階」流程。Recognition / Substrate 是規範,不是已實作的系統。</li>
          <li>跨地區語言:目前是 TC + EN + JP。DE / Simplified CN 已在 /spec/i18n.md 列為 staged-language,需要譯者。</li>
          <li>離線:Service worker 從 v2 留下,第一次載入後可離線使用。</li>
        </ul>
      </section>
      <section class="detail-section">
        <h2>來源 <span class="h2-en">Sources</span></h2>
        <p class="body">內容取自 Tilden(1957)、Sam Ham(1992 EROT;2013 TORE)、NAI 六級制、WFTGA 區域工作坊、Smith &amp; Kendall(1963)BARS、CPTED。詳細引用在 deck 的 Layer 01 與 /spec/。</p>
      </section>
      <section class="detail-section">
        <h2>回饋 <span class="h2-en">Feedback</span></h2>
        <p class="body">發現問題、想要的功能、不對的翻譯、缺少的場景?
          <a href="https://github.com/Rockie-9/gps-tour-interpretation-pitch/issues/new?template=deck-feedback.yml" target="_blank" rel="noopener">在 GitHub 開 issue ↗</a>
        </p>
      </section>
      <section class="detail-section">
        <h2>稽核紀錄 <span class="h2-en">Audit log</span></h2>
        <p class="body">每一版的真實狀態、缺口、SME 阻塞,都在 <a href="AUDIT.md" target="_blank">AUDIT.md</a>。</p>
      </section>
    `;
  }

  // ---- 404 ----
  function renderNotFound(main) {
    main.innerHTML = `
      <h1 class="page-title">找不到 / Not found</h1>
      <p class="page-subtitle"><a href="#home">← 回首頁</a></p>
    `;
  }

  // ============================================================
  // SEARCH
  // ============================================================
  function bindSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!overlay || !input || !results) return;

    function open_() {
      overlay.setAttribute('data-open', 'true');
      input.value = '';
      render('');
      setTimeout(() => input.focus(), 10);
    }
    function close_() {
      overlay.setAttribute('data-open', 'false');
    }

    function buildIndex() {
      const idx = [];
      const d = STATE.data;
      (d.capabilities?.capabilities || []).forEach(c => {
        idx.push({
          hash: `capability/${c.id}`,
          title: `${c.id} · ${pick(c.name)}`,
          context: `Capability · ${c.name.en}`,
          text: `${c.id} ${c.name.tc} ${c.name.en} ${c.name.jp} ${c.def.tc} ${c.def.en} ${c.def.jp}`.toLowerCase()
        });
      });
      (d.scenarios?.scenarios || []).forEach(s => {
        idx.push({
          hash: `scenario/${s.code}`,
          title: `${s.code} · ${pick(s.name)}`,
          context: `Scenario · ${s.name.en}`,
          text: `${s.code} ${s.name.tc} ${s.name.en} ${s.name.jp} ${s.success.tc} ${s.success.en} ${s.success.jp}`.toLowerCase()
        });
      });
      (d.bars?.anchors || []).forEach(a => {
        idx.push({
          hash: `capability/${a.capability_id}`,
          title: `${a.capability_id} ${a.level} · ${pick(a.behavior).slice(0, 60)}`,
          context: `BARS anchor`,
          text: `${a.capability_id} ${a.level} bars ${a.behavior.tc} ${a.behavior.en} ${a.behavior.jp}`.toLowerCase()
        });
      });
      (d.modules?.modules || []).forEach(m => {
        idx.push({
          hash: `module/${m.code}`,
          title: `${m.code} · ${pick(m.name)}`,
          context: `Module · ${m.name.en} · ${m.phase}`,
          text: `${m.code} ${m.name.tc} ${m.name.en} ${m.name.jp} ${m.content.tc} ${m.content.en}`.toLowerCase()
        });
      });
      (d.tiers?.tiers || []).forEach(t => {
        idx.push({
          hash: `tier/${t.level}`,
          title: `${t.level} · ${pick(t.staff_title)}`,
          context: `Tier · ${t.staff_title.en}`,
          text: `${t.level} ${t.staff_title.tc} ${t.staff_title.en} ${t.staff_title.jp} ${t.craft.tc} ${t.craft.en}`.toLowerCase()
        });
      });
      idx.push({ hash: 'substrate', title: '工具・日誌・稽核 · Substrate', context: 'Section', text: 'substrate tooling logs audit spec 工具 日誌 稽核' });
      idx.push({ hash: 'artifacts', title: '訪客可觸物件 · Artifacts', context: 'Section', text: 'artifacts desk card parting lines post-visit signal' });
      idx.push({ hash: 'about', title: '關於 · About', context: 'Section', text: 'about version limitations sources feedback' });
      return idx;
    }

    let INDEX = [];
    let selected = 0;

    function render(q) {
      if (!INDEX.length) INDEX = buildIndex();
      let matches;
      if (!q.trim()) {
        matches = INDEX.slice(0, 24);
      } else {
        const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        matches = INDEX
          .map(item => {
            let score = 0;
            tokens.forEach(t => {
              if (item.title.toLowerCase().includes(t)) score += 4;
              if (item.context.toLowerCase().includes(t)) score += 2;
              if (item.text.includes(t)) score += 1;
            });
            return { item, score };
          })
          .filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 30)
          .map(r => r.item);
      }
      selected = 0;
      if (!matches.length) {
        results.innerHTML = '<li class="empty" style="padding:24px; text-align:center; color:var(--ink-mute); font-style:italic;">沒有結果 · No matches · 該当なし</li>';
        return;
      }
      results.innerHTML = matches.map((m, i) => `
        <li role="option" data-hash="${m.hash}" aria-selected="${i === 0 ? 'true' : 'false'}">
          <span class="sr-title">${escapeHtml(m.title)}</span>
          <span class="sr-context">${escapeHtml(m.context)} · #${m.hash}</span>
        </li>
      `).join('');
    }

    function jump(hash) {
      location.hash = hash;
      close_();
    }
    function move(delta) {
      const lis = results.querySelectorAll('li[data-hash]');
      if (!lis.length) return;
      selected = (selected + delta + lis.length) % lis.length;
      lis.forEach((l, i) => l.setAttribute('aria-selected', i === selected ? 'true' : 'false'));
      lis[selected].scrollIntoView({ block: 'nearest' });
    }

    document.addEventListener('keydown', e => {
      const isInput = e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      if (!isInput && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k'))) {
        e.preventDefault();
        open_();
      }
    });
    document.querySelectorAll('.search-btn').forEach(b => b.addEventListener('click', open_));
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close_(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const sel = results.querySelector('li[aria-selected="true"]');
        if (sel) jump(sel.getAttribute('data-hash'));
      }
    });
    results.addEventListener('click', e => {
      const li = e.target.closest('li[data-hash]');
      if (li) jump(li.getAttribute('data-hash'));
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close_();
    });
  }

  // ============================================================
  // SERVICE WORKER (offline)
  // ============================================================
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
