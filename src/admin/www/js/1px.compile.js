(function(window, document, undefined) {

	function $compile(el, $scope, $def) {
		$def = $def || {};
		$def["this"] = {type: "(literal)", value: $scope};
		$traversal(el, $compile_process, $scope, $def);
	}

	function $compile_process(node, $scope, $def) {

		if (node.nodeType === 3) {
			return $compile_process_textNode(node, $scope, $def);
		}

		if (node.nodeName === "SCRIPT" || node.nodeName === "STYLE") {
			return false;
		}

		if (node.nodeName === "TEMPLATE") {
			$compile_process_element(node, $scope, $def);
			return false;
		}

		if (node.tagName === "FORM") {


			function addClass(input, className) {
				while (input !== node) {
					input.classList.add(className);
					input = input.parentNode;
				}
			}

			function removeClass(input, className) {
				while (input !== node) {
					input.classList.remove(className);
					input = input.parentNode;
				}
			}

			if (!node.$validate) {
				node.$validate = function() {

					var $valid = true;
					var re_int = /^\d+$/;
					var re_hashtag = /^#./;

					/// @TODO: 현재는 required만 있지만 validate를 추가해서 value < 5와 같은 조건문도 만들수 있도록 해보자.
					foreach(node.querySelectorAll("*[required]"), function(input) {
						input.$valid = true;
						input.$error = {};
						removeClass(input, "invalid");

						var value = input.$getValue ? input.$getValue() : input.value;

						// int
						if (input.getAttribute("required") === "int" && !re_int.test(value)) {
							input.$valid = false;
						}

						// number
						else if (input.getAttribute("required") === "number" && isNaN(+value)) {
							input.$valid = false;
						}

						// hashtag
						else if (input.getAttribute("required") === "hashtag" && !re_hashtag.test(value)) {
							input.$valid = false;
						}

						else if (input.value === "" || input.value === undefined || input.value === null || input.value.length === 0) {
							input.$valid = false;
						}

						if (input.$valid === false) {
							$valid = false;
							input.$error = {required: true};
							addClass(input, "invalid");
						}
					});

					return $valid;
				};

				// 엔터시 submit
				node.addEventListener("submit", function(e) {
					if (!node.hasAttribute("method")) {
						e.preventDefault();
					}
				});

				node.addEventListener("keypress", function(e) {
					if (e.keyCode === 13) {

						console.log("!!!");

						if (e.target.tagName !== "INPUT") {
							return;
						}

						e.preventDefault();
						e.stopPropagation();

						setTimeout(function() {
							node.dispatchEvent(new CustomEvent("submit"));
						});
					}
				}, true);
			}
		}

		if (node.nodeType === 1) {
			return $compile_process_element(node, $scope, $def);
		}
	}

	function $compile_process_element(el, $scope, $def, to) {

		to = to || el;

		/// @FIXME: 왜 2번 컴파일이 되지??
		if (el === to && to.compiled) {
			return;
		}
		to.compiled = true;


		var hasTemplate = false;
		if (el.hasAttribute("*repeat")) {
			hasTemplate = true;
			$$directiveTable["*repeat"](el, $scope, to, $def);
		}

//		if (el.hasAttribute("*template")) {
////			hasTemplate = true;
//			$$directiveTable["*template"](el, $scope, to, $def);
//		}

		if (hasTemplate) {
			return false;
		}

		foreach(el.attributes, function(attr) {

			var attrName = attr.name;
			var attrValue = attr.value;
			var prop;

			var directive;
			var parse;

			directive = $$directiveTable[attrName];
			if (directive) {
				return directive(el, $scope, to, $def);
			}

			directive = module.directive.get(attrName);
			if (directive) {
				return directive(el, $scope, to, $def);
			}


			/// [(value)] : two-way binding...
			if (attrName === "[(value)]") {

				// @FIXME!!!
				$scope.$watch(attrValue, function($scope, el, value) {

					if (el.$setValue) {
						el.$setValue(value);
						el.dispatchEvent(new CustomEvent("dom-changed"));
						return;
					}

					if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
						value = (value === null || value === undefined) ? "" : value;
					}

					// value값 재조정시 커서 이동 문제 발생함.
					if (el.value != value) {
						el["value"] = value;

						// @FIXME: 옵션값 repeat등으로 새롭게 만들었을때 적용 안되는 버그
						$nextFrame(function() {
							el["value"] = value;
						})
					}

					el.dispatchEvent(new CustomEvent("dom-changed"));

				}, [to], $def);


				parse = $parse(attrValue, $def);
				el.addEventListener("input", function() {

					var value = el.$getValue ? el.$getValue() : el.value;
					if (el.hasAttribute("number") && +value === +value) {
						value = +value;
					}

					parse.assign($scope, value);
				});

				return;
			}


			/// [(value)] : two-way binding...
			if (attrName === "[(inner-text)]") {


				console.log("!!!", "[(inner-text)]");


				// @FIXME!!!
				$scope.$watch(attrValue, function($scope, el, value) {

					if (String(value) !== value) {
						value = "";
					}

					if (el.innerText != value) {
						el.innerText = value;
					}

					el.dispatchEvent(new CustomEvent("dom-changed"));

				}, [to], $def);


				parse = $parse(attrValue, $def);
				el.addEventListener("input", function() {
					var value = el.innerText;
					parse.assign($scope, value);

					console.log(value);
				});

				return;
			}


			/// [(checked)] : two-way binding...
			if (attrName === "[(checked)]") {

				// @FIXME!!!
				$scope.$watch(attrValue, function($scope, el, value) {

					var el_value = el.hasAttribute("value") ? el.value : true;

					if (Array.isArray(value)) {
						el["checked"] = !!~value.indexOf(el_value);
					}
					else {
						el["checked"] = el_value === value;
					}

					el.dispatchEvent(new CustomEvent("dom-changed"));

				}, [to], $def);

				parse = $parse(attrValue, $def);

				el.addEventListener("change", function() {
					var value = el.$getValue ? el.$getValue() : el.hasAttribute("value") ? el.value : true;
					var arr = parse($scope, value);

					if (Array.isArray(arr)) {
						if (el.checked) {
							if (!~arr.indexOf(value)) {
								arr.push(value);
							}
						}
						else {
							var index = arr.indexOf(value);
							if (~index) {
								arr.splice(index, 1);
							}
						}
						parse.assign($scope, arr.slice());

						return;
					}

					if (el.checked) {
						parse.assign($scope, value);
					}
					else {
						parse.assign($scope, null);
					}
				});

				return;
			}

//
//			/// [(checked)] : two-way binding...
//			if (attrName === "[(selected)]") {
//
//				parse = $parse(attrValue, $def);
//				document.addEventListener("change", function(e) {
//					var select = el.closest("select");
//					if (!select || select !== e.target) {
//						return;
//					}
//
//					if (el.selected) {
//						select.value = el.value;
//					}
//
//					var value = el.$getValue ? el.$getValue() : el.value;
//					var arr = parse($scope, value);
//					if (Array.isArray(arr)) {
//						if (el.selected) {
//							if (!~arr.indexOf(value)) {
//								arr.push(value);
//							}
//						}
//						else {
//							var index = arr.indexOf(value);
//							if (~index) {
//								arr.splice(index, 1);
//							}
//						}
//						parse.assign($scope, arr.slice());
//
//						return;
//					}
//
//
//					console.log(select, el.selected);
//				});
//
//
//
//				return;
//			}


			//// 프로퍼티 two-way binding
			//if (attrName.slice(0, 2) === "[(" && attrName.slice(-2) === ")]") {
			//	prop = attrName.slice(2, -2);
			//	$scope.$watch(attrValue, function($scope, value) {
			//		el[prop] = value;
			//	});
			//
			//	if (typeof el.watch === "function") {
			//		el.watch(prop, function(el, value) {
			//			$scope[prop] = value;
			//			var parse = $parse(attrValue, $def);
			//			parse.assign($scope, el[prop]);
			//		});
			//	}
			//
			//	return;
			//}

			// 프로퍼티 접근자. Property e.g) [prop]="value"
			if (attrName.charAt(0) === "[" && attrName.slice(-1) === "]") {

				// attrbute [attr.id]="sss"
				if (attrName.substr(1, 5) === "attr.") {
					prop = attrName.slice(6, -1);

					$scope.$watch(attrValue, function($scope, el, prop, value) {
						value || value === 0 ? el.setAttribute(prop, value) : el.removeAttribute(prop);
						el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
					}, [to, prop], $def);

					return;
				}

				// attrbute [style.background-image-url]="value" -> url(value)
				if (attrName === "[style.background-image.url]") {
					$scope.$watch(attrValue, function($scope, el, prop, value) {
						el.style["background-image"] = "url('" + encodeURI(value) + "')";
						el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
					}, [to, prop], $def);

					return;
				}

				// attrbute [style.id]="sss"
				if (attrName.substr(1, 6) === "style.") {
					prop = attrName.slice(7, -1);
					$scope.$watch(attrValue, function($scope, el, prop, value) {
						el.style[prop] = value;
						el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
					}, [to, prop], $def);

					return;
				}


				// property
				prop = $dashToCamelCase(attrName.slice(1, -1));


				// [visible] 프로퍼티
				if (prop === "visible") {
					$scope.$watch(attrValue, function($scope, el, prop, value) {
						el["hidden"] = !value;
						el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
					}, [to, prop], $def);
					return;
				}

				// [visible] 프로퍼티
				if (prop === "disabled") {
					$scope.$watch(attrValue, function($scope, el, prop, value) {
						value ? el.setAttribute("disabled", "") : el.removeAttribute("disabled");
						el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
					}, [to, prop], $def);
					return;
				}

				// [inner-html] 프로퍼티
				if (attrName === "[inner-html]") {
					prop = "innerHTML";
				}

				$scope.$watch(attrValue, function($scope, el, prop, value) {
					el[prop] = value;
					el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
				}, [to, prop], $def);

				return;
			}


			// (click)
			if (attrName === "(click)") {
				var clickHandler = $parse(attrValue, $def);

				$touch.bind(to, function() {

					var promise;

					function releaseTouch() {
						to.classList.remove("active");
						promise = null;
					}

					return {
						press: function() {
							if (promise) {
								return;
							}

							to.classList.add("active");
						},

						cancel: function() {
							releaseTouch();
						},

						release: function() {
							if (promise) {
								return;
							}

							releaseTouch();
						},

						tap: function(event) {
							if (promise) {
								return;
							}

							// @FIXME: 임시 event, go, back 연동
							delete $scope.event;
							$scope.event = event;

							$scope.go = window.go;
							$scope.back = window.back;

							to.classList.add("active");

							promise = Promise.resolve().then(function() {
								return clickHandler($scope);
							}).catch(function(e) {
								console.error(e);
								throw e;
							}).finally(function() {
								releaseTouch();
							});
						}
					}
				});

				return;
			}

			// 이벤트 핸들러. Event Handler ex) (click)="..."
			if (attrName.charAt(0) === "(" && attrName.slice(-1) === ")") {
				var eventType = $dashToCamelCase(attrName.slice(1, -1));
				parse = $parse(attrValue, $def);

				to.addEventListener(eventType, function(event) {

					if (eventType === "submit") {
						event.preventDefault();
					}


					// @FIXME: 임시 event, go, back 연동
					delete $scope.event;
					$scope.event = event;

					$scope.go = window.go;
					$scope.back = window.back;

					return parse($scope);
				});

				return;
			}

			// attr="{{foo}}"
			if (attrValue.indexOf("{{") >= 0) {

				var scripts = [];
				$interpolate(attrValue, function(text, isExpr, isLast) {
					if (isExpr) {
						var script = "(" + text.slice(2, -2) + ")";
						scripts.push(script);
					}
					else {
						scripts.push('"' + text.replace(/"/g, '\\"') + '"');
					}
				});
				scripts = scripts.join("+");

				$scope.$watch(scripts, function($scope, value) {
					el.setAttribute(attrName, value);
					el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
				}, [], $def);
			}
		});

//		to.dispatchEvent(new CustomEvent("ready"));
	}


	function $compile_process_textNode(textNode, $scope, $def) {
		var value = textNode.nodeValue;

		$interpolate(value, function(text, isExpr, isLast) {
			if (isLast) {
				textNode.nodeValue = text;
				return;
			}

			var _textNode = document.createTextNode(text);
			textNode.parentNode.insertBefore(_textNode, textNode);

			if (isExpr) {
				var script = text.slice(2, -2);
				$scope.$watch(script, __nodeValue, [_textNode], $def);
			}
		});
	}

	function __nodeValue($scope, node, value) {
		if (value === null || value === undefined) {
			value = "";
		}

		node.nodeValue = value;
		node.parentNode && node.parentNode.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
	}


	var $$directiveTable = {

		"*if": function() {
			function __if($scope, el, placeholder, value) {
				if (value) {
					placeholder.parentNode && placeholder.parentNode.replaceChild(el, placeholder);
				}
				else {
					el.parentNode && el.parentNode.replaceChild(placeholder, el);
				}

				el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
			}

			return function(el, $scope, to, $def) {
				var script = el.getAttribute("*if");
				var placeholder = document.createComment(" if(" + script + "):");
				$scope.$watch(script, __if, [to, placeholder], $def);
			}
		}(),

		"*template": function() {

			function __template($scope, el, $def, value) {
				el.innerHTML = "";


				var template = document.getElementById(value);
				if (!template) {
					return;
				}

				_makeTemplate(template);

				var content = document.importNode(template.content, true);
				$compile(content, $scope, $def);

				el.appendChild(content);
				el.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
			}

			return function(el, $scope, to, $def) {
				var script = el.getAttribute("*template");
				$def = Object.assign({}, $def);

				$scope.$watch(script, __template, [to, $def], $def);
				return false;
			}
		}(),

		"*repeat": function() {

			function __repeatItem($scope, el, placeholderStart, repeatNode, placeholderEnd, container, rows, row, index, $def, length) {
				if (length === undefined) return;
				length = length || 0;

				for (var i = length; i < container.length; i++) {
					$removeNode(container[i]);
				}

				var frag = document.createDocumentFragment();

				for (i = container.length; i < length; i++) {
					var $repeatNode = repeatNode.cloneNode(true);
					container[i] = $repeatNode;

					$def = Object.assign({}, $def);

					if (row) {
						$def[row] = {type: "(macro)", value: rows + "[" + i + "]"};
					}

					if (index) {
						$def[index] = {type: "(literal)", value: i};
					}

					$compile($repeatNode, $scope, $def);
					frag.appendChild($repeatNode);
				}
				container.length = length;

				if (placeholderEnd.parentNode) {
					placeholderEnd.parentNode.insertBefore(frag, placeholderEnd);
				}
				placeholderEnd.dispatchEvent(new CustomEvent("dom-changed", {bubbles: true}));
			}

			return function(el, $scope, to, $def) {
				var rows, row, index, lastIndex;
				var script = el.getAttribute("*repeat");
				rows = script;

				lastIndex = rows.lastIndexOf(" as ");
				if (lastIndex !== -1) {
					rows = rows.substring(0, lastIndex);
					row = $trim(script.substring(lastIndex + 4));

					lastIndex = row.lastIndexOf(",");
					if (lastIndex !== -1) {
						index = $trim(row.substring(lastIndex + 1));
						row = $trim(row.substring(0, lastIndex));
					}
				}

				var repeatNode = el.cloneNode(true);
				repeatNode.removeAttribute("*repeat");

				var placeholderStart = document.createComment(" repeat(" + script + "): ");
				var placeholderEnd = document.createComment(" endrepeat ");

				var frag = document.createDocumentFragment();
				frag.appendChild(placeholderStart);
				frag.appendChild(placeholderEnd);
				el.parentNode.replaceChild(frag, el);

				$scope.$watch(rows + ".length", __repeatItem, [el, placeholderStart, repeatNode, placeholderEnd, [], rows, row, index, $def], $def);
				return false;
			}
		}()
	};

	window.$compile = $compile;
	window.$compile_process_element = $compile_process_element;

})(window, document);
