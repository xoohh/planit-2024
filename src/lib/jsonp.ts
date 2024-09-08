let uuid = 0

export const jsonp = (url: string) => {
  return new Promise((resolve, reject) => {
    uuid++
    let script = document.createElement("script")
    let callbackName = "_callback" + uuid
    window[callbackName] = (value) => {
      resolve(value)
      delete window[callbackName]
    }

    script.src = url + "?callback=" + callbackName
    script.onerror = (error) => {
      reject(error)
    }

    document.body.appendChild(script)
  })
}
