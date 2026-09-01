const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'rankings.json');
const POSITIONS = ['QB', 'RB', 'WR', 'TE'];
const FANTASYPROS_HALF_PPR_URL = 'https://www.fantasypros.com/nfl/rankings/half-point-ppr-cheatsheets.php';

async function fetchText(url, headers = {}) {
  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FantasyPros request failed (${response.status}): ${text}`);
  }

  return response.text();
}

function extractPlayersArray(html) {
  const marker = '"players"';
  const startIndex = html.indexOf(marker);

  if (startIndex === -1) {
    return [];
  }

  const arrayOpenIndex = html.indexOf('[', startIndex);
  if (arrayOpenIndex === -1) {
    return [];
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = arrayOpenIndex; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(html.slice(arrayOpenIndex, index + 1));
      }
    }
  }

  return [];
}

function parsePlayersFromHtml(html) {
  const players = extractPlayersArray(html);

  if (!Array.isArray(players) || players.length === 0) {
    return [];
  }

  return players
    .map((player) => normalizePlayer(player))
    .filter(Boolean)
    .filter((player) => POSITIONS.includes(player.Pos))
    .sort((a, b) => Number(a.Rank) - Number(b.Rank));
}

function normalizePlayer(player, fallbackPosition) {
  const playerName = player.player_name || player.Player || '';
  const position = String(player.player_position_id || player.player_positions || player.position_id || fallbackPosition || '').toUpperCase();
  const team = player.player_team_id || player.team_id || player.Team || '';

  if (!playerName || !team || !position) {
    return null;
  }

  const rank = Number(player.rank_ecr ?? player.Rank ?? 9999);
  const posRank = player.pos_rank || player.PosRank || player.posRank || '';
  const bye = Number(player.player_bye_week ?? player.bye_week ?? player.Bye ?? player.bye ?? 0);

  return {
    Rank: rank,
    Player: playerName,
    Pos: position,
    Team: team,
    PosRank: posRank,
    Bye: bye,
  };
}

async function fetchPlayers() {
  const apiKey = process.env.FANTASYPROS_API_KEY;

  if (apiKey) {
    const data = await fetchJson('https://api.fantasypros.com/public/v2/json/nfl/2026/consensus-rankings?scoring=HALF&week=0&experts=show&limit=500', {
      'x-api-key': apiKey,
      Accept: 'application/json',
    });

    const players = Array.isArray(data && data.players) ? data.players : [];
    return players
      .map((player) => normalizePlayer(player))
      .filter(Boolean)
      .filter((player) => POSITIONS.includes(player.Pos))
      .sort((a, b) => Number(a.Rank) - Number(b.Rank));
  }

  const html = await fetchText(FANTASYPROS_HALF_PPR_URL, {
    'User-Agent': 'Mozilla/5.0',
    Accept: 'text/html,application/xhtml+xml',
  });

  return parsePlayersFromHtml(html);
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FantasyPros API error (${response.status}): ${text}`);
  }

  return response.json();
}

async function main() {
  const players = await fetchPlayers();

  if (!players.length) {
    throw new Error('No rankings found from FantasyPros');
  }

  const combined = [];
  const seen = new Set();

  for (const player of players) {
    const key = `${player.Player}|${player.Team}|${player.Pos}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    combined.push(player);
  }

  combined.sort((a, b) => Number(a.Rank) - Number(b.Rank));
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(combined, null, 2) + '\n');
  console.log(`Wrote ${combined.length} rankings to ${OUTPUT_PATH}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  extractPlayersArray,
  normalizePlayer,
  parsePlayersFromHtml,
};
