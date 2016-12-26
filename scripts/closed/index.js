const closed = { words: {}, defs: {} };

const extend = ({ words, defs }) => ({
  words: Object.assign(closed.words, words),
  defs: Object.assign(closed.defs, defs),
});

extend(require('./conjunctions'));
extend(require('./determiners'));
extend(require('./particles'));
extend(require('./prepositions'));
extend(require('./pronouns'));

module.exports = closed;
