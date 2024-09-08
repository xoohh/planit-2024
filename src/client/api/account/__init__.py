# -*-coding:utf-8
from system import *


@api.route("GET", "/api/account")
def account(self, params):
    account = self.session.get("account")
    account = db.users.load(account)

    if account:
        return account.to_public()

    return None


# login
@api.route("POST", "/api/account")
def login(self, params):
    if not params.email:
        raise ValueError("이메일을 입력해주세요.")

    if not params.password:
        raise ValueError("비밀번호를 입력해주세요.")

    query = db.users.query()
    query = query.filter(db.users.email == params.email)
    query = query.filter(db.users.password == sha1(params.password))

    account = query.get()
    if not account:
        raise ValueError("이메일 또는 비밀번호가 일치하지 않습니다.")

    # if not account.activated:
    #     raise ValueError("본인 인증이 완료되지 않은 계정입니다.")



    # 카트 merge

    self.session["account"] = None

    old_cart = db.cart.of(self)

    self.session["account"] = account.key.id()

    cart = db.cart.create(account.cart).merge(old_cart)

    account.cart = JSON.parse(JSON.stringify(cart))

    self.session["cart"] = None

    return account.save_sync()
    # return True


# logout
@api.route("DELETE", "/api/account")
def logout(self):
    del self.session["account"]
    return True


# change profile
@api.route("PUT", "/api/account/profile")
def update_profile(self, params, email):
    if not params.password:
        raise ValueError("비밀번호를 입력해주세요.")

    if not params.new_password:
        raise ValueError("새로운 비밀번호를 입력해주세요.")

    if not params.new_password_confirm:
        raise ValueError("새로운 비밀번호를 한번 더 입력해주세요.")

    if not len(params.new_password) >= 8:
        raise ValueError("비밀번호는 8자리 이상이어야 합니다.")

    if params.new_password != params.new_password_confirm:
        raise ValueError("새로운 비밀번호가 일치하지 않습니다.")

    query = db.users.query()
    query = query.filter(db.users.email == email)
    query = query.filter(db.users.password == sha1(params.password))

    account = query.get()
    if not account:
        raise ValueError("이메일 또는 비밀번호가 일치하지 않습니다.")

    account.password = sha1(params.new_password)
    account.name = params.name
    account.phone1 = params.phone1
    account.save()

    self.session["account"] = account.key.id()
    return True, 201


# change password
@api.route("PUT", "/api/account/password")
def _(params, account):
    if not account:
        raise AuthError("")

    if not params.password:
        raise ValueError("비밀번호를 입력해주세요.")

    if not params.new_password:
        raise ValueError("새로운 비밀번호를 입력해주세요.")

    if not params.new_password_confirm:
        raise ValueError("새로운 비밀번호를 한번 더 입력해주세요.")

    if not len(params.new_password) >= 8:
        raise ValueError("비밀번호는 8자리 이상이어야 합니다.")

    if params.new_password != params.new_password_confirm:
        raise ValueError("새로운 비밀번호가 일치하지 않습니다.")

    if sha1(params.password) != account.password:
        raise ValueError("기존 비밀번호가 일치하지 않습니다.")

    account.password = sha1(params.new_password)
    return account.save()


############## 회원 가입 #####################


# signup
@api.route("POST", "/api/account/<email>")
def signup(self, params, email):
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise ValueError("잘못된 형식의 이메일입니다.")

    user = db.users.query(db.users.email == email).get()
    if not user:
        user = db.users.create(params)
        user.type = "미인증회원"
        user.email = email
        user.password = sha1(params.password)
        user.verify = sha1(datetime.now().strftime("%Y%m%d-%H%M%S-%f"))

    if user.type != "미인증회원":
        raise ValueError("이미 가입되어 있는 이메일 입니다.")

    params = {}
    params["user"] = user
    params["link"] = "%s/account/%s/activate/%s" % (self.request.host_url, email, user.verify)
    sendmail(to=email, templatePath="client/signup_activate", params=params)

    return user.save()


# 본인인증 페이지
# app.controller "GET", "/account/<email>/activate/<verify>"
class Activate(WebApp.RequestHandler):
    def get(self, email, verify):
        self.response.headers["Content-Type"] = "text/html; charset=utf-8"

        account = db.users.query(db.users.email == email).filter(db.users.verify == verify).get()

        if not account or account.activated:
            self.response.write("<script>")
            self.response.write("alert('유효하지 않은 링크입니다.');")
            self.response.write("location.replace('/');")
            self.response.write("</script>")
            return

        account.type = "일반회원"
        account.save_sync()

        # 메일 전송
        params = {}
        params["user"] = account
        sendmail(to=email, templatePath="client/signup_complete", params=params)

        params = {
            "this": self,
            "store": self.app.config,
            "account": None
        }
        self.allowed = True

        html = template("homepage/client", "account/signup-activate", params)
        self.response.write(html)


# forgot password
@api.route("POST", "/api/account/<email>/forgot-password")
def _(self, email, params):
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise ValueError("잘못된 형식의 이메일입니다.")

    user = db.users.query(db.users.email == email).get()
    if not user:
        raise ValueError("입력하신 이메일을 찾을 수 없습니다.")

    if not user.verify:
        user.verify = sha1(datetime.now().strftime("%Y%m%d-%H%M%S-%f"))
        user.save()

    # 이메일 전송
    params = {}
    params["user"] = user
    params["link"] = "%s/account/%s/reset-password/%s" % (self.request.host_url, email, user.verify)
    sendmail(to=email, templatePath="client/password_change", params=params)

    return True


# 비밀번호 재설정
# app.controller "GET", "/account/<email>/reset-password/<verify>"
class ResetPassword(WebApp.RequestHandler):
    def __init__(self, *arg, **args):
        super(ResetPassword, self).__init__(*arg, **args)
        self.allowed = True

    def get(self, email, verify):
        self.response.headers["Content-Type"] = "text/html; charset=utf-8"

        query = db.users.query(db.users.email == email)
        query = query.filter(db.users.verify == verify)
        user = query.get()

        if not user:
            self.response.write("<script>")
            self.response.write("alert('유효하지 않은 링크입니다.');")
            self.response.write("location.replace('/');")
            self.response.write("</script>")
            return

        params = {
            "this": self.app,
            "store": self.app.config,
            "account": None,
            "email": email,
        }
        self.allowed = True

        html = template("homepage/client", "account/reset-password", params)
        self.response.write(html)


# update-password
@api.route("PUT", "/api/account/<email>/password/<verify>")
def _(self, email, verify, params):
    query = db.users.query(db.users.email == email)
    query = query.filter(db.users.verify == verify)
    account = query.get()

    if not account:
        raise ValueError("잘못된 접근 경로입니다.")

    if not params.new_password:
        raise ValueError("새로운 비밀번호를 입력해주세요.")

    if not params.new_password_confirm:
        raise ValueError("새로운 비밀번호를 한번 더 입력해주세요.")

    if not len(params.new_password) >= 8:
        raise ValueError("비밀번호는 8자리 이상이어야 합니다.")

    if params.new_password != params.new_password_confirm:
        raise ValueError("새로운 비밀번호가 일치하지 않습니다.")

    account.password = sha1(params.new_password)
    account.save()

    self.session["account"] = account.key.id()
    return True, 201
