import { http } from "$lib/http"

export const collection = (url, params) => {
  var self = {}

  Object.assign(self, {
    init: function (url, params) {
      self.url = url
      self.params = params
      return self
    },

    fetch: function () {
      return http.GET(self.url, self.params).then(function (rows) {
        self.rows = rows
      })
    },

    create: function (params) {
      return http.POST(self.url, params)
    },

    save: function (params) {
      if (!params.id) return self.create(params)
      return http.PUT(self.url, params.id, params)
    },

    remove: function (id) {
      if (typeof id === "object") {
        id = id.id
      }
      return http.DELETE(self.url, id)
    },

    put: function () {
      var args = Array.from(arguments)
      args = [self.url].concat(args)
      return http.PUT.apply(http, args)
    }
  })

  return self.init(url, params)
}
