# -*-coding:utf-8
from system import *

from google.appengine.api import urlfetch
import urllib


def iamport_get_access_token():
    url = "https://api.iamport.kr/users/getToken"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    params = dict()
    params["imp_key"] = "9266208936937960"
    params["imp_secret"] = "HacA0SxY9cDohvoEblYXhF1JafCwOLEvWR5WJDVSQzh84GMf1Ldjqf3AuF6irLOnCTkmxfenPwvTch9e"
    params = urllib.urlencode(params)
    ret = urlfetch.fetch(url=url, payload=params, method=urlfetch.POST, headers=headers, validate_certificate=True)
    ret = JSON.parse(ret.content)

    access_token = ret["response"]["access_token"]
    return access_token


def iamport_get_order(imp_uid):
    access_token = iamport_get_access_token()

    url = "https://api.iamport.kr/payments/%s/naver/product-orders" % imp_uid
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': access_token
    }

    ret = urlfetch.fetch(url=url, payload=None, method=urlfetch.GET, headers=headers, validate_certificate=True)

    return JSON.parse(ret.content)


def iamport_get_payments(imp_uid):
    access_token = iamport_get_access_token()

    url = "https://api.iamport.kr/payments/%s" % imp_uid
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': access_token
    }

    ret = urlfetch.fetch(url=url, payload=None, method=urlfetch.GET, headers=headers, validate_certificate=True)

    return JSON.parse(ret.content)


# 주문목록 가져오기
@api.route("GET", "/admin/api/orders")
def _(self, params, account):
    query = db.orders.query()

    if params.status:
        query = query.filter(db.orders.status == params.status)

    if params.payment_status:
        query = query.filter(db.orders.payment_status == params.payment_status)

    if params.type:
        if params.type == "naver":
            params.type = None
        query = query.filter(db.orders.type == params.type)

    if params.search:
        query = query_search(query, db.orders.search, params.search)
    else:
        query = query.order(-db.orders.created_at)

    total = query.count_async()
    rows = query.fetch(limit=params.limit, offset=params.page * params.limit)

    ret = Object.fromList(rows)
    ret["total"] = total.get_result()
    return ret


# 작품목록 가져오기
# @cond: 판매완료된 작품은 제외한다.
@api.route("GET", "/admin/api/orders/count")
def _(self, params, account):
    query = db.orders.query()
    rows = query.fetch()

    ret = Object()

    for row in rows:
        # for tag in row.tags:
        #     if not ret.has_key(tag):
        #         ret[tag] = 0
        #     ret[tag] += 1

        if not ret.has_key(row.state):
            ret[row.state] = 0
        ret[row.state] += 1

        if not ret.has_key(row.payment_status):
            ret[row.payment_status] = 0
        ret[row.payment_status] += 1

    return ret


# 주문 상세정보 가져오기
@api.route("GET", "/admin/api/orders/<id>")
def _(self, id, params, account):
    order = db.orders.load(id)
    return order


# 주문등록
@api.route("POST", "/admin/api/orders")
def _(self, params, account):
    key = ndb.Key(db.orders, params.imp_uid)
    order = key.get()
    if not order:
        order = db.orders()
        order.key = key

    order.imp_uid = params.imp_uid
    order.merchant_uid = params.merchant_uid
    order.status = params.status
    order.res = iamport_get_order(params.imp_uid)
    order.payments = iamport_get_payments(params.imp_uid)

    return order.save()


# 주문수정하기
@api.route("PUT", "/admin/api/orders/<id>")
def _(self, id, params, account):
    order = db.orders.load(id)
    order.fill(params)
    return order.save()


# 주문 삭제하기
@api.route("DELETE", "/admin/api/orders/<id>")
def _(self, id, account):
    return db.orders.delete(id)


# 주문취소
@api.route("PUT", "/admin/api/orders/<id>/주문취소")
def _(id):
    order = db.orders.load(id)
    order.status = "주문취소"
    return order.save()


# 배송중
@api.route("PUT", "/admin/api/orders/<id>/배송중")
def _(id):
    order = db.orders.load(id)
    order.status = "배송중"
    return order.save()


# 배송완료
@api.route("PUT", "/admin/api/orders/<id>/배송완료")
def _(id, params):
    order = db.orders.load(id)
    order.shipping_company = params.shipping_company
    order.shipping_code = params.shipping_code
    order.shipping_at = datetime.now()
    order.status = "배송완료"
    return order.save()


# 확인중
@api.route("PUT", "/admin/api/orders/<id>/확인중")
def _(id, params):
    order = db.orders.load(id)
    order.state = "확인중"
    return order.save()


# 확인완료
@api.route("PUT", "/admin/api/orders/<id>/확인완료")
def _(id, params):
    order = db.orders.load(id)
    order.state = "확인완료"
    return order.save()
