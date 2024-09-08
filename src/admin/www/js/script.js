Array.prototype.sum = function(fn) {
	return this.reduce(function(prev, value) {
		return prev + fn.call(value, value);
	}, 0);
};

app.pipe("원", function() {
	return function(value) {
		return Number.format(value) + " 원";
	}
});

app.pipe("KRW", function() {
	return function(value) {
		return value ? "KRW " + Number.format(value) : "";
	}
});

app.factory("account", function(http) {

	var account = {};
	account.promise$ = http.GET("/api/account").then(function(res) {
		Object.assign(account, res);
	});

	return account;
});

window.onload = function() {
	Array.from(document.querySelectorAll("header[main-header] a")).forEach(function(a) {
		if (a.href === location.href) {
			a.setAttribute("selected", true);
		}
	});

	Array.from(document.querySelectorAll("nav[sub-nav] a")).forEach(function(a) {
		a.onclick = function(e) {
			e.preventDefault();
			location.replace(a.href);
		}
	});

	Array.from(document.querySelectorAll("#nav a")).forEach(function(a) {
		if (a.href === location.href) {
			a.setAttribute("selected", true);
		}
	});
};


////////////
app.factory("formData", function() {

	return function(form) {
		var params = {};
		Array.from(form.elements).forEach(function(input) {
			params[input.name] = input.value;
		});

		return params;
	}
});


app.directive("masonry", function() {

	return function(el, $scope, to, $def) {

		setInterval(function() {

			window.requestAnimationFrame(function() {
				let height = el.lastElementChild.getBoundingClientRect().bottom - el.firstElementChild.getBoundingClientRect().top;

				el.style.gridRowEnd = "span " + Math.round(height / 50);

				// if (el._height !== height) {
				// 	console.log(el);
				// 	console.log(el.lastElementChild.getBoundingClientRect(), el.firstElementChild.getBoundingClientRect());
				// 	console.log(el.style.gridRowEnd);
				// }

				el._height = height;
			});

		}, 500);
	}
});