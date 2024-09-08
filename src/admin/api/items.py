# -*-coding:utf-8
from system import *


# @api.route("GET", "/admin/api/items/update")
# def _(self, params):
#     # items = db.items.query().fetch()
#     #
#     # for item in items:
#     #     item.save_sync()
#
#
#     items = db.blogs.query().fetch()
#
#     for item in items:
#         item.save_sync()
#
#
#     return True


# 작품목록 가져오기
# @cond: 판매완료된 작품은 제외한다.
@api.route("GET", "/admin/api/items")
def _(self, params, account):
    query = db.items.query()

    if params.status:
        query = query.filter(db.items.status == params.status)

    if params.category:
        query = query.filter(db.items.tag_categories == params.category)

    if params.tags:
        for tag in params.tags:
            query = query.filter(db.items.tags == tag)

    if params.search:
        query = query_search(query, db.items.search, params.search)
    else:
        query = query.order(-db.items.created_at)

    total = query.count_async()
    rows = query.fetch(limit=params.limit, offset=params.page * params.limit)

    ret = Object.fromList(rows)
    ret["total"] = total.get_result()
    return ret


# 작품목록 가져오기
# @cond: 판매완료된 작품은 제외한다.
@api.route("GET", "/admin/api/items/count")
def _(self, params, account):
    query = db.items.query()
    rows = query.fetch()

    ret = Object()

    for row in rows:
        for tag in row.tags:
            if not ret.has_key(tag):
                ret[tag] = 0
            ret[tag] += 1

        if not ret.has_key(row.status):
            ret[row.status] = 0
        ret[row.status] += 1

    return ret


# 작품 상세정보 가져오기
@api.route("GET", "/admin/api/items/<id>")
def _(self, id, params, account):
    item = db.items.load(id)
    result = item.toObject()

    return result


# 작품등록
@api.route("POST", "/admin/api/items")
def _(self, params, account):
    item = db.items.create(params)
    return item.save()


# 작품수정하기
@api.route("PUT", "/admin/api/items/<id>")
def _(self, id, params, account):
    item = db.items.load(id)
    if not item:
        return None

    item.fill(params)
    return item.save()


# 작품 삭제하기
@api.route("DELETE", "/admin/api/items/<id>")
def delete_item(self, id, account):
    return db.items.delete(id), 200
