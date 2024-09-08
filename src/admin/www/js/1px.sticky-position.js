module.directive("sticky", function() {

	var ob = [];

	function check(el) {
		var top = el.$proxy.top;
		var rect = el.getBoundingClientRect();

		if (rect.top <= top) {
			el.style.visibility = "hidden";
			el.$proxy.style.visibility = "visible";
			el.$proxy.style.top = top + "px";
			el.$proxy.style.left = rect.left + "px";
			el.$proxy.style.width = rect.width + "px";
			el.$proxy.style.height = rect.height + "px";
		}
		else {
			el.style.visibility = "visible";
			el.$proxy.style.visibility = "hidden";
		}
	}

	function add(el, top, $scope, def) {
		ob.push(el);

		el.$proxy = el.cloneNode(true);
		el.$proxy.style.position = "fixed";
		el.$proxy.style.visibility = "hidden";
		el.$proxy.style.zIndex = 1;
		el.$proxy.style.transform = "translateZ(0)";
		el.$proxy.style.webkitTransform = "translateZ(0)";
		el.$proxy.top = +top || 0;

		el.$proxy.removeAttribute("sticky");
		$compile(el.$proxy, $scope, def);

		el.addEventListener("dom-changed", function() {
			el.$proxy.innerHTML = el.innerHTML;
			el.$proxy.removeAttribute("sticky");
			$compile(el.$proxy, $scope, def);

			$nextFrame(function() {
				check(el);
			});
		});

		el.addEventListener("DOMNodeInsertedIntoDocument", function() {
			el.parentNode.insertBefore(el.$proxy, el);
		});
	}

	window.addEventListener("scroll", onscroll);
	function onscroll() {
		foreach(ob, function(el) {
			check(el);
		});
	}

	return function(el, $scope, to, def) {
		var value = el.getAttribute("sticky");
		add(el, value, $scope, def);
	}
});


module.directive("sticky-header", function() {

	var A = [];

	window.addEventListener("scroll", onscroll);
	function onscroll() {
		foreach(A, function(o) {


			var el = o.el;
			if (!el.anchorY) {
				var rect = el.getBoundingClientRect();
				if (rect.top < 0) {
					el.anchorY = window.pageYOffset + rect.top;
					el.setAttribute("sticky", true);
				}
			}
			else {
				if (window.pageYOffset <= el.anchorY) {
					el.removeAttribute("sticky");
					delete el.anchorY
				}
			}

		});
	}

	return function(el, $scope, to, def) {
		var value = el.getAttribute("sticky-header");
		A.push({el: el, value: value});
	}
});

