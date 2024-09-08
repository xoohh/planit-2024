# -*-coding:utf-8
from system import *


# TODO: 카트 불러오고 저장하는 함수 따로
# TODO: 카트 로그인 안될 경우 처리하는 기능 추가

# 카트 가져오기
@api.route("GET", "/api/cart")
def _(self, account):
    return db.cart.of(self).fetch(account)


# 카트에 담기
@api.route("POST", "/api/cart")
def _(self, params):
    item = db.items.load(params.key)

    if item is None:
        raise ValueError("존재하지 않는 상품입니다.")

    new_cart = db.cart()
    new_cart.rows.append(db.cart_item(key=item.key, extra=params.extra))

    cart = db.cart.of(self)
    cart.merge(new_cart)
    cart.update(self)

    return True, 201


# 카트 덮어쓰기
@api.route("PUT", "/api/cart/<id>")
def _(self, params, id):
    cart = db.cart.of(self)

    key = db.items.make_key(id)
    row, index = cart.findRowBykey(key)
    row.extra = params
    cart.update(self)

    return True, 201


# 카트 덮어쓰기
@api.route("PUT", "/api/cart")
def _(self, params):
    # cart = db.cart.create(params)
    # cart.update(self)
    return True, 201


# 카트 제품 제거
@api.route("DELETE", "/api/cart/<id>")
def _(self, id):
    key = db.items.make_key(id)
    cart = db.cart.of(self)
    cart.rows = [item for item in cart.rows if item.key != key]
    cart.update(self)
    return True, 201


# 카트 전부 제거
@api.route("DELETE", "/api/cart")
def _(self, params):
    cart = db.cart.create()
    cart.update(self)
    return True, 201
