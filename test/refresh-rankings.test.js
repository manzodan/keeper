const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePlayersFromHtml, buildFantasyProsRankingsUrl } = require('../scripts/refresh-rankings.js');

test('buildFantasyProsRankingsUrl includes a valid position filter', () => {
  const url = buildFantasyProsRankingsUrl();

  assert.match(url, /position=ALL/i);
  assert.match(url, /consensus-rankings\?/i);
});

test('parsePlayersFromHtml extracts the live half-point PPR rankings payload', () => {
  const html = `
    <script>
      window.FP = {"players":[
        {"player_name":"Jahmyr Gibbs","player_team_id":"DET","player_position_id":"RB","player_positions":"RB","rank_ecr":1,"pos_rank":"RB1","player_bye_week":"6"},
        {"player_name":"Bijan Robinson","player_team_id":"ATL","player_position_id":"RB","player_positions":"RB","rank_ecr":2,"pos_rank":"RB2","player_bye_week":"11"},
        {"player_name":"Ja'Marr Chase","player_team_id":"CIN","player_position_id":"WR","player_positions":"WR","rank_ecr":3,"pos_rank":"WR1","player_bye_week":"6"},
        {"player_name":"Josh Allen","player_team_id":"BUF","player_position_id":"QB","player_positions":"QB","rank_ecr":4,"pos_rank":"QB1","player_bye_week":"13"},
        {"player_name":"Trey McBride","player_team_id":"ARI","player_position_id":"TE","player_positions":"TE","rank_ecr":5,"pos_rank":"TE1","player_bye_week":"9"},
        {"player_name":"David Njoku","player_team_id":"CLE","player_position_id":"TE","player_positions":"TE","rank_ecr":6,"pos_rank":"TE2","player_bye_week":"5"},
        {"player_name":"Ka'imi Fairbairn","player_team_id":"HOU","player_position_id":"K","player_positions":"K","rank_ecr":100,"pos_rank":"K1","player_bye_week":"8"}
      ]};
    </script>
  `;

  const players = parsePlayersFromHtml(html);

  assert.deepEqual(players.map((player) => player.Player), [
    'Jahmyr Gibbs',
    'Bijan Robinson',
    'Ja\'Marr Chase',
    'Josh Allen',
    'Trey McBride',
    'David Njoku',
  ]);

  assert.equal(players[0].Rank, 1);
  assert.equal(players[0].PosRank, 'RB1');
  assert.equal(players[0].Bye, 6);
  assert.equal(players[3].Rank, 4);
  assert.equal('ADP' in players[0], false);
  assert.equal(players.length, 6);
});
