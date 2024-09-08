$module.factory("actions", function (Action, RequestAction) {
  const actions = {
    메뉴선택: new Action("메뉴선택"),

    SHOW_VIDEO_PLAYER: new Action("SHOW_VIDEO_PLAYER"),

    SET_MAIN_VIDEO_INDEX: new Action("SET_MAIN_VIDEO_INDEX"),
    NEXT_MAIN_VIDEO: new Action("NEXT_MAIN_VIDEO"),

    FETCH_TAGS: new RequestAction("FETCH_TAGS"),
    FETCH_MAIN_VIDEOS: new RequestAction("FETCH_MAIN_VIDEOS"),
    FETCH_VIDEOS: new RequestAction("FETCH_VIDEOS"),
    FETCH_BLOGS: new RequestAction("FETCH_BLOGS")
  }

  $module.$actions = window.actions = actions
  return actions
})
