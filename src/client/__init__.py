# -*-coding:utf-8
from system import *

from google.appengine.api import images
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers

# app.controller "/component/all"
class ComponentFetcher(WebApp.RequestHandler):
    def get(self):

        html = ""

        path = os.path.dirname(__file__) + "/components"
        for dir, dirs, files in os.walk(path):
            for filename in files:
                filepath = os.path.join(dir, filename)
                f = open(filepath)
                html += f.read()
                html += "\n"

        etag = '"%s"' % md5(html)

        if "If-None-Match" in self.request.headers:
            if self.request.headers["If-None-Match"] == etag:
                self.response.set_status(304)
                return

        self.response.set_status(200)
        self.response.headers["Cache-Control"] = "private, max-age=0"
        self.response.headers["Content-Type"] = "text/html; charset=utf-8"
        self.response.headers["Vary"] = "Accept-Encoding"
        self.response.headers["ETag"] = etag
        self.response.write(html)