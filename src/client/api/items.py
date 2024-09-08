# -*-coding:utf-8
from system import *


# 제품목록 가져오기
@api.route("GET", "/api/items")
def _(self, params):
    query = db.items.query()
    query = query.filter(db.items.status == "공개")
    query = query.order(-db.items.created_at, db.items.key)
    return query.fetch()


# 제품목록 가져오기
@api.route("GET", "/api/items/<category>")
def _(self, category, tag, params):
    query = db.items.query()
    query = query.filter(db.items.status == "공개")
    query = query.filter(db.items.tag_categories == category)
    query = query.order(-db.items.created_at, db.items.key)
    return query.fetch()


# 제품목록 가져오기
@api.route("GET", "/api/items/<category>/<tag>")
def _(self, category, tag, params):
    query = db.items.query()
    query = query.filter(db.items.status == "공개")
    query = query.filter(db.items.tag_categories == category)
    query = query.filter(db.items.tags == tag)
    query = query.order(-db.items.created_at, db.items.key)
    return query.fetch()
    # return fetch_page(query, params, limit)


# 제품 상세정보 가져오기
@api.route("GET", "/api/items/<id>")
def _(self, id, params):
    item = db.items.load(id)

    if not item:
        return None

    if item.status == "비공개":
        return None

    item = item.toObject()

    query = db.items.query(db.items.status == "공개")
    query = query.filter(db.items.created_at < item.created_at)
    query = query.order(-db.items.created_at, db.items.key)
    item["prev"] = query.get()

    query = db.items.query(db.items.status == "공개")
    query = query.filter(db.items.created_at > item.created_at)
    query = query.order(db.items.created_at, db.items.key)
    item["next"] = query.get()

    return item


# @api.route("GET", "/api/items.xml")
import dicttoxml
import urlparse


class XML(WebApp.RequestHandler):
    def get(self):
        params = self.request.params

        index = -1

        products = list()

        while (True):
            index += 1
            product_id = params.get("product[%d][id]" % index)
            if not product_id:
                break

            item = db.items.load(int(product_id)).toObject()

            # make XML

            product = dict()
            product["id"] = item.id
            product["name"] = item.name
            product["basePrice"] = item.price
            product["taxType"] = ""
            product["infoUrl"] = "https://grafikplastic.com/product/%s" % item.id

            if item.naver_thumbnail:
                product["imageUrl"] = item.naver_thumbnail.get("src")
            elif item.thumbnail:
                product["imageUrl"] = item.thumbnail.get("src")

            product["status"] = "ON_SALE"

            shippingPolicy = dict()
            shippingPolicy["groupId"] = "grafik"
            shippingPolicy["method"] = "DELIVERY"
            shippingPolicy["feePayType"] = "PREPAYED"

            shippingPolicy["baseFee"] = 3000
            shippingPolicy["feeRule"] = {
                "freeByThreshold": 50000
            }

            shippingPolicy["feePrice"] = 3000
            shippingPolicy["conditionalFree"] = {
                "basePrice": 50000
            }

            product["shippingPolicy"] = shippingPolicy

            products.append(product)

        xml = dicttoxml.dicttoxml(products, custom_root="products", attr_type=False, item_func=lambda x: 'product')

        self.response.headers["Content-Type"] = "text/xml; charset=utf-8"
        self.response.write(xml)
