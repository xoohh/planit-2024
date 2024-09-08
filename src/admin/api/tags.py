# -*-coding:utf-8
from system import *


@api.route("GET", "/admin/api/tags")
def _(self, params, account):
    query = db.items.query()
    rows = query.fetch()

    check = Object()
    ret = []

    for row in rows:
        for tag in row.tags:
            if tag and not check.has_key(tag):
                check[tag] = True
                ret.append(tag)

    query = db.blogs.query()
    rows = query.fetch()

    check = Object()
    ret = []

    for row in rows:
        for tag in row.tags:
            if tag and not check.has_key(tag):
                check[tag] = True
                ret.append(tag)

    return ret
