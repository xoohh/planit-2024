(function(window, document, undefined) {


	function makeRef($scope, tmpl) {
		$traversal(tmpl, function(el) {
			if (el.nodeType !== 1) {
				return;
			}

			foreach(el.attributes, function(attr) {
				var attrName = attr.name;
				// Reference Syntax
				if (attrName.charAt(0) === "$") {
					var prop = $dashToCamelCase(attrName);
					$scope[prop] = el;
				}
			});
		});
	}


	app.$service = {};

	app.service = function(name, factory) {
		app.$service[name] = factory;
	};

	var uuid = 1000;

	app.service.create = function(element, $scope, $def) {
		if (!element || !element.tagName) {
			return null;
		}

		var service = app.$service[element.tagName.toLowerCase()];
		if (!service) {
			return null;
		}

//		element = element.cloneNode(false);

		/// @TODO: 이렇게 만드는걸 function으로 만들자..
		var controllerFactory = createFactory(service);
		controllerFactory.$inject.values["self"] = element;

		var controller = module.invoke(controllerFactory);
		for (var prop in controller) {
			if (controller.hasOwnProperty(prop)) {
				element[prop] = controller[prop];
			}
		}

		makeRef($scope, element);
		$compile(element, $scope, $def);

		return element;
	};

	app.$templates = {};
	app.$components = {};

	app.component = function(name, factory) {
		app.$components[name] = factory;
	};


	function moveToFrag(frag, nodes) {
		foreach(Array.from(nodes), function(node) {
			node.tagName === "TEMPLATE" ? moveToFrag(frag, node.content.childNodes) : frag.appendChild(node);
		});

		return frag;
	}


	//////// Template Engine
	function $replaceTemplateContents(template, el) {
		var content_frag = moveToFrag(document.createDocumentFragment(), el.childNodes);
		var contents = template.querySelectorAll("content");
		var contents_noselect = [];

		// <content select=""></content>
		foreach(contents, function(content) {
			var select = content.getAttribute("select");
			if (!select) {
				contents_noselect.push(content);
				return;
			}

			var frag = document.createDocumentFragment();
			foreach(content_frag, function(node) {
				if (node.nodeType === 1 && node.match(select)) {
					frag.appendChild(node);
				}
			});

			content.parentNode.replaceChild(frag, content);
		});


		// <content></content>
		foreach(contents_noselect, function(content) {
			content.parentNode.replaceChild(content_frag, content);
		});

		return template;
	}


	function $bindLinkFunction(element, linkFn) {
		if (!linkFn) {
			return;
		}

		var controllerFactory = createFactory(linkFn);
		controllerFactory.$inject.values["self"] = element;

		var controller = module.invoke(controllerFactory);

		for (var prop in controller) {
			if (controller.hasOwnProperty(prop)) {
				element[prop] = controller[prop];
			}
		}

		if (typeof element.init === "function") {
			element.init();
		}
	}

	function $createWebComponent(name, template, _extends, vars, webcomponent) {

		var prototype = {

			attachedCallback: function() {
				var self = this;

				// 현재 컨텐츠 보관
				var originalContents = [];
				var templates = {};
				foreach(this.childNodes, function(node) {
					originalContents.push(node);
					if (node.tagName === "TEMPLATE") {
						var name = node.getAttribute("name");
						templates[name] = node;
					}
				});

				this.$$originalContents = originalContents;
				this.$$templates = templates;

				/// 템플릿 컴파일
				_makeTemplate(template);
				var tmpl = document.importNode(template.content, true);


				// <slot> <-> <template> 적용
				$traversal(tmpl, function(node) {
					if (node.tagName === "SLOT") {

						var name = node.getAttribute("name");
						if (!self.$$templates[name]) {
							node.parentNode.removeChild(node);
							return;
						}

						_makeTemplate(self.$$templates[name]);
						var t = document.importNode(self.$$templates[name].content, true);
						node.parentNode.replaceChild(t, node);
					}
				});

				/// var macro
				var $def = {};
				foreach(vars, function(node) {
					var name = node.getAttribute("name");
					var value = node.innerText;
					$def[name] = {"type": "(macro)", "value": "(" + value + ")"};
				});


				makeRef(this, tmpl);

				/// ++ SERVICE.create
				var services = [];
				foreach(webcomponent.childNodes, function(node) {
					var s = app.service.create(node, self, $def);
					s && services.push(s);
				});


				// 컨트롤러 연동
				$bindLinkFunction(this, app.$components[name]);
				$compile(tmpl, this, $def);
				$compile_process_element(template, this, $def, this);

				/// <content select="">에 따라 재구성 후 렌더링
				var content = $replaceTemplateContents(tmpl, this);

				if (this.tagName === "IFRAME") {
					this.contentWindow.document.body.innerHTML = "";
					this.contentWindow.document.body.appendChild(content);
				}
				else {
					this.innerHTML = "";
					this.appendChild(content);
				}

				/// ++ SERVICE.init
				foreach(services, function(service) {
					typeof service.init === "function" && service.init();
				});
			},

			detachedCallback: function() {

				// 소멸자 호출
				if (typeof this.$destroy === "function") {
					this.$destroy();
				}

				/// 기존 컨텐츠로 원복한다.
				var frag = document.createDocumentFragment();
				foreach(this.$$originalContents, function(node) {
					frag.appendChild(node);
				});

				if (this.tagName === "IFRAME") {

				}
				else {
					this.innerHTML = "";
					this.appendChild(frag);
				}

				delete this.$$originalContents;
			},

			/// Scope 기능
			createdCallback: function() {
				this.$$template = app.$templates[this.tagName.toLowerCase()];
			},

			$watch: function(script, callback, args, def) {
				var ret = $$watch(script, this, callback, args, def);
				this.dispatchEvent(new CustomEvent("watch-updated"));
				return ret;
			}
		};

		return $registerElement(name, prototype, _extends);
	}


	$registerElement("web-component", {

		createdCallback: function() {
			var name = this.getAttribute("name").toLocaleLowerCase();
			var template = this.querySelector("template");
			var _extends = this.getAttribute("extends");
			var vars = this.querySelectorAll("var");

			app.$templates[name] = template;
			$createWebComponent(name, template, _extends, vars, this);
		}
	});


	$registerElement("dom-bind", {

		attachedCallback: function() {
			if (!this.parentNode) {
				return;
			}

			var self = this;
			var template = this;
			var name = this.getAttribute("link");
			this.container = this.parentNode;

			/// 템플릿 컴파일
			_makeTemplate(template);
			var tmpl = document.importNode(template.content, true);

			/// ++ SERVICE.create
			var services = [];
			foreach(tmpl.childNodes, function(node) {
				var s = app.service.create(node, self, {});
				s && services.push(s);
			});

			makeRef(this, tmpl);
			$bindLinkFunction(this, app.$components[name]);
			$compile(tmpl, this);

			/// ++ SERVICE.init
			foreach(services, function(service) {
				typeof service.init === "function" && service.init();
			});

			this.parentNode.replaceChild(tmpl, this);
		},

		/// Scope 기능
		createdCallback: function() {
			this.$$template = app.$templates[this.tagName.toLowerCase()];
		},

		$watch: function(script, callback, args, def) {
			def = def || {};
			return $$watch(script, this, callback, args, def);
		}


	}, "template");

})(window, document);