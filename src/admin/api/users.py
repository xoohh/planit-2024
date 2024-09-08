# -*-coding:utf-8
from system import *


# 회원목록 가져오기
@api.route("GET", "/admin/api/users")
def _(self, params, account):
    query = db.users.query()

    if params.type:
        query = db.users.query(db.users.type == params.type)

    if params.search:
        query = query_search(query, db.users.search, params.search)
    else:
        query = query.order(-db.items.created_at)

    total = query.count_async()
    rows = query.fetch(limit=params.limit, offset=(params.page * params.limit))

    ret = Object.fromList(rows)
    ret["total"] = total.get_result()
    return ret


# 회원 상세정보 가져오기
@api.route("GET", "/admin/api/users/<id>")
def _(self, id, params, account):
    user = db.users.load(id)
    result = user.toObject()

    return result


# 회원등록
@api.route("POST", "/admin/api/users")
def _(params):
    user = db.users.create()
    user.fill(params)

    # 임시로 비밀번호는 문자로 저장
    user.password = sha1(user.password)
    return user.save()


# 회원수정하기
@api.route("PUT", "/admin/api/users/<id>")
def _(self, id, params, account):
    if params.password:
        params["password"] = sha1(params.password)

    user = db.users.load(id)
    user.fill(params)
    return user.save()


# 회원 삭제하기
@api.route("DELETE", "/admin/api/users/<id>")
def delete_user(self, id, account):
    return db.users.delete(id)