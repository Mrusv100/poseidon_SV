export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SPORTS_KEYWORDS = [
    'nba', 'nfl', 'mlb', 'nhl', 'wnba', 'ncaa',
    'soccer', 'futbol', 'football', 'premier-league', 'la-liga', 'laliga',
    'serie-a', 'bundesliga', 'ligue-1', 'champions-league', 'uefa', 'fifa',
    'world-cup', 'copa', 'libertadores', 'mls',
    'tennis', 'atp', 'wta', 'wimbledon', 'us-open', 'roland-garros', 'australian-open',
    'golf', 'pga', 'nascar', 'f1', 'formula-1',
    'ufc', 'mma', 'boxing', 'box',
    'lol', 'league-of-legends', 'worlds', 'csgo', 'cs2', 'counter-strike',
    'valorant', 'dota', 'esports', 'esl', 'major'
  ];

  function isSportsTrade(trade) {
    const haystack = `${trade.slug || ''} ${trade.eventSlug || ''} ${trade.title || ''}`.toLowerCase();
    return SPORTS_KEYWORDS.some((k) => haystack.includes(k));
  }

  function secondsAgoLabel(unixSeconds) {
    const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return `hace ${Math.floor(diff / 86400)} d`;
  }

  function formatTrade(t) {
    const amountUsd = Math.round((t.size || 0) * (t.price || 0));
    return {
      wallet: t.proxyWallet,
      walletShort: t.proxyWallet ? `${t.proxyWallet.slice(0, 6)}…${t.proxyWallet.slice(-4)}` : null,
      market: t.title,
      pick: t.outcome,
      side: (t.side || '').toUpperCase(),
      sizeTokens: t.size,
      priceCents: Math.round((t.price || 0) * 100),
      amountUsd,
      timestamp: t.timestamp,
      timeAgo: t.timestamp ? secondsAgoLabel(t.timestamp) : null,
      slug: t.slug,
      eventSlug: t.eventSlug,
      walletUrl: t.proxyWallet ? `https://polymarket.com/profile/${t.proxyWallet}` : null,
      marketUrl: t.eventSlug
        ? `https://polymarket.com/event/${t.eventSlug}`
        : t.slug
        ? `https://polymarket.com/event/${t.slug}`
        : null,
      txHash: t.transactionHash
    };
  }

  const minUsd = Number(req.query.min || 10000);
  const limit = Math.min(Number(req.query.limit || 30), 100);

  try {
    const url = `https://data-api.polymarket.com/trades?limit=500&filterType=CASH&filterAmount=${minUsd}`;
    const r = await fetch(url, { headers: { accept: 'application/json' } });

    if (!r.ok) {
      return res.status(502).json({ error: `Polymarket API respondió ${r.status}` });
    }

    const trades = await r.json();
    const sportsTrades = Array.isArray(trades) ? trades.filter(isSportsTrade) : [];
    const formatted = sportsTrades.slice(0, limit).map(formatTrade);

    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

    res.status(200).json({
      updatedAt: new Date().toISOString(),
      minUsd,
      count: formatted.length,
      trades: formatted
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error desconocido' });
  }
}
