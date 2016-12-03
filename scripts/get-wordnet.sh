#!/usr/bin/env bash
if [ ! -d wordnet ]; then
  curl http://wordnetcode.princeton.edu/3.0/WordNet-3.0.tar.gz > WordNet.tar.gz
  tar -xvzf WordNet.tar.gz
  mv WordNet-3.0/dict wordnet
  rm -rf WordNet-3.0 WordNet.tar.gz
fi
