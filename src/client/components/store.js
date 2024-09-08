$module.factory("store", function(Observable, http, actions, videoPlayer) {

	/// -----------------------------------------------------------------------
	/// Common
	/// -----------------------------------------------------------------------
	const urlpath = location.pathname.split("/").slice(1).map(s => decodeURIComponent(s));


	const initNav = urlpath[0] === "blog" ? "blog" : "";

	const nav = Observable.reducer(
		initNav,

		actions.메뉴선택.map(menu => (prev) => prev === menu ? initNav : menu)
	);

	const tags = Observable.reducer(
		actions.FETCH_TAGS.SUCCESS
	);


	/// -----------------------------------------------------------------------
	/// Main
	/// -----------------------------------------------------------------------
	const main_videos = actions.FETCH_MAIN_VIDEOS.SUCCESS.shareReplay(1);

	const main_videos_index = Observable.reducer(
		0,

		Observable.combine(
			main_videos,
			actions.SET_MAIN_VIDEO_INDEX,
		).map(([videos, index]) => index % videos.length)
	);

	const current_main_video = Observable.combine(main_videos, main_videos_index)
		.map(([videos, index]) => videos[index])
		.shareReplay(1);


	/// -----------------------------------------------------------------------
	/// BLOGS
	/// -----------------------------------------------------------------------
	const videos = actions.FETCH_VIDEOS.SUCCESS.shareReplay(1);


	/// -----------------------------------------------------------------------
	/// BLOGS
	/// -----------------------------------------------------------------------
	const blogs = actions.FETCH_BLOGS.SUCCESS.shareReplay(1);


	/// -----------------------------------------------------------------------
	/// Effects:
	/// -----------------------------------------------------------------------
	http = http
		.headers({"Content-Type": "application/json"})
		.body(body => JSON.stringify(body))
		.response(res => res.json());


	actions.FETCH_TAGS
		.exhaustMap(http.GET("/api/configs/tags"))
		.map(res => {
			const tags = {};
			Object.keys(res).forEach(key => {
				tags[key] = res[key].split(/\s*\n\s*/);
			});
			return tags;
		})
		.tap(actions.FETCH_TAGS.SUCCESS, actions.FETCH_TAGS.FAILURE)
		.subscribe();


	actions.FETCH_MAIN_VIDEOS
		.exhaustMap(http.GET("/api/items/main"))
		.tap(actions.FETCH_MAIN_VIDEOS.SUCCESS, actions.FETCH_MAIN_VIDEOS.FAILURE)
		.subscribe();


	actions.FETCH_BLOGS
		.exhaustMap(http.GET("/api/blogs"))
		.tap(actions.FETCH_BLOGS.SUCCESS, actions.FETCH_BLOGS.FAILURE)
		.subscribe();


	actions.FETCH_VIDEOS
		.withLatestFrom(tags)
		.map(([{category, tag}, tags]) => {
			tags = tags[category];
			const _tags = tags.map(tag => tag.toLowerCase());
			tag = tags[_tags.indexOf(tag)];
			return {category, tag};
		})
		.exhaustMap(({category, tag}) => http.GET(`/api/items/${category}/${tag}`)())
		.tap(actions.FETCH_VIDEOS.SUCCESS, actions.FETCH_VIDEOS.FAILURE)
		.subscribe();


	actions.SHOW_VIDEO_PLAYER
		.tap(videoPlayer.show)
		.subscribe();


	actions.NEXT_MAIN_VIDEO
		.withLatestFrom(main_videos_index)
		.map(([__, index]) => index + 1)
		.tap(actions.SET_MAIN_VIDEO_INDEX)
		.subscribe();


	return {
		urlpath,
		tags,

		nav,

		main_videos,
		main_videos_index,
		current_main_video,

		videos,

		blogs,
	}
});