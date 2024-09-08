# -*-coding:utf-8
from system import *


@api.route("GET", "/admin/api/configs/<id>")
def _(id):
    return db.configs.get(id) or {}


@api.route("PUT", "/admin/api/configs/<id>")
def _(id, params):
    return db.configs.set(id, params.value)
