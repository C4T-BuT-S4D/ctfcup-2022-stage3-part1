#!/usr/bin/env python3

import sys
import web3.exceptions
import time

from kawaigazprombank_box_lib import *
from checklib import *


class Checker(BaseChecker):
    vulns: int = 1
    timeout: int = 40
    uses_attack_data: bool = True

    def __init__(self, *args, **kwargs):
        super(Checker, self).__init__(*args, **kwargs)
        self.mch = CheckMachine(self)

    def action(self, action, *args, **kwargs):
        try:
            super(Checker, self).action(action, *args, **kwargs)
        except web3.exceptions.BadFunctionCallOutput:
            self.cquit(status.Status.DOWN, 'Bad call output', 'Got web3.exceptions.BadFunctionCallOutput')
        except web3.exceptions.InvalidAddress:
            self.cquit(status.Status.DOWN, 'Invalid address', 'Got web3.exceptions.InvalidAddress')
        except web3.exceptions.NameNotFound:
            self.cquit(status.Status.DOWN, 'Name not found', 'Got web3.exceptions.NameNotFound')
        except web3.exceptions.MismatchedABI:
            self.cquit(status.Status.DOWN, 'Mismatched ABI', 'Got web3.exceptions.MismatchedABI')
        except web3.exceptions.ABIFunctionNotFound:
            self.cquit(status.Status.DOWN, 'ABI function not found', 'Got web3.exceptions.ABIFunctionNotFound')
        except web3.exceptions.ValidationError:
            self.cquit(status.Status.DOWN, 'Validation error', 'Got web3.exceptions.ValidationError')
        except web3.exceptions.ContractLogicError:
            self.cquit(status.Status.DOWN, 'Contract login error', 'Got web3.exceptions.ContractLogicError')
        except ValueError as e:
            if action == 'put':
                self.cquit(Status.OK, 'checker flapped :(', 'kek')
            else:
                self.cquit(Status.OK)

    def check(self):
        try:
            w3 = self.mch.get_w3()
            exploit = self.mch.get_exploit(w3, self.host)
            nonce = w3.eth.getTransactionCount(self.mch.get_exploit_account())

            tx = exploit.functions.exploit().buildTransaction({
                'chainId': self.mch.get_chain_id(),
                'gas': 50000000,
                'gasPrice': w3.toWei(10, 'gwei'),
                'nonce': nonce
            })
            tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_exploit_key())
            tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
            r = w3.eth.wait_for_transaction_receipt(tx_hash)

            self.assert_in('status', r, 'Status not available for transaction receipt')
            self.assert_eq(r['status'], 1, "Can't run exploit")
        except:
            pass

        self.cquit(Status.OK)

    def put(self, flag_id: str, flag: str, vuln: str):
        w3 = self.mch.get_w3()
        box = self.mch.get_box(w3, self.host)
        token_id = self.mch.get_token_id()
        key = self.mch.get_key()
        nonce = w3.eth.getTransactionCount(self.mch.get_check_account())

        tx = box.functions.mint(token_id, flag, key).buildTransaction({
            'chainId': self.mch.get_chain_id(),
            'gas': 400000,
            'gasPrice': w3.toWei(10, 'gwei'),
            'nonce': nonce
        })
        tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key())
        tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        r = w3.eth.wait_for_transaction_receipt(tx_hash)

        self.assert_in('status', r, 'Status not available for transaction receipt')
        self.assert_eq(r['status'], 1, "Can't mint token")

        for kawaiGazPromBank in self.mch.get_kawaigazprombanks():
            if kawaiGazPromBank == self.host:
                continue

            try:
                exploit = self.mch.get_exploit(w3, kawaiGazPromBank)
                nonce = w3.eth.getTransactionCount(self.mch.get_attack_data_account())

                tx = exploit.functions.addBoxAttackData({
                    'kawaiGazPromBank': self.host,
                    'tokenId': token_id
                }).buildTransaction({
                    'chainId': self.mch.get_chain_id(),
                    'gas': 400000,
                    'gasPrice': w3.toWei(10, 'gwei'),
                    'nonce': nonce
                })
                tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_attack_data_key())
                tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
                r = w3.eth.wait_for_transaction_receipt(tx_hash)

                self.assert_in('status', r, 'Status not available for transaction receipt')
            except:
                pass

        self.cquit(Status.OK, f'{self.host}:{token_id}', f'{key}:{token_id}:{time.time()}')

    def get(self, flag_id: str, flag: str, vuln: str):
        if flag_id == 'kek':
            self.cquit(Status.OK, 'OK')

        key, token_id, ts = flag_id.split(':')
        if float(ts) + 60 > time.time():
            self.cquit(Status.OK)
        w3 = self.mch.get_w3()
        box = self.mch.get_box(w3, self.host)
        data = box.functions.tokenURI(int(token_id), key).call()
        self.assert_eq(flag, data, 'tokenURI is invalid', status=Status.CORRUPT)
        self.cquit(Status.OK)


if __name__ == '__main__':
    c = Checker(sys.argv[2])

    try:
        c.action(sys.argv[1], *sys.argv[3:])
    except c.get_check_finished_exception():
        cquit(Status(c.status), c.public, c.private)
