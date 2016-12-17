const fs = require('fs');
const i = require('util').inspect;

module.exports = ({ words, defs }) => {
  const ids = {};

  Object.keys(words).forEach((safeLemma) => {
    ids[safeLemma] = words[safeLemma].instances.map(inst => inst.ids);
  });

  const out = fs.openSync(`${__dirname}/../api/words.js`, 'w');
  const write = val => fs.writeSync(out, val);

  write(`module.exports.ids = ${i(ids, { depth: null })};

module.exports.defs = ${i(defs, { depth: null })};
`);
  fs.closeSync(out);
};
