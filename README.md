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

Player rankings are loaded from the FantasyPros public v2 rankings API via a small local server. The actual API key is stored in the server environment as `FANTASYPROS_API_KEY` and is never exposed to the browser.

To run locally:

1. Set the environment variable in your shell:
   export FANTASYPROS_API_KEY="YOUR_API_KEY"
2. Start the app:
   npm start
3. Open the page in a browser.

The legacy rankings.json file is no longer the source of truth for the draft.

League Presets
==============

You can preset keepers so that clicking the CLICK HERE FOR KEEPER PRESETS link autofills the keepers for your draft. I plan to make this option available via the Keeper homepage in the future, but for now you'll need to download and install the files on your own server, and edit draft.js.

Originally from trevorpostma, updated by manzodan
