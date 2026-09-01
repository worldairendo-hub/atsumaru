module.exports = async (req, res) => {
  const stations = { KZ: "木更津", TT: "館山", Z1: "油壺", OK: "岡田" };
  const requestedStation = String(req.query.station || "KZ").toUpperCase();
  const station = stations[requestedStation] ? requestedStation : "KZ";
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const addDay = (y, m, d) => {
    const x = new Date(Date.UTC(y, m - 1, d) + 86400000);
    return [x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()];
  };
  const parseDay = (txt, y, m, d) => {
    const yy = y % 100;
    const line = txt
      .split("\n")
      .find(
        (s) =>
          s.length >= 136 &&
          Number(s.slice(72, 74)) === yy &&
          Number(s.slice(74, 76)) === m &&
          Number(s.slice(76, 78)) === d &&
          s.slice(78, 80) === station,
      );
    if (!line) return null;
    const hourly = Array.from({ length: 24 }, (_, i) =>
      Number(line.slice(i * 3, i * 3 + 3)),
    );
    const parseEvents = (start, type) =>
      Array.from({ length: 4 }, (_, i) => {
        const o = start + i * 7;
        const tr = line.slice(o, o + 4).trim();
        const lr = line.slice(o + 4, o + 7).trim();
        if (!tr || tr === "9999" || lr === "999") return null;
        const t = Number(tr),
          hh = Math.floor(t / 100),
          mm = t % 100,
          time = `${pad(hh)}:${pad(mm)}`;
        return {
          type,
          time,
          level: Number(lr),
          date: iso(y, m, d),
          at: `${iso(y, m, d)}T${time}:00+09:00`,
        };
      }).filter(Boolean);
    return {
      date: iso(y, m, d),
      hourly,
      events: [...parseEvents(80, "high"), ...parseEvents(108, "low")],
    };
  };
  try {
    const q = String(req.query.date || "");
    const mt = q.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    let y, m, d;
    if (mt) {
      y = Number(mt[1]);
      m = Number(mt[2]);
      d = Number(mt[3]);
    } else {
      const p = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());
      const g = (k) => Number(p.find((x) => x.type === k).value);
      y = g("year");
      m = g("month");
      d = g("day");
    }
    const [ny, nm, nd] = addDay(y, m, d);
    const years = [...new Set([y, ny])];
    const texts = {};
    for (const yr of years) {
      const u = `https://www.data.jma.go.jp/kaiyou/data/db/tide/suisan/txt/${yr}/${station}.txt`;
      const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) throw new Error(`JMA ${r.status}`);
      texts[yr] = await r.text();
    }
    const today = parseDay(texts[y], y, m, d);
    const tomorrow = parseDay(texts[ny], ny, nm, nd);
    if (!today) throw new Error("day not found");
    const events = [...(today.events || []), ...(tomorrow?.events || [])].sort(
      (a, b) => Date.parse(a.at) - Date.parse(b.at),
    );
    res.setHeader(
      "Cache-Control",
      "s-maxage=21600, stale-while-revalidate=86400",
    );
    res
      .status(200)
      .json({
        station,
        name: stations[station],
        unit: "cm",
        source: "気象庁 潮位表",
        source_url: `https://www.data.jma.go.jp/kaiyou/db/tide/suisan/suisan.php?stn=${station}`,
        date: today.date,
        hourly: today.hourly,
        tomorrow: tomorrow
          ? { date: tomorrow.date, hourly: tomorrow.hourly }
          : null,
        events,
      });
  } catch (e) {
    res.status(500).json({ error: "tide_fetch_failed", message: e.message });
  }
};
