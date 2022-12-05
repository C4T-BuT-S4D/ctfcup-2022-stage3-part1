#!/usr/bin/env bash

find . -type f -not '(' -name '*.sol' -o -name '.drone.yml' ')' -print0 | sort -z | xargs -r0 -P1 -n1 sha256sum
find . -type f -print0 | sort -z
