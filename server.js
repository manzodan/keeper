const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_URL = 'https://api.fantasypros.com/public/v2/json/nfl/players?ecr=included&show=pos_rank';
const ROOT_DIR = __dirname;
const RANKINGS_PATH = path.join(ROOT_DIR, 'rankings.json');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

function serveStaticFile(res, filePath) {
  const resolvedPath = path.normalize(filePath);

  fs.readFile(resolvedPath, function (error, content) {
    if (error) {
      if (error.code === 'ENOENT') {
        sendJson(res, 404, { error: 'Not found' });
      } else {
        sendJson(res, 500, { error: 'Internal server error' });
      }
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.ico': 'image/x-icon'
    };

    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

async function refreshRankingsSnapshot() {
  const apiKey = process.env.FANTASYPROS_API_KEY;

  if (!apiKey) {
    return false;
  }

  const response = await fetch(API_URL, {
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FantasyPros API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const players = Array.isArray(data && data.players) ? data.players : [];

  if (!players.length) {
    return false;
  }

  const normalized = players
    .filter(function (player) {
      var position = player.player_position_id || player.player_positions || player.position_id || "";
      return ["QB", "RB", "WR", "TE", "K", "DST"].indexOf(String(position).toUpperCase()) > -1;
    })
    .map(function (player, index) {
      var position = String(player.player_position_id || player.player_positions || player.position_id || "").toUpperCase();
      return {
        Rank: index + 1,
        Player: player.player_name || "",
        Pos: position,
        Team: player.player_team_id || player.team_id || "",
        ADP: 0
      };
    });

  fs.writeFileSync(RANKINGS_PATH, JSON.stringify(normalized, null, 2));
  return true;
}

async function getFantasyProsRankings() {
  try {
    await refreshRankingsSnapshot();
  } catch (error) {
    console.warn('Unable to refresh rankings snapshot:', error.message);
  }

  if (!fs.existsSync(RANKINGS_PATH)) {
    throw new Error('No rankings snapshot available. Set FANTASYPROS_API_KEY or restore rankings.json.');
  }

  return JSON.parse(fs.readFileSync(RANKINGS_PATH, 'utf8'));
}

const server = http.createServer(async function (req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/rankings') {
    try {
      const data = await getFantasyProsRankings();
      sendJson(res, 200, data);
    } catch (error) {
      sendJson(res, 500, {
        error: error.message || 'Failed to load rankings'
      });
    }
    return;
  }

  let filePath = path.join(ROOT_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

  if (!filePath.startsWith(ROOT_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  serveStaticFile(res, filePath);
});

server.listen(PORT, function () {
  console.log(`Keeper server running on http://localhost:${PORT}`);
});
