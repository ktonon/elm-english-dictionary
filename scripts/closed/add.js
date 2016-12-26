const add = (type) => {
  const words = {};
  const defs = {};
  const func = (name, meaning) => {
    const safe = `~${name}`;
    const id = `${type}${safe}`;
    words[safe] = { instances: [[id]] };
    defs[id] = [type, meaning];
  };
  func.export = () => ({ words, defs });
  return func;
};

module.exports = add;
