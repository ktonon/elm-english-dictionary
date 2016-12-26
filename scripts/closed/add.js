const add = (type) => {
  const words = {};
  const defs = {};
  const func = (name, meaning) => {
    const safe = `~${name}`;
    words[safe] = { instances: [[safe]] };
    defs[safe] = [type, meaning];
  };
  func.export = () => ({ words, defs });
  return func;
};

module.exports = add;
