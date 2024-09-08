# -*-coding:utf-8
from system import *
from google.appengine.ext import blobstore
from google.appengine.api import app_identity
from google.appengine.ext.webapp import blobstore_handlers


# 본인인증 페이지
class Image(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, filename):
        self.redirect("https://storage.googleapis.com/grafikplastic-193707.appspot.com/temp/" + filename)

        # bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
        # path = "/gs/%s/temp/%s" % (bucket_name, filename)
        #
        # blob_key = blobstore.create_gs_key(path)
        #
        # etag = '"%s"' % md5(path)
        #
        # if "If-None-Match" in self.request.headers:
        #     if self.request.headers["If-None-Match"] == etag:
        #         self.response.set_status(304)
        #         return
        #
        # self.response.headers["ETag"] = etag
        #
        #
        # # @NOTE: blobstore.get(blob_key)로 할 경우 항상 None이 뜬다.;;
        # try:
        #     blobstore.fetch_data(blob_key, 0, 0)
        #     self.send_blob(blob_key)
        # except:
        #     self.error(404)