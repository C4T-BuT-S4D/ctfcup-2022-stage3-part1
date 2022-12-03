import requests
import os
import web3
import json
from web3.middleware import geth_poa_middleware
from random import randint
from checklib import *

class CheckMachine:
    def __init__(self, checker: BaseChecker):
        self.c = checker

        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'KawaiBank.json'), 'r') as f:
            self.kawaiBankAbi = f.read()
        
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Card.json'), 'r') as f:
            self.cardAbi = f.read()

        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json'), 'r') as f:
            self.config = json.load(f)

        cc = randint(0, len(self.config['CHECK_ACCOUNTS']) - 1)
        self.check_account = self.config['CHECK_ACCOUNTS'][cc]
        self.check_key = self.config['CHECK_KEYS'][cc]
        
    def get_w3(self):
        session = get_initialized_session()
        session.auth = (self.get_blockchain_token(), '')
        w3 = web3.Web3(web3.HTTPProvider(f'{self.config["BLOCKCHAIN_PROTOCOL"]}://{self.config["BLOCKCHAIN_ADDRESS"]}:{self.config["BLOCKCHAIN_PORT"]}', session=session))
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        return w3

    def get_card(self, w3, kawaibankAddr):
        kawaiBank = w3.eth.contract(address=kawaibankAddr, abi=self.kawaiBankAbi)
        cardAddr = kawaiBank.functions.card().call()
        return w3.eth.contract(address=cardAddr, abi=self.cardAbi)

    def get_blockchain_token(self):
        return self.config["BLOCKCHAIN_TOKEN"]

    def get_chain_id(self):
        return 1337

    def get_check_account(self):
        return self.check_account

    def get_check_key(self):
        return self.check_key
