# -*-coding:utf-8
from system import *


@api.route("GET", "/api/configs/<id>")
def _(id):
    return db.configs.get(id)