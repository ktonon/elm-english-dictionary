#!/usr/bin/env node

const BPromise = require('bluebird');
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const readline = require('readline');
const safe = require('../api/safe');
const writeElm = require('./write-elm');
const writeJs = require('./write-js');

const options = commandLineArgs([
  { name: 'minLength', alias: 'l', type: Number, defaultValue: 1 },
  { name: 'maxLength', alias: 'u', type: Number, defaultValue: 5 },
]);

const extensions = ['adj', 'adv', 'noun', 'verb'];

const consumeLicense = line => line.startsWith(' ');

const eachLine = (base, ext, cb) => new BPromise((resolve) => {
  const rs = fs.createReadStream(`${__dirname}/../wordnet/${base}.${ext}`);
  const rl = readline.createInterface({ input: rs });
  rl.on('line', line => consumeLicense(line) || cb(line));
  rl.on('close', () => resolve());
});

const indexLinePattern = /^(\S+)(.*?)(\b\d{8}\b.*)$/;
const validLemma = /^[a-z]+$/i;
const dataLinePattern = /^(\d{8})(.*?)\|([^;]+)(;(.*))?$/;

const words = {};
const defs = {};

const newWord = () => ({
  instances: [],
});

const parseIndex = ext =>
  eachLine('index', ext, (line) => {
    const m = line.match(indexLinePattern);
    if (!m) { return; }
    const lemma = m[1];
    if (!validLemma.test(lemma)) {
      return;
    }
    const w = words[safe(lemma)] || newWord();
    w.instances.push(m[3].trim().split(/\s+/));
    words[safe(lemma)] = w;
  });

const parseData = ext =>
  eachLine('data', ext, (line) => {
    const m = line.match(dataLinePattern);
    if (!m) {
      throw new Error(line);
    }
    defs[m[1]] = [
      ext,
      m[3].trim(),
    ];
    if (m[4]) {
      const x = m[4] && m[4].trim();
      defs[m[1]].push(x.slice(3, x.length - 1).split('"; "'));
    }
    // rest: m[2].trim(),
  });

const processTasks = extensions.reduce((t, ext) =>
  t.concat([parseData(ext), parseIndex(ext)]), []);

BPromise.all(processTasks).then(() => {
  writeElm({
    l: options.minLength,
    u: options.maxLength,
    words,
  });
  writeJs({ words, defs });
});
