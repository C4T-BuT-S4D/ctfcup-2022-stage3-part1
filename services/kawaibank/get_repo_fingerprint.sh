#!/usr/bin/env bash

find . -type f -not '(' -name '*.sol' -o -name '.drone.yml' ')' | xargs -P1 -n1 sha256sum
find . -type f
