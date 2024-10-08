Keeper
======

Keeper is a fantasy football keeper league draft simulator. Users can complete a mock draft in minutes and set customized keepers for their league.

How to Use Keeper
=================

It's super easy! 

1. Go to https://manzodan.github.io/keeper/ (Hosted by GitHub Pages!)
2. Select the number of keepers and teams for your league from the dropdowns
3. Select the players to be kept along with the round they were drafted in, for each team
4. Click the Start button
5. Select your team based on draft position
6. Start drafting your team from the list of available players

Rankings
========

Player rankings are downloaded from [Fantasy Pros](http://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php) as an xls file and then converted to JSON using [Mr. Data Converter](http://shancarter.github.io/mr-data-converter/). Rankings are current as of the last commit for the rankings.json file.

Easy Excel Formula for removing numbers from player positions:
=IF(LEFT(E2,3)="DST", LEFT(E2,3), IF(LEFT(E2,1)="K", LEFT(E2,1), LEFT(E2,2)))

States that if PosRank starts with DST take 3 letters, if PosRank starts with K take 1 letter, else take 2 letters (RB, WR, TE)

League Presets
==============

You can preset keepers so that clicking the CLICK HERE FOR KEEPER PRESETS link autofills the keepers for your draft. I plan to make this option available via the Keeper homepage in the future, but for now you'll need to download and install the files on your own server, and edit draft.js.

Originally from trevorpostma, updated by manzodan
