# -*-coding:utf-8
from system import *


# 제품목록 가져오기
@api.route("GET", "/api/news")
def _(params):
    return db.configs.get("news2") or []
