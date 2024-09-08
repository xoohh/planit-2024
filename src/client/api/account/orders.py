# -*-coding:utf-8
from system import *


# 주문목록 가져오기
@api.route("GET", "/api/account/orders")
def _(params, account):
    query = db.orders.query()
    query = query.filter(db.orders.buyer_key == account.key)
    query = query.order(-db.orders.created_at)

    return fetch_page(query, params, 20)


# 주문 상세정보 가져오기
@api.route("GET", "/api/account/orders/<id>")
def _(id, params, account):
    order = db.orders.load(id)
    if not order:
        return None

    if account.type == "관리자" or account.key == order.buyer_key:
        return order

    return None, 401


from google.appengine.api import urlfetch
import urllib


import dicttoxml




# 주문하기
@api.route("GET", "/api/account/orders/npay")
def _(params, account):
    # order = db.orders()
    # order.cart = params.cart
    # order.price = params.cart["total"]
    #
    # order.buyer_key = account.key
    # order.buyer = account
    # order.status = "배송요청"

    params = dict()
    params["SHOP_ID"] = "FC73EA4A-AD7B-4493-81B5-39B90A7CA724"
    params["CERTI_KEY"] = "s_4288139c1eaa"

    params["ITEM_ID"] = "123"
    params["ITEM_NAME"] = "상품명"
    params["ITEM_COUNT"] = "1"
    params["ITEM_UPRICE"] = 1200
    params["ITEM_TPRICE"] = 1200
    params["ITEM_OPTION"] = "기본"
    params["ITEM_OPTION_CODE"] = ""
    params["SHIPPING_PRICE"] = 0
    params["SHIPPING_TYPE"] = "FREE"
    params["TOTAL_PRICE"] = 1200
    params["BACK_URL"] = "http://grafikplastic.com"


    query = urllib.urlencode(params)

    # return query




    # return query

    url = "https://test-api.pay.naver.com/o/customer/api/order/v20/register"
    # url = "https://pay.naver.com/customer/api/order.nhn?" + query
    url = "https://test-pay.naver.com/customer/api/order.nhn"

    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    ret = urlfetch.fetch(url=url, payload=query, method=urlfetch.POST, headers=headers, validate_certificate=True)



    # ret = order.save()
    #
    # account.cart = None
    # account.save()

    # return ret


    return ret.content



# 주문하기
@api.route("GET", "/api/account/orders/testpaypal")
def _(params, account):
    url = "https://tlstest.paypal.com"
    ret = urlfetch.fetch(url=url)
    return ret.content


