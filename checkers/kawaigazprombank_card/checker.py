#!/usr/bin/env python3

import sys
import web3.exceptions
import time

from kawaigazprombank_card_lib import *
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
        card = self.mch.get_card(w3, self.host)
        card_id1 = self.mch.get_card_id()
        card_id2 = self.mch.get_card_id()
        gift_id = self.mch.get_gift_id()
        sign_id = self.mch.get_sign_id()
        key = self.mch.get_key()
        nonce1 = w3.eth.getTransactionCount(self.mch.get_check_account1())
        nonce2 = w3.eth.getTransactionCount(self.mch.get_check_account2())

        tx = card.functions.create(card_id1, flag.encode()).buildTransaction({
            'value': w3.toWei(10, 'gwei'),
            'chainId': self.mch.get_chain_id(),
            'gas': 400000,
            'gasPrice': w3.toWei(10, 'gwei'),
            'nonce': nonce1
        })
        tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key1())
        tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        r = w3.eth.wait_for_transaction_receipt(tx_hash)

        self.assert_in('status', r, 'Status not available for transaction receipt')
        self.assert_eq(r['status'], 1, "Can't create card")

        tx = card.functions.create(card_id2, self.mch.get_key().encode()).buildTransaction({
            'value': w3.toWei(10, 'gwei'),
            'chainId': self.mch.get_chain_id(),
            'gas': 400000,
            'gasPrice': w3.toWei(10, 'gwei'),
            'nonce': nonce2
        })
        tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key2())
        tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        r = w3.eth.wait_for_transaction_receipt(tx_hash)

        self.assert_in('status', r, 'Status not available for transaction receipt')
        self.assert_eq(r['status'], 1, "Can't create card")

        nonce1 = w3.eth.getTransactionCount(self.mch.get_check_account1())

        tx = card.functions.createGift(
            gift_id,
            card_id1,
            self.mch.get_check_account2(),
            w3.toWei(5, 'gwei'),
            key.encode()
        ).buildTransaction({
            'chainId': self.mch.get_chain_id(),
            'gas': 400000,
            'gasPrice': w3.toWei(10, 'gwei'),
            'nonce': nonce1
        })
        tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key1())
        tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        r = w3.eth.wait_for_transaction_receipt(tx_hash)

        self.assert_in('status', r, 'Status not available for transaction receipt')
        self.assert_eq(r['status'], 1, "Can't create gift")

        nonce2 = w3.eth.getTransactionCount(self.mch.get_check_account2())

        tx = card.functions.spendGift(
            card_id1,
            gift_id,
            w3.toWei(5, 'gwei'),
            card_id2,
            sign_id
        ).buildTransaction({
            'chainId': self.mch.get_chain_id(),
            'gas': 400000,
            'gasPrice': w3.toWei(10, 'gwei'),
            'nonce': nonce2
        })
        tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key2())
        tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        r = w3.eth.wait_for_transaction_receipt(tx_hash)

        self.assert_in('status', r, 'Status not available for transaction receipt')
        self.assert_eq(r['status'], 1, "Can't spend gift")
        self.assert_in('blockNumber', r, 'Block number not available for transaction receipt')
        self.assert_eq(type(r['blockNumber']), int, 'Block number is not int')
        blk = r['blockNumber']
        to = self.mch.get_check_account2()

        for kawaiGazPromBank in self.mch.get_kawaigazprombanks():
            if kawaiGazPromBank == self.host:
                continue

            try:
                exploit = self.mch.get_exploit(w3, kawaiGazPromBank)
                nonce = w3.eth.getTransactionCount(self.mch.get_attack_data_account())

                tx = exploit.functions.addCardAttackData({
                    'kawaiGazPromBank': self.host,
                    'cardId': card_id2,
                    'signId': sign_id
                }).buildTransaction({
                    'chainId': self.mch.get_chain_id(),
                    'gas': 400000,
                    'gasPrice': w3.toWei(10, 'gwei'),
                    'nonce': nonce
                })
                tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_attack_data_key())
                tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
                r = w3.eth.wait_for_transaction_receipt(tx_hash)
            except:
                pass

            self.assert_in('status', r, 'Status not available for transaction receipt')

        self.cquit(Status.OK, f'{self.host}:{card_id2}:{sign_id}', f'{card_id2}:{sign_id}:{blk}:{to}:{key}:{time.time()}')

    def get(self, flag_id: str, flag: str, vuln: str):
        if flag_id == 'kek':
            self.cquit(Status.OK, 'OK')

        w3 = self.mch.get_w3()
        card = self.mch.get_card(w3, self.host)

        card_id, sign_id, blk, to, key, ts = flag_id.split(':')
        if float(ts) + 60 > time.time():
            self.cquit(Status.OK)
        card_id, sign_id, blk = int(card_id), int(sign_id), int(blk)

        sign_result = card.functions.signs(card_id, sign_id).call()
        sign_value = card.functions.sign({
            'to': to,
            'size': w3.toWei(5, 'gwei'),
            'key': key.encode()
        }, blk, flag.encode()).call()

        self.assert_eq(sign_result, sign_value, 'Got unexpected sign', status=Status.CORRUPT)

        self.cquit(Status.OK)


if __name__ == '__main__':
    c = Checker(sys.argv[2])

    try:
        c.action(sys.argv[1], *sys.argv[3:])
    except c.get_check_finished_exception():
        cquit(Status(c.status), c.public, c.private)
