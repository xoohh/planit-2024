# -*-coding:utf-8
import base64

from system import *

# LIVE
CLIENT = 'AXC-Z1Ha4JNZPuQk-A83q2gsocqOuun3J3sOuGJC3zvi0X4WugUDLzBO8zw5JQHNoa_9Ysn3O-gPOUGS'
SECRET = 'EDsnEmrJAC5V5MDuuOwSNTUPzHPUjbRajXr4kCUTKNbwuw7bPzDJwRYqgwGVEHMcz3sTq3AnUYAlvHau'
PAYPAL_API = 'https://api.paypal.com'

# SANDBOX
# CLIENT = 'AX0YlonvAKP0T82gaYoc4NfW1dRsJQS2PMF7_QGswz83k7UfGV_O5nvRVTVsr9ReMxPhHERBJmoyAMDY'
# SECRET = 'EOAI75LomMSlmbpfLx9QmA7s99B7nAEArY1Tfo3cR-VqaYdD7s9wzk-PJkMZ5eJU78IhiCFO4VEjE4S2'
# PAYPAL_API = 'https://api.sandbox.paypal.com'

from google.appengine.api import urlfetch
import urllib


def get_token():
    query = urllib.urlencode({"grant_type": "client_credentials"})

    url = PAYPAL_API + '/v1/oauth2/token'
    headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': 'Basic %s' % base64.b64encode("%s:%s" % (CLIENT, SECRET))
    }

    ret = urlfetch.fetch(url=url, payload=query, method=urlfetch.POST, headers=headers, validate_certificate=True)
    return JSON.parse(ret.content).get("access_token")


# 페이팔 주문 생성
@api.route("GET", "/api/paypal/token")
def _(params):
    return get_token()


@api.route("POST", "/api/paypal/create-payment")
def _(self, params, account):
    def USD(str):
        return round(parseFloat(str), 2)

    config = Object(db.configs.get("store"))

    params = Object(self.request.POST)
    params["qty"] = parseInt(params.qty)

    access_token = get_token()

    subtotal = 0

    USD_RATIO = parseFloat(config.USD_RATIO) or 1000

    if params.productId:
        item = db.items.load(params.productId)

        items = [{
            "name": item.name,
            "quantity": params.qty,
            "price": USD(item.price / USD_RATIO),
            "sku": item.pid or item.id,
            "currency": "USD"
        }]

        description = item.name
        subtotal = USD(item.price / USD_RATIO) * params.qty

    else:
        cart = db.cart.of(self).fetch(account)

        items = []
        for item in cart:
            item = Object(item)
            items.append({
                "name": item.name,
                "quantity": item.qty,
                "price": USD(item.price / USD_RATIO),
                "sku": item.pid or item.id,
                "currency": "USD"
            })

            subtotal += (USD(item.price / USD_RATIO) * item.qty)

        description = items[0]["name"] + ("+(%s)" % (len(items) - 1))

    subtotal = USD(subtotal)

    # 배송비
    if subtotal <= 9.99:
        _shipping = config.shipping_charges[0]
    elif subtotal <= 49.99:
        _shipping = config.shipping_charges[1]
    elif subtotal <= 99.99:
        _shipping = config.shipping_charges[2]
    elif subtotal <= 199.99:
        _shipping = config.shipping_charges[3]
    else:
        _shipping = config.shipping_charges[4]

    _shipping = USD(_shipping)

    paypal_params = {
        "intent": 'order',
        "payer": {
            "payment_method": 'paypal'
        },
        "transactions": [{
            "amount": {
                "total": USD(subtotal + _shipping),
                "currency": 'USD',
                "details": {
                    "shipping": _shipping,
                    "subtotal": subtotal,
                    "tax": "0"
                }
            },

            "description": description,

            "item_list": {
                "items": items
            }
        }],

        "redirect_urls": {
            "return_url": "https://grafikplastic.com",
            "cancel_url": "https://grafikplastic.com"
        }
    }

    query = JSON.stringify(paypal_params)

    url = PAYPAL_API + '/v1/payments/payment'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer %s' % access_token
    }
    ret = urlfetch.fetch(url=url, payload=query, method=urlfetch.POST, headers=headers, validate_certificate=True)

    return JSON.parse(ret.content)


@api.route("POST", "/api/paypal/execute-payment")
def _(self, params, account):
    params = Object(self.request.POST)

    access_token = get_token()

    url = PAYPAL_API + ("/v1/payments/payment/%s/execute" % params.paymentID)
    query = JSON.stringify({"payer_id": params.payerID})

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer %s' % access_token
    }

    ret = urlfetch.fetch(url=url, payload=query, method=urlfetch.POST, headers=headers, validate_certificate=True)
    ret = JSON.parse(ret.content)

    id = ret.get("id")
    if not id:
        return ret, 500

    key = ndb.Key(db.orders, ret.get("id"))
    order = key.get()
    if not order:
        order = db.orders()
        order.key = key

    order.type = "paypal"
    order.status = ret.get("state")
    order.res = ret

    ret = order.save()

    # 카트 비우기
    cart = db.cart.create()
    cart.update(self)
    return ret


@api.route("POST", "/api/paypal/orders/<id>/authorize")
def _(self, id, params, account):
    order = db.orders.load(id)

    try:
        order_id = order.res["transactions"][0]["related_resources"][0]["order"]["id"]
        amount = order.res["transactions"][0]["amount"]
        # return [order_id, amount]
    except:
        raise ValueError("잘못된 paypal 결제정보입니다.")

    access_token = get_token()

    url = PAYPAL_API + ("/v1/payments/orders/%s/authorize" % order_id)
    query = JSON.stringify({
        "amount": {
            "total": amount["total"],
            "currency": amount["currency"]
        }
    })

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer %s' % access_token
    }

    ret = urlfetch.fetch(url=url, payload=query, method=urlfetch.POST, headers=headers, validate_certificate=True)
    ret = JSON.parse(ret.content)

    return ret

    # id = ret.get("id")
    # if not id:
    #     return ret, 500
    #
    # key = ndb.Key(db.orders, ret.get("id"))
    # order = key.get()
    # if not order:
    #     order = db.orders()
    #     order.key = key
    #
    # order.type = "paypal"
    # order.status = ret.get("state")
    # order.res = ret
    #
    # ret = order.save()
    #
    # # 카트 비우기
    # cart = db.cart.create()
    # cart.update(self)
    # return ret
