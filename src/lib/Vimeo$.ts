import { Vimeo } from "@vimeo/vimeo"
import { combineLatestWith, distinctUntilChanged, fromEventPattern, merge, Observable, shareReplay } from "rxjs"
import { Action } from "rxjs/internal/scheduler/Action"

const createPlayer = (options, el, id) => new Vimeo.Player(el, { ...options, id })

const fromVimeoEvent = (type: string) => (player) => {
  return fromEventPattern(
    (handler) => player.on(type, handler),
    (handler) => player.off(type, handler)
  )
}

const fromVimeoMethod =
  (method, ...args) =>
  (player) => {
    return Observable.fromPromise(player[method](...args)).retry(10)
  }

const switchPipeMethod = (player$: Observable, method, ...args) => player$.switchMap(fromVimeoMethod(method, ...args))
const switchPipeEvent = (player$: Observable, type: string) => player$.switchMap(fromVimeoEvent(type))

export class Vimeo$ {
  willPercent = 0
  willState = ""

  constructor() {
    /// Actions
    const SET_ID = new Action("SET_ID")
    const SET_OPTIONS = new Action("SET_OPTIONS")
    const SET_ELEMENT = new Action("SET_ELEMENT")

    const SET_CURRENT_TIME = new RequestAction("SET_CURRENT_TIME")
    const SET_CURRENT_PERCENT = new RequestAction("SET_CURRENT_PERCENT")

    const PLAY = new RequestAction("PLAY")
    const PAUSE = new RequestAction("PAUSE")
    const TOGGLE_PLAY = new Action("TOGGLE_PLAY")

    /// Vimeo Player
    const player$ = combineLatestWith([SET_OPTIONS, SET_ELEMENT, SET_ID]).pipe(
      map(([options, el, id]) => createPlayer(options, el, id)),
      shareReplay(1)
    )

    /// ? 이게 왜 필요하지??
    player$.subscribe()

    /// Event
    const played$ = switchPipeEvent(player$, "play")
    const paused$ = switchPipeEvent(player$, "pause")
    const loaded$ = switchPipeEvent(player$, "loaded")
    const ended$ = switchPipeEvent(player$, "ended")
    const timeupdate$ = switchPipeEvent(player$, "timeupdate")

    /// Methods
    const play$ = () => switchPipeMethod(player$, "play")
    const pause$ = () => switchPipeMethod(player$, "pause")

    const _setCurrentTime$$ = (value) => switchPipeMethod(player$, "setCurrentTime", +value)

    const _setCurrentPercent = (percentX) => {
      return player$.switchMap((player) => {
        return Observable.defer(() =>
          player
            .pause()
            .then(() => player.getDuration())
            .then((duration) => player.setCurrentTime(duration * percentX))
            .then(() => this.willState !== "paused" && player.play())
        ).retry(3)
      })
    }

    /// Store
    const isPlaying$ = Observable.reducer(...[false, PLAY.SUCCESS.mapTo(true), PAUSE.SUCCESS.mapTo(false)])

    const state$ = merge(...[PLAY.mapTo("played"), PAUSE.mapTo("paused")]).pipe(distinctUntilChanged(), shareReplay(1))

    state$
      .map((action) => {
        switch (action) {
          case "played":
            return () => play$().take(1).tap(PLAY.SUCCESS, PLAY.FAILURE)

          case "paused":
            return () => pause$().take(1).tap(PAUSE.SUCCESS, PAUSE.FAILURE)
        }
      })
      .concatMap((callback) => callback())
      .subscribe()

    TOGGLE_PLAY.withLatestFrom(isPlaying$)
      .switchMap(([__, isPlaying]) => {
        return isPlaying ? PAUSE() : PLAY()
      })
      .subscribe()

    SET_CURRENT_TIME.switchMap((value) => _setCurrentTime$$(value))
      .tap(SET_CURRENT_TIME.SUCCESS, SET_CURRENT_TIME.FAILURE)
      .subscribe()

    SET_CURRENT_PERCENT.subscribe((value) => {
      this.willPercent = value * 100

      _setCurrentPercent(value).subscribe(() => {
        console.log("complete!!??")
        this.willPercent = 0
      })
    })

    ///
    Object.assign(this, {
      SET_ID,
      SET_ELEMENT,
      SET_OPTIONS,
      SET_CURRENT_TIME,
      SET_CURRENT_PERCENT,
      PLAY,
      PAUSE,
      TOGGLE_PLAY,

      timeupdate$,
      state$,
      loaded$,
      ended$,
      played$,
      paused$
    })
  }
}
