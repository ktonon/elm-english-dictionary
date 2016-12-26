const fs = require('fs');
const extract = require('../api/safe').extract;

module.exports = ({ l, u, words }) => {
  const modName = `Words${l}To${u}`;
  const out = fs.openSync(`${__dirname}/../app/${modName}.elm`, 'w');
  const write = val => fs.writeSync(out, val);

  const lemmas = Object.keys(words).map(extract).filter(lemma => (
    lemma.length >= l && lemma.length <= u
  ));
  write(`module ${modName} exposing (words)

{-| List of english words of length 1 to 5

@docs words
-}

import Set


{-| List of english words of length 1 to 5
-}
words : Set.Set String
words =
    """${lemmas.sort().join('\n')}"""
        |> String.split "\\n"
        |> Set.fromList
    `);

  fs.closeSync(out);
};
