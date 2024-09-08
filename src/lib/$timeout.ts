export const $timeout = (fn, duration) =>
  new Promise(function (resolve) {
    setTimeout(function () {
      resolve(fn())
    }, duration)
  })
