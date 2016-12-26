const closed = { words: {}, defs: {} };

const extend = ({ words, defs }) => {
  Object.keys(words).forEach((word) => {
    let inst = (closed.words[word] && closed.words[word].instances) || [];
    inst = inst.concat(words[word].instances);
    closed.words[word] = { instances: inst };
  });
  closed.defs = Object.assign(closed.defs, defs);
};

extend(require('./conjunctions'));
extend(require('./determiners'));
extend(require('./prepositions'));
extend(require('./pronouns'));

module.exports = closed;
