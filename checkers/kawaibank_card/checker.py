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
        self.cquit(Status.OK)

    def get(self, flag_id: str, flag: str, vuln: str):
        self.cquit(Status.OK)


if __name__ == '__main__':
    c = Checker(sys.argv[2])

    try:
        c.action(sys.argv[1], *sys.argv[3:])
    except c.get_check_finished_exception():
        cquit(Status(c.status), c.public, c.private)
