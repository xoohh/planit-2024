$module.factory("TextAnimation", function() {

	return class {
		start() {
			this.doAnimation = false;

			clearTimeout(this.timer);
			setTimeout(() => {
				this.doAnimation = true;
				this.delay1 = parseInt(Math.random() * 1000) + 1000;
				this.delay2 = parseInt(Math.random() * 1000) + 1600;

				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					this.doAnimation = false;
				}, 10000);
			}, 150);
		}

		stop() {
			this.doAnimation = false;
		}
	}
});


$module.component("video-background", function(WebComponent, Observable, Vimeo$) {

	const OPTIONS = {
		background: true,
		autoplay: false,
		autopause: true,
		loop: true,
	};

	return class extends WebComponent {
		init($) {

			/// props
			const video$ = $`video`.filter(_.exist);
			const state$ = $`state`.filter(_.exist);


			/// ...
			const dispatch = (type) => () => this.dispatchEvent(new CustomEvent(type));

			const vimeo = this.vimeo = new Vimeo$;


			/// Prepare
			vimeo.SET_ELEMENT(this);
			vimeo.SET_OPTIONS(OPTIONS);

			video$
				.map(video => video.video_id)
				.tap(vimeo.SET_ID)
				.subscribe();


			/// state To Action
			state$.subscribe(state => {
				switch (state) {
					case "play":
						return vimeo.PLAY();

					case "pause":
						return vimeo.PAUSE();
				}
			});


			/// Event
			vimeo.played$
				.tap(dispatch("played"))
				.subscribe();

			vimeo.timeupdate$
				.subscribe(event => this.video.percent = event.percent * 100);


			/// [구간반복] 로딩시, start_at 위치로..
			Observable.combine(video$, vimeo.loaded$)
				.switchMap(([video]) => vimeo.SET_CURRENT_TIME(video.video_start_at || 0))
				.tap(dispatch("loaded"))
				.subscribe();


			/// [구간반복] 멈추면 처음으로,
			Observable.combine(video$, vimeo.PAUSE)
				.switchMap(([video]) => vimeo.SET_CURRENT_TIME(video.video_start_at || 0))
				.subscribe();


			/// [구간반복] end_at을 만나면 처음으로
			Observable.combine(video$.filter(video => video && video.video_end_at), vimeo.timeupdate$)
				.filter(([video, event]) => video.video_end_at)
				.filter(([video, event]) => event.seconds >= video.video_end_at)
				.tap(dispatch("ended"))
				.switchMap(([video]) => vimeo.SET_CURRENT_TIME(video.video_start_at || 0))
				.subscribe();


			/// [구간반복] 끝나면 처음으로.
			vimeo.ended$
				.tap(dispatch("ended"))
				.switchMap(([video]) => vimeo.SET_CURRENT_TIME(video.video_start_at || 0))
				.subscribe();
		}
	}
});