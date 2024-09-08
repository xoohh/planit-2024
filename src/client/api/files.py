# -*-coding:utf-8
from system import *

from google.appengine.api import images
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers


@api.route("POST", "/api/files/upload-url")
def func(self, params):
    upload_url = blobstore.create_upload_url("/api/files")
    return {"ok": True, "upload_url": upload_url}


# app.controller "/files"
class FileReader(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, id):
        if not blobstore.get(id):
            self.error(404)
        else:
            self.send_blob(id)


# app.controller "/api/files"
class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        blob = self.get_uploads()[0]
        blob_key = blob.key()

        result = Object()
        result["id"] = "%s" % blob_key

        try:
            result["src"] = images.get_serving_url(blob_key)
            result["name"] = self.request.POST.get("name")
            result["width"] = parseInt(self.request.POST.get("width"))
            result["height"] = parseInt(self.request.POST.get("height"))
        except:
            result["src"] = "/files/%s" % blob_key
            pass

        self.response.headers["Content-Type"] = "application/json; charset=utf-8"
        self.response.write(JSON.stringify(result))