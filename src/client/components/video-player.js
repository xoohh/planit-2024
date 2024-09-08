$module.component("video-player", function(WebComponent, Observable, Vimeo$) {

	//language=HTML
	this.templateHTML = `
		<section popup player-popup>
			<div player-media $video></div>

			<div player-title hidden [visible]="show.controls">
				<h1>{{ video.name }}</h1>
				<h2>{{ video.desc }}</h2>
			</div>

			<div layer (click)="vimeo.TOGGLE_PLAY()"></div>

			<div player-btn="play" [visible]="show.controls" [attr.state]="state" (click|stop)="vimeo.TOGGLE_PLAY()">
				<div></div>
			</div>

			<div player-btn="full-screen" [visible]="show.controls" (click|stop)="fullscreen()">
				<div></div>
			</div>

			<div player-btn="close" [visible]="show.controls" (click|stop)="close()" hidden [visible]="show.close">
				<div></div>
			</div>

			<div player-slider [visible]="show.controls" (click|stop)="timechange(event)">
				<div player-slider-bar>
					<div player-slider-active [style.width.%]="percent"></div>
				</div>
			</div>
		</section>
	`;


	const iOS = _.platform.isiOS();

	if (iOS) {
		//language=HTML
		this.templateHTML = `
			<section popup player-popup>
				<div player-media $video></div>

				<div player-btn="close" [visible]="show.controls" (click|stop)="close()" hidden [visible]="show.close">
					<div></div>
				</div>
			</section>
		`;
	}


	return class extends WebComponent {
		init($) {
			////
			this.show = {
				controls: true,
				close: true
			};


			const vimeo = this.vimeo = new Vimeo$;

			vimeo.SET_OPTIONS({
				controls: iOS,
				color: "#009be0",
				title: false,
				byline: false,
				autoplay: true,
				playsinline: false,
				loop: false
			});

			$`video`
				.filter(_.exist)
				.map(video => video.video_id)
				.subscribe(vimeo.SET_ID);

			$`$video`
				.subscribe(vimeo.SET_ELEMENT);


			if (iOS) {
				return;
			}


			/// Auto Timer
			const autoTimer$ = Observable.of(true)
				.concat(Observable.timeout(3000, false))
				.tap(flag => this.show.controls = flag);

			$.fromEvent(this, ["mousedown", "mousemove", "click"], true)
				.switchMap(() => autoTimer$)
				.subscribe();

			autoTimer$.subscribe();


			/// TimeSlider
			vimeo.timeupdate$
				.subscribe(event => this.percent = event.percent * 100);

			// play/pause
			vimeo.state$
				.subscribe(value => this.state = value);

			vimeo.PLAY();
		}

		close() {
			this.remove();
		}

		fullscreen() {
			if (document.fullscreenElement) {
				this.show.close = true;
				document.exitFullscreen();
				return;
			}

			return this.requestFullscreen().then(() => {
				this.show.close = false;
			})
		}

		timechange(event) {
			const rect = event.currentTarget.getBoundingClientRect();
			const offsetX = event.clientX - rect.left;
			const percentX = offsetX / rect.width;

			this.vimeo.SET_CURRENT_PERCENT(percentX);
		}
	}
});


$module.factory("videoPlayer", function() {
	return {
		show(video) {
			let b = document.createElement("video-player");
			b.video = video;
			document.body.appendChild(b);
		}
	}
});