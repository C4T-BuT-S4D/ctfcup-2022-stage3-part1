#!/usr/bin/env sh

if ! [ -d "/data/geth" ]; then
  geth init "/config/genesis.json" --datadir=/data
  ls /data

  cp /config/keystore/* /data/keystore/
fi

networkid=$(cat /config/genesis.json | jq '.config.chainId')

exec geth --datadir=/data \
--allow-insecure-unlock \
--networkid="$networkid" \
--nodiscover --mine \
--miner.gaslimit=134217728 --miner.gastarget=134217728 \
--password="/config/password.txt" --unlock="0" \
--http --http.api=eth,net,web3 --http.addr=0.0.0.0 --http.port=8545 --http.corsdomain='*' --http.vhosts='*'
