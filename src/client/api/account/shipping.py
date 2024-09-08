# -*-coding:utf-8
from system import *


# 배송정보 저장
@api.route("PUT", "/api/account/shipping")
def _(account, params):
    account.shipping_info = params
    return account.save()