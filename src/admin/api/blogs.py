# -*-coding:utf-8
from system import *


# @api.route("GET", "/admin/api/blogs/update")
# def _(params, account):
#     ret = []
#
#     query = db.blogs.query()
#     rows = query.fetch()
#     for row in rows:
#         body = row.body
#         body = row.body.replace("http://https://", "https://")
#         if body != row.body:
#             ret.append(row.body)
#             row.body = body
#             row.save_sync()
#
#     return ret


# 블로그목록 가져오기
# @cond: 판매완료된 블로그은 제외한다.
@api.route("GET", "/admin/api/blogs")
def _(params, account):
    query = db.blogs.query()

    if params.type:
        query = query.filter(db.blogs.type == params.type)

    if params.status:
        query = query.filter(db.blogs.status == params.status)

    if params.tags:
        for tag in params.tags:
            query = query.filter(db.blogs.tags == tag)

    if params.search:
        query = query_search(query, db.blogs.search, params.search)
    else:
        query = query.order(-db.blogs.published_at, -db.blogs.created_at)

    total = query.count_async()
    rows = query.fetch(limit=params.limit, offset=params.page * params.limit)

    ret = Object.fromList(rows)
    ret["total"] = total.get_result()
    return ret


# 블로그목록 가져오기
# @cond: 판매완료된 블로그은 제외한다.
@api.route("GET", "/admin/api/blogs/count")
def _(params):
    query = db.blogs.query()

    if params.type:
        query = query.filter(db.blogs.type == params.type)

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


# 블로그 상세정보 가져오기
@api.route("GET", "/admin/api/blogs/<id>")
def _(id):
    return db.blogs.load(id)


# 블로그등록
@api.route("POST", "/admin/api/blogs")
def _(params, account):
    blog = db.blogs.create(params)
    return blog.save()


# 블로그수정하기
@api.route("PUT", "/admin/api/blogs/<id>")
def _(id, params, account):
    blog = db.blogs.load(id)
    if not blog:
        return None

    blog.fill(params)
    return blog.save()


# 블로그 삭제하기
@api.route("DELETE", "/admin/api/blogs/<id>")
def delete_blog(id, account):
    blog = db.blogs.load(id)
    return db.blogs.delete(id)
