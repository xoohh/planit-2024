# -*-coding:utf-8
from system import *


# 블로그목록 가져오기
@api.route("GET", "/api/blogs")
def _(params):
    query = db.blogs.query(db.blogs.status == "공개")
    query = query.filter(db.blogs.type == "blog")
    query = query.order(-db.blogs.published_at, -db.blogs.created_at)
    return fetch_page(query, params, 30)


# 블로그목록 가져오기
@api.route("GET", "/api/blogs/tags/<tags>")
def _(params, tags):
    if not tags:
        return []

    tags = tags.split(",")
    query = db.blogs.query(db.blogs.status == "공개")

    # for tag in tags:
    #     query = query.filter(db.blogs.tags == tag)

    query = query.filter(db.blogs.tags.IN(tags))

    query = query.order(-db.blogs.published_at, -db.blogs.created_at)
    return fetch_page(query, params, 30)


# 블로그목록 가져오기
@api.route("GET", "/api/blogs/search")
def _(params):
    query = db.blogs.query(db.blogs.status == "공개")
    query = query_search(query, db.items.search, params.search)
    # query = query.filter(ndb.OR(db.blogs.search == params.search, db.blogs.tags == params.search))
    query = query.order(-db.blogs.search, db.blogs.key)
    return fetch_page(query, params, 30)


# 블로그 상세정보 가져오기
@api.route("GET", "/api/blogs/<id>")
def _(id):
    blog = db.blogs.load(id)
    return None if blog and blog.status == "비공개" else blog
