#!/usr/bin/env bash

find . -type f -not '(' -name '*.sol' -o -name '.drone.yml' -o -path '\./\.git/*' ')' -print0 | LC_ALL=C sort -z | xargs -r0 -P1 -n1 sha256sum
find . -type f -not -path '\./\.git/*' -print0 | LC_ALL=C sort -z
