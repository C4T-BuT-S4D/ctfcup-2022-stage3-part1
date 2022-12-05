#!/usr/bin/env python3

import sys
import web3.exceptions

from kawaibank_card_lib import *
from checklib import *


class Checker(BaseChecker):
    vulns: int = 1
    timeout: int = 20
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

    def check(self):
        self.cquit(Status.OK)

    def put(self, flag_id: str, flag: str, vuln: str):
        # w3 = self.mch.get_w3()
        # card = self.mch.get_card(w3, self.host)
        # card_id1 = self.mch.get_card_id()
        # card_id2 = self.mch.get_card_id()
        # gift_id = self.mch.get_gift_id()
        # sign_id = self.mch.get_sign_id()
        # key = self.mch.get_key()
        # nonce1 = w3.eth.getTransactionCount(self.mch.get_check_account1())
        # nonce2 = w3.eth.getTransactionCount(self.mch.get_check_account2())

        # tx = card.functions.create(card_id1, flag.encode()).buildTransaction({
        #     'value': w3.toWei(10, 'gwei'),
        #     'chainId': self.mch.get_chain_id(),
        #     'gas': 400000,
        #     'gasPrice': w3.toWei(10, 'gwei'),
        #     'nonce': nonce1
        # })
        # tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key1())
        # tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        # r = w3.eth.wait_for_transaction_receipt(tx_hash)

        # self.assert_in('status', r, 'Status not available for transaction receipt')
        # self.assert_eq(r['status'], 1, "Can't create card")

        # tx = card.functions.create(card_id2, self.mch.get_key().encode()).buildTransaction({
        #     'value': w3.toWei(10, 'gwei'),
        #     'chainId': self.mch.get_chain_id(),
        #     'gas': 400000,
        #     'gasPrice': w3.toWei(10, 'gwei'),
        #     'nonce': nonce2
        # })
        # tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key2())
        # tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        # r = w3.eth.wait_for_transaction_receipt(tx_hash)

        # self.assert_in('status', r, 'Status not available for transaction receipt')
        # self.assert_eq(r['status'], 1, "Can't create card")

        # tx = card.functions.createGift(
        #     gift_id,
        #     card_id1,
        #     self.mch.get_check_account2(),
        #     w3.toWei(5, 'gwei'),
        #     key.encode()
        # ).buildTransaction({
        #     'chainId': self.mch.get_chain_id(),
        #     'gas': 400000,
        #     'gasPrice': w3.toWei(10, 'gwei'),
        #     'nonce': nonce1 + 1
        # })
        # tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key1())
        # tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        # r = w3.eth.wait_for_transaction_receipt(tx_hash)

        # self.assert_in('status', r, 'Status not available for transaction receipt')
        # self.assert_eq(r['status'], 1, "Can't create gift")

        # tx = card.functions.spendGift(
        #     card_id1,
        #     gift_id,
        #     w3.toWei(5, 'gwei'),
        #     card_id2,
        #     sign_id
        # ).buildTransaction({
        #     'chainId': self.mch.get_chain_id(),
        #     'gas': 400000,
        #     'gasPrice': w3.toWei(10, 'gwei'),
        #     'nonce': nonce2 + 1
        # })
        # tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key2())
        # tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        # r = w3.eth.wait_for_transaction_receipt(tx_hash)

        # self.assert_in('status', r, 'Status not available for transaction receipt')
        # self.assert_eq(r['status'], 1, "Can't spend gift")

        self.cquit(Status.OK)

    def get(self, flag_id: str, flag: str, vuln: str):
        self.cquit(Status.OK)


if __name__ == '__main__':
    c = Checker(sys.argv[2])

    try:
        c.action(sys.argv[1], *sys.argv[3:])
    except c.get_check_finished_exception():
        cquit(Status(c.status), c.public, c.private)