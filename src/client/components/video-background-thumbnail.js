$module.component("video-background-thumbnail", function(WebComponent, TextAnimation, Vimeo$) {

	const options = {
		background: true,
		autoplay: false,
		loop: true,
	};


	// [Mobile] 스크롤
	if (("ontouchstart" in document)) {

		const scroll$ = Observable.fromEvent(window, "scroll");

		const playCurrent = () => {

			let first = false;

			Observable.from(Array.from(document.querySelectorAll("video-background-thumbnail")))
				.tap(el => {
					if (!first) {
						const rect = el.getBoundingClientRect();
						console.log(rect);

						if (rect.top >= 0) {
							first = true;
							el.play();
							return;
						}
					}

					el.pause();
				})
				.subscribe();
		};

		scroll$
			.debounce(500)
			.trace("scroll")
			.tap(() => playCurrent())
			.subscribe();

		Observable.timeout(1000)
			.takeUntil(scroll$)
			.tap(() => playCurrent())
			.subscribe();
	}

	return class extends WebComponent {
		init($) {
			const textAnimation = new TextAnimation();

			const video$ = $`video`.filter(_.exist);

			const vimeo = new Vimeo$;


			/// Load
			vimeo.SET_ELEMENT(this);
			vimeo.SET_OPTIONS(options);

			video$
				.map(video => video.video_id)
				.subscribe(vimeo.SET_ID);

			vimeo.PAUSE();


			/// [구간반복] 로딩시, start_at 위치로..
			video$
				.filter(video => video.video_start_at)
				.tap((video) => {
					vimeo.SET_CURRENT_TIME(video.video_start_at || 0);
				})
				.subscribe();


			/// [구간반복] end_at을 만나면 처음으로
			Observable.combine(video$, vimeo.timeupdate$)
				.filter(([video, event]) => video.video_end_at)
				.filter(([video, event]) => event.seconds >= video.video_end_at)
				.subscribe(([video, event]) => {
					vimeo.SET_CURRENT_TIME(video.video_start_at || 0);
				});


			/// [구간반복] 끝나면 처음으로.
			vimeo.ended$
				.switchMap(([video]) => vimeo.SET_CURRENT_TIME(video.video_start_at || 0))
				.subscribe();


			/// [Desktop] Mouse Over
			if (!("ontouchstart" in document)) {
				const mouseenter$ = $.fromEvent(this, "mouseenter");
				const mouseleave$ = $.fromEvent(this, "mouseleave");

				mouseenter$
					.tap(() => vimeo.PLAY())
					.subscribe();

				mouseleave$
					.tap(() => textAnimation.stop())
					.tap(() => vimeo.PAUSE())
					.subscribe();
			}


			/// 재생시, 에니메이션 시작
			vimeo.played$
				.tap(() => textAnimation.start())
				.subscribe();

			this.t = textAnimation;


			this.willState = vimeo.state$;


			this.state = Observable.reducer(
				"loading",
				vimeo.played$.mapTo("played"),
				vimeo.paused$.mapTo("paused"),
			);

			this.play = () => vimeo.PLAY();
			this.pause = () => vimeo.PAUSE();
		}
	}
})
;