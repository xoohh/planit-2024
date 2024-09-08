(function(window, document, undefined) {

	// @TODO: Object.observe, Array.observe를 사용하는 기법도 만들어 보자

	var DATE_SET_METHOD = [
		"setDate",
		"setFullYear",
		"setHours",
		"setMilliseconds",
		"setMinutes",
		"setMonth",
		"setSeconds",
		"setTime",
		"setUTCDate",
		"setUTCFullYear",
		"setUTCHours",
		"setUTCMilliseconds",
		"setUTCMinutes",
		"setUTCMonth",
		"setUTCSeconds",
		"setYear"
	];

	function $dirtyCheck(object, prop, callback, value) {
		if (!Object.is(value, object[prop])) {
			if (callback(object[prop], value) === false) {
				return;
			}
		}

		if (callback.$canceled) {
			delete callback.$canceled;
			return;
		}

		value = object[prop];
		$nextFrame(function() {
			$dirtyCheck(object, prop, callback, value);
		});
	}

	function applyWatchCallback(object, prop, newValue, oldValue) {

		var desc = Object.getOwnPropertyDescriptor(object, prop);
		if (!desc || !desc.set || !desc.set.$isWatch) {
			return;
		}

		var setter = desc.set;
		var callbacks = setter.$callbacks.slice();

		for (var i = 0, len = callbacks.length; i < len; i++) {
			var callback = callbacks[i];
			var ret = callback.call(object, prop, newValue, oldValue);
			if (ret === false) {
				$unwatch(object, prop, callback);
			}
		}
	}

	var count = 0;

	function $watch(object, prop, callback) {

		/// arguments 에외처리
		if (!object || typeof object !== "object") {
			return;
		}

		if (typeof callback !== "function") {
			throw TypeError("arguments 2 is must be function.");
		}

		var desc = Object.getOwnPropertyDescriptor(object, prop);
		if (desc && desc.set && desc.set.$isWatch) {
			desc.set.$callbacks.push(callback);
			return;
		}


		/// @TODO: 여기 정리 필요!!
		// @TODO: 1) dirtyCheck와 Property Setter를 구분하는 로직 정리
		// @TODO: 2) Object.observe와 Array.observe 사용 추가

		if (Array.isArray(object) && +prop === +prop && +prop >= object.length) {

			// @FIXME: 이럴 경우 arr[8]과 같이 *repeat가 아닌 직접 index를 입력하는 경우 문제가 발생할 수는 있다. 하지만 현재는 문제가 없고 성능을 대폭 향상 시킬수 있기에 적용함. 추후 length가 변경되면 다시 watch를 거는 식으로 수정 예정.
			return;
		}

		// setter watch를 사용할 수 없는 경우,
		if (
			(prop in object && !desc)
			|| (desc && desc.configurable === false)
			|| (desc && desc.writable === false)
			|| (desc && desc.get)
		) {
			return $dirtyCheck(object, prop, callback, object[prop]);
		}

		/// setter에 watcher를 등록한다.
		var value = object[prop];
		var setter = function(newValue) {

			var oldValue = value;

			if (Object.is(value, newValue)) {
				return;
			}

			//if (newValue instanceof Date) {
			//	DATE_SET_METHOD.forEach(function(p) {
			//		newValue[p] = function() {
			//			Date.prototype[p].apply(this, arguments);
			//			applyWatchCallback(object, prop, newValue, oldValue);
			//		}
			//	});
			//}

			value = newValue;
			applyWatchCallback(object, prop, newValue, oldValue);
		};
		setter.$isWatch = true;
		setter.$callbacks = [callback];


		Object.defineProperty(object, prop, {
			enumerable: true,
			configurable: true,
			set: setter,
			get: function() {
				return value;
			}
		});
	}


	function $unwatch(object, prop, callback) {
		if (!object || typeof object !== "object") {
			return;
		}

		// for dirty Check
		callback.$canceled = true;

		// ...
		var desc = Object.getOwnPropertyDescriptor(object, prop);
		if (desc && desc.set && desc.set.$isWatch) {
			var setter = desc.set;
			var index = setter.$callbacks.indexOf(callback);

			setter.$callbacks.splice(index, 1);
			if (setter.$callbacks.length === 0) {
				var value = object[prop];
				delete object[prop];
				object[prop] = value;
			}
		}
	}


	window.$watch = $watch;
	window.$unwatch = $unwatch;


	module.factory("$watch", function() {
		return $watch;
	});

	module.factory("$unwatch", function() {
		return $unwatch;
	});


})(window, document);