#!/usr/bin/env node

const BPromise = require('bluebird');
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const readline = require('readline');

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
    if (lemma.length < options.minLength
      || lemma.length > options.maxLength
      || !validLemma.test(lemma)) {
      return;
    }
    const w = words[lemma] || newWord();
    w.instances.push({
      ids: m[3].trim().split(/\s+/),
      rest: m[2].trim().split(/\s+/),
    });
    words[lemma] = w;
  });

const parseData = ext =>
  eachLine('data', ext, (line) => {
    const m = line.match(dataLinePattern);
    if (!m) {
      throw new Error(line);
    }
    defs[m[1]] = {
      def: m[3].trim(),
      example: m[4] && m[4].trim(),
      rest: m[2].trim(),
    };
  });

const processTasks = extensions.reduce((t, ext) =>
  t.concat([parseData(ext), parseIndex(ext)]), []);


BPromise.all(processTasks).then(() => {
  const l = options.minLength;
  const u = options.maxLength;
  const modName = `Words${l}To${u}`;
  const out = fs.openSync(`${__dirname}/../elm/${modName}.elm`, 'w');
  const write = val => fs.writeSync(out, val);

  const lemmas = Object.keys(words);
  write(`module ${modName} exposing (words)

import Set


words : Set.Set String
words =
    """${lemmas.join('\n')}"""
        |> String.split "\\n"
        |> Set.fromList
    `);

  fs.closeSync(out);
});
