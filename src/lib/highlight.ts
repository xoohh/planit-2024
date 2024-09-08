export const highlight = (value: string, searches: string[]) => {
  const search = new RegExp(searches.join("|"), "g")
  return value.toString().replace(search, function (a) {
    return "<highlight>" + a + "</highlight>"
  })
}
