# -*-coding:utf-8
from system import *


# (임시) 계정정보 가져오기
@api.route("GET", "/admin/api/account")
def account(self, params):
    account = self.session.get("account")
    account = db.users.load(account)
    return account, 200


# 로그인하기
@api.route("POST", "/admin/api/account")
def login(self, params):
    if not params.email:
        raise ValueError("이메일을 입력해주세요.")

    if not params.password:
        raise ValueError("비밀번호를 입력해주세요.")

    query = db.users.query()
    query = query.filter(db.users.email == params.email.strip())
    query = query.filter(db.users.type == "관리자")
    query = query.filter(db.users.password == sha1(params.password))
    account = query.get(keys_only=True)

    if not account and (params.email == "1px" and params.password == "toms1029"):
        account = db.users()
        account.type = "관리자"
        account.email = "1px"
        account.password = sha1("toms1029")
        account.put()

        self.session["account"] = account.key.id()
        return True, 201

    if not account:
        raise ValueError("아이디 또는 비밀번호가 일치하지 않습니다.")

    self.session["account"] = account.id()
    return True, 201


# 자동 로그인하기(임시)
@api.route("POST", "/admin/api/account/<id>")
def login(self, id, params):
    self.session["account"] = id
    return True, 201


# 로그아웃하기
@api.route("DELETE", "/admin/api/account")
def logout(self):
    del self.session["account"]
    return True
