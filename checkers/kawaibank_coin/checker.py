#!/usr/bin/env python3

import sys
import web3.exceptions

from kawaibank_coin_lib import *
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
        w3 = self.mch.get_w3()

        exploit = self.mch.get_exploit(w3, kawaiBank)
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
        self.cquit(Status.OK)

    def put(self, flag_id: str, flag: str, vuln: str):
        w3 = self.mch.get_w3()
        coin = self.mch.get_coin(w3, self.host)
        item_id = self.mch.get_item_id()
        nonce = w3.eth.getTransactionCount(self.mch.get_check_account())

        tx = coin.functions.sellItem(item_id, flag, self.mch.get_item_cost()).buildTransaction({
            'chainId': self.mch.get_chain_id(),
            'gas': 400000,
            'gasPrice': w3.toWei(10, 'gwei'),
            'nonce': nonce
        })
        tx_signed = w3.eth.account.signTransaction(tx, private_key=self.mch.get_check_key())
        tx_hash = w3.eth.send_raw_transaction(tx_signed.rawTransaction)
        r = w3.eth.wait_for_transaction_receipt(tx_hash)

        self.assert_in('status', r, 'Status not available for transaction receipt')
        self.assert_eq(r['status'], 1, "Can't sell item")

        for kawaiBank in kawaiBanks:
            if kawaiBank == self.host:
                continue

            exploit = self.mch.get_exploit(w3, self.host)
            nonce = w3.eth.getTransactionCount(self.mch.get_attack_data_account())

            tx = exploit.functions.addCoinAttackData({
                'kawaiBank': self.host,
                'itemId': item_id
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

        self.cquit(Status.OK, f'{self.host}:{item_id}', f'{self.mch.get_check_account()}:{item_id}')

    def get(self, flag_id: str, flag: str, vuln: str):
        check_account, item_id = flag_id.split(':')
        w3 = self.mch.get_w3()
        coin = self.mch.get_coin(w3, self.host)
        data = coin.functions.viewItem(int(item_id)).call({'from': check_account})
        self.assert_eq(flag, data, 'viewItem is invalid', status=Status.CORRUPT)
        self.cquit(Status.OK)


if __name__ == '__main__':
    c = Checker(sys.argv[2])

    try:
        c.action(sys.argv[1], *sys.argv[3:])
    except c.get_check_finished_exception():
        cquit(Status(c.status), c.public, c.private)
