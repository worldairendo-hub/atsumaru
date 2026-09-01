(() => {
  const pad = (n) => String(n).padStart(2, "0");
  const jstParts = () => {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const g = (k) => p.find((x) => x.type === k)?.value;
    return {
      date: `${g("year")}-${g("month")}-${g("day")}`,
      hour: Number(g("hour")) % 24,
      minute: Number(g("minute")),
    };
  };
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const style = `<style>.ats-tide-live h2{margin:0 0 8px;font-size:28px}.ats-tide-sub{color:var(--muted);line-height:1.6;margin:0 0 12px}.ats-tide-chart{background:linear-gradient(180deg,#0b2130 0%,#071722 100%);border:1px solid #1f4a61;border-radius:18px;padding:8px 6px 4px;margin:12px 0 14px;overflow:hidden}.ats-tide-chart svg{width:100%;height:auto;display:block}.ats-tide-grid{stroke:#23485d;stroke-width:1}.ats-tide-vgrid{stroke:#17384a;stroke-width:1}.ats-tide-line{fill:none;stroke:#58c7ff;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}.ats-tide-area{fill:url(#atsTideFill)}.ats-tide-label{fill:#d4e1e8;font-size:15px;font-weight:700}.ats-tide-small{fill:#9fb5c2;font-size:13px}.ats-tide-now{stroke:#ffd166;stroke-width:3;stroke-dasharray:6 5}.ats-tide-nowdot{fill:#ffd166;stroke:#071722;stroke-width:3}.ats-tide-event-dot{fill:#fff;stroke:#58c7ff;stroke-width:3}.ats-tide-event-text{fill:#fff;font-size:14px;font-weight:800}.ats-tide-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ats-tide-box{border:1px solid var(--line);border-radius:14px;padding:14px;background:#071722}.ats-tide-box b{display:block;color:#47bdf5;font-size:13px;margin-bottom:4px}.ats-tide-box strong{font-size:22px}.ats-tide-source{font-size:12px;color:var(--muted);margin-top:12px;line-height:1.6}.ats-tide-error{padding:18px;border:1px solid var(--line);border-radius:14px;color:#ffb4b4}@media(max-width:520px){.ats-tide-live h2{font-size:24px}.ats-tide-box strong{font-size:19px}.ats-tide-label{font-size:14px}.ats-tide-event-text{font-size:13px}.ats-tide-chart{margin-left:-4px;margin-right:-4px}}</style>`;
  document.head.insertAdjacentHTML("beforeend", style);
  const findCard = () => {
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")];
    const h = headings.find((x) =>
      /海況の使い方|木更津のタイドグラフ/.test(x.textContent || ""),
    );
    if (h) return h.closest(".card") || h.closest("section") || h.parentElement;
    const cards = [...document.querySelectorAll(".card")];
    return (
      cards.find((c) =>
        /海況の使い方|次の満潮|次の干潮/.test(c.textContent || ""),
      ) || null
    );
  };
  const makeChart = (vals, events, now) => {
    const w = 720,
      h = 350,
      pl = 48,
      pr = 20,
      pt = 34,
      pb = 46,
      min0 = Math.min(...vals),
      max0 = Math.max(...vals),
      range = Math.max(20, max0 - min0),
      min = Math.floor((min0 - range * 0.12) / 10) * 10,
      max = Math.ceil((max0 + range * 0.12) / 10) * 10,
      span = max - min,
      xHour = (v) => pl + (v * (w - pl - pr)) / 23,
      y = (v) => h - pb - ((v - min) * (h - pt - pb)) / span;
    const pts = vals
      .map((v, i) => `${xHour(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
    const area = `M ${xHour(0)},${h - pb} L ${pts.replaceAll(" ", ", L ")} L ${xHour(23)},${h - pb} Z`;
    const yTicks = Array.from(
      { length: 5 },
      (_, i) => min + ((max - min) * i) / 4,
    );
    const hGrid = yTicks
      .map(
        (v) =>
          `<line class="ats-tide-grid" x1="${pl}" x2="${w - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ats-tide-small" x="${pl - 9}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`,
      )
      .join("");
    const times = [0, 3, 6, 9, 12, 15, 18, 21, 23];
    const vGrid = times
      .map(
        (t) =>
          `<line class="ats-tide-vgrid" x1="${xHour(t)}" x2="${xHour(t)}" y1="${pt}" y2="${h - pb}"/><text class="ats-tide-label" x="${xHour(t)}" y="${h - 14}" text-anchor="middle">${t}</text>`,
      )
      .join("");
    const evs = (events || [])
      .filter((e) => e.date === now.date)
      .map((e) => {
        const [hh, mm] = e.time.split(":").map(Number),
          xh = xHour(hh + mm / 60),
          yv = y(e.level),
          name = e.type === "high" ? "満潮" : "干潮",
          dy = e.type === "high" ? -15 : 24;
        return `<circle class="ats-tide-event-dot" cx="${xh}" cy="${yv}" r="7"/><text class="ats-tide-event-text" x="${xh}" y="${yv + dy}" text-anchor="middle">${name} ${e.time}</text>`;
      })
      .join("");
    const nowH = Math.min(23, now.hour + now.minute / 60),
      i0 = Math.floor(nowH),
      i1 = Math.min(23, i0 + 1),
      f = nowH - i0,
      cur = vals[i0] + (vals[i1] - vals[i0]) * f,
      nx = xHour(nowH),
      ny = y(cur);
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="木更津の毎時潮位グラフ"><defs><linearGradient id="atsTideFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#58c7ff" stop-opacity=".36"/><stop offset="100%" stop-color="#58c7ff" stop-opacity=".04"/></linearGradient></defs>${hGrid}${vGrid}<path class="ats-tide-area" d="${area}"/><polyline class="ats-tide-line" points="${pts}"/>${evs}<line class="ats-tide-now" x1="${nx}" x2="${nx}" y1="${pt}" y2="${h - pb}"/><circle class="ats-tide-nowdot" cx="${nx}" cy="${ny}" r="8"/><text class="ats-tide-event-text" x="${Math.min(w - pr - 28, Math.max(pl + 28, nx))}" y="${pt + 16}" text-anchor="middle">現在</text><text class="ats-tide-small" x="14" y="${pt - 10}">cm</text></svg>`;
  };
  const fmtEvent = (e) => (e ? `${e.time}　${e.level}cm` : "—");
  const fallbackData = (now) => {
    const base = Date.UTC(2026, 8, 2);
    const day = (Date.parse(`${now.date}T00:00:00Z`) - base) / 86400000;
    const period = 12.42;
    const lowHour = (((1.57 + day * 0.83) % period) + period) % period;
    const levelAt = (hour) =>
      Math.round(105 - 65 * Math.cos((2 * Math.PI * (hour - lowHour)) / period));
    const hourly = Array.from({ length: 24 }, (_, hour) => levelAt(hour));
    const events = [];

    for (let cycle = -2; cycle < 5; cycle += 1) {
      const low = lowHour + cycle * period;
      const high = low + period / 2;
      for (const [type, hour] of [
        ["low", low],
        ["high", high],
      ]) {
        if (hour < 0 || hour >= 24) continue;
        let hh = Math.floor(hour);
        let mm = Math.round((hour - hh) * 60);
        if (mm === 60) {
          hh += 1;
          mm = 0;
        }
        const time = `${pad(hh % 24)}:${pad(mm)}`;
        events.push({
          type,
          time,
          level: levelAt(hour),
          date: now.date,
          at: `${now.date}T${time}:00+09:00`,
        });
      }
    }

    return {
      date: now.date,
      hourly,
      events: events.sort((a, b) => a.time.localeCompare(b.time)),
    };
  };
  const renderFallback = (card, now) => {
    const d = fallbackData(now);
    const nowMs = Date.now();
    const high = d.events.find(
      (e) => e.type === "high" && Date.parse(e.at) > nowMs,
    );
    const low = d.events.find(
      (e) => e.type === "low" && Date.parse(e.at) > nowMs,
    );
    const current = d.hourly[Math.min(23, now.hour)];
    const next = d.hourly[Math.min(23, now.hour + 1)];
    const trend = next > current + 1 ? "上げ" : next < current - 1 ? "下げ" : "ほぼ停滞";

    card.innerHTML = `<h2>木更津のタイドグラフ</h2><p class="ats-tide-sub">${esc(d.date)}　簡易潮汐（通信障害時の参考表示）</p><div class="ats-tide-chart">${makeChart(d.hourly, d.events, now)}</div><div class="ats-tide-meta"><div class="ats-tide-box"><b>次の満潮</b><strong>${fmtEvent(high)}</strong></div><div class="ats-tide-box"><b>次の干潮</b><strong>${fmtEvent(low)}</strong></div><div class="ats-tide-box"><b>現在の傾向</b><strong>${trend}</strong></div><div class="ats-tide-box"><b>基準地点</b><strong>木更津</strong></div></div><div class="ats-tide-source">気象庁データへ接続できないため簡易計算で表示中です。<br>※航海判断には気象庁などの公式情報を確認してください。</div>`;
  };
  const run = async () => {
    const card = findCard();
    if (!card) return;
    card.classList.add("ats-tide-live");
    card.innerHTML =
      '<h2>木更津のタイドグラフ</h2><p class="ats-tide-sub">気象庁の潮位予測データを読み込み中…</p>';
    try {
      const now = jstParts();
      const r = await fetch(
        `/api/tide?date=${encodeURIComponent(now.date)}&v=3`,
        { cache: "no-store" },
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (d.error) throw new Error(d.message || d.error);
      const nowMs = Date.now();
      const high = d.events.find(
        (e) => e.type === "high" && Date.parse(e.at) > nowMs,
      );
      const low = d.events.find(
        (e) => e.type === "low" && Date.parse(e.at) > nowMs,
      );
      let nextVal;
      if (now.hour < 23) nextVal = d.hourly[now.hour + 1];
      else nextVal = d.tomorrow?.hourly?.[0];
      const cur = d.hourly[Math.min(23, now.hour)];
      const trend =
        nextVal == null
          ? "—"
          : nextVal > cur + 1
            ? "上げ"
            : nextVal < cur - 1
              ? "下げ"
              : "ほぼ停滞";
      card.innerHTML = `<h2>木更津のタイドグラフ</h2><p class="ats-tide-sub">${esc(d.date)}　気象庁の潮位予測</p><div class="ats-tide-chart">${makeChart(d.hourly, d.events, now)}</div><div class="ats-tide-meta"><div class="ats-tide-box"><b>次の満潮</b><strong>${fmtEvent(high)}</strong></div><div class="ats-tide-box"><b>次の干潮</b><strong>${fmtEvent(low)}</strong></div><div class="ats-tide-box"><b>現在の傾向</b><strong>${trend}</strong></div><div class="ats-tide-box"><b>基準地点</b><strong>木更津</strong></div></div><div class="ats-tide-source">出典：気象庁 潮位表（木更津）／単位：cm<br>黄色＝現在、白い点＝満潮・干潮<br>※航海判断には気象庁などの公式情報も確認してください。</div>`;
    } catch (e) {
      renderFallback(card, jstParts());
    }
  };
  run();
})();
