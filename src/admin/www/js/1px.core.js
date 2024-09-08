module.factory("$location", function() {
	return {
		search: function() {
			var ret = {};
			var a = location.search.substr(1).split('&');
			for (var i = 0; i < a.length; i++) {
				var b = a[i].split('=');
				ret[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
			}
			return ret;
		}
	}
});


module.factory("$localStorage", function() {
	return function(key) {
		var item = Object.create({
			save: function(data) {
				if (data) Object.assign(this, data);
				localStorage.setItem(key, JSON.stringify(this));
			}
		});

		Object.assign(item, JSON.parse(localStorage.getItem(key)));
		return item;
	}
});


module.factory("$localStorageObject", function() {

	return function(key) {
		var proto = {
			save: function() {
				localStorage.setItem(key, JSON.stringify(this));
			}
		};

		var item = JSON.parse(localStorage.getItem(key)) || {};
		Object.setPrototypeOf(item, proto);
		return item;
	}
});


module.factory("$cookie", function() {
	return {
		get: function(cname) {
			var name = cname + "=";
			var decodedCookie = decodeURIComponent(document.cookie);
			var ca = decodedCookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) === 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		}
	}
});


module.factory("url", function() {
	return {
		parse: function() {
			return location.pathname.split("/").slice(1).map(decodeURIComponent);
		},

		search: function() {
			var ret = {};
			location.search.slice(1).split("&").forEach(function(o) {
				o = o.split("=");
				ret[o[0]] = decodeURIComponent(o[1]);
			});
			return ret;
		}
	}
});


//////////////////


module.pipe("e", function() {
	return function(value) {
		return value;
	}
});

module.pipe("date", function() {
	return function(value, format) {
		return Date.format(format, value);
	}
});

module.pipe("number", function() {
	return function(value) {
		return Number.format(value);
	}
});


module.pipe("currency", function() {
	return function(value, currency) {
		return Number.format(+value) + " " + currency;
	}
});


module.pipe("compact", function() {
	return function(value, arg) {
		return Array.isArray(value) ? value.filter(x => x) : "";
	}
});

module.pipe("join", function() {
	return function(value, arg) {
		return Array.isArray(value) ? value.join(arg) : "";
	}
});


//////////////////


module.pipe("highlight", function() {
	return function(value, search) {
		search = Array.isArray(search) ? search : [search];
		search = new RegExp(search.join("|"), "g");

		return value.toString().replace(search, function(a) {
			return "<highlight>" + a + "</highlight>";
		})
	}
});


module.pipe("blog", function() {

	function traversal2(el, fn) {
		var stack = [];

		var node = el.firstChild;

		while (node) {
			if (node.nextSibling) {
				stack.push(node.nextSibling);
			}

			if (node.nodeType === 1) {
				stack.push(node);
				stack.push(false);

				var ret = fn.start(node);
				if (ret === false) {
					node = null;
				}
				else {
					node = node.firstChild;
				}
			}
			else if (node.nodeType === 3) {
				fn.text(node);
				node = null;
			}


			if (!node) {
				node = stack.pop();
			}

			if (node === false) {
				node = stack.pop();
				fn.end(node);
				node = stack.pop();
			}
		}
	}


	var div = document.createElement("div");

	return function(value) {

		div.innerHTML = value;

		Array.from(div.querySelectorAll("a")).forEach(function(a) {
			Array.from(a.childNodes).forEach(function(node) {
				switch (node.tagName) {
					case "IFRAME":
					case "DIV":
					case "P":
						insertAfter(node, a);
				}
			});
		});

		var html = document.createElement("div");
		var p = document.createElement("p");
		html.appendChild(p);

		traversal2(div, {
			start: function(node) {
				switch (node.tagName) {
					case "BR":
						p.appendChild(node);
						return false;

					case "A":
						node = node.cloneNode(true);
						node.setAttribute("target", "_blank");

						var href = node.getAttribute("href") || "";
						if (!node.getAttribute("type")) {
							node.setAttribute("type", href);
						}

						if (href.slice(0, 4) !== "http" && href.slice(0, 1) !== "/") {
							node.removeAttribute("href");
						}

						p.appendChild(node);
						return false;

					case "IFRAME":
						if (node.getAttribute("is") === "iframe-widget") {
							var widget = document.createElement(node.getAttribute("name"));
							widget.setAttribute("data", node.getAttribute("data"));
							node = widget;
						}
						else if (node.hasAttributes("width") && node.getAttribute("height")) {
							var width = +node.getAttribute("width");
							var height = +node.getAttribute("height");
							if (width && height) {
								var ptop = +(height / width * 100).toFixed(2);
								ptop = Math.max(0, Math.min(ptop, 100));

								var wrap = document.createElement("iframe-wrap");
								wrap.style.paddingTop = ptop + "%";
								wrap.appendChild(node);
								node = wrap;
							}
						}


						html.appendChild(node);
						p = document.createElement("p");
						html.appendChild(p);

						return false;

					case "IMG":
						if (node.hasAttributes("width") && node.getAttribute("height")) {
							var width = node.getAttribute("width");
							var height = node.getAttribute("height");

							if (width && height) {
								var ptop = +(height / width * 100).toFixed(2);
								ptop = Math.max(0, Math.min(ptop, 100));

								var wrap = document.createElement("iframe-wrap");
								wrap.style.paddingTop = ptop + "%";
								wrap.appendChild(node);
								node = wrap;
							}
						}


						html.appendChild(node);
						p = document.createElement("p");
						html.appendChild(p);
						return false;
				}
			},

			text: function(text) {
				p.appendChild(text.cloneNode(true));
			},

			end: function(node) {

				switch (node.tagName) {
					case "DIV":
					case "P":
						if (p.lastChild && p.lastChild.nodeName !== "BR") {
							p.appendChild(document.createElement("br"));
						}
						return false;
				}
			}
		});

		return html.innerHTML;
	}
});


module.service("http", function(self, http) {
	return {
		init: function() {
			self.get = self.get || self.getAttribute("get");
			self.hasmore = false;
			self.loading = false;
			self.loading_more = false;
			self.complete = false;

			if (self.hasAttribute("[params]")) {
				$$watch("params", self, function() {
					self.fetch();
				});
			}
			else {
				self.fetch();
			}
		},

		clear: function() {
			self.pages = [];
			self.res = [];
			self.hasmore = null;
		},

		fetch: function() {
			if (!self.get) return;
			if (self.hasAttribute("[params]") && self.params === undefined) return;

			self.loading = true;
			http.GET(self.get, self.params).then(function(res) {
				self.loading = false;
				self.complete = true;

				self.res = res;
				self.hasmore = self.res.more;

				self.pages = self.pages || [];
				self.pages.push(res);
			});
		},

		more: function() {
			var params = Object.assign(self.params || {}, {cursor: self.res.next});

			self.loading_more = true;
			return http.GET(self.get, params).then(function(res) {
				self.loading_more = false;

				self.res = res;
				self.pages = self.pages || [];
				self.pages.push(res);

				/// @FIXME!!!
				$nextFrame(function() {
					self.hasmore = self.res.more;
				});
			});
		}
	}
});


module.factory("naverpay", function($cookie) {
	IMP.init('imp45283511');
//	IMP.init('imp41073887');

	return {
		apply: function(items, option) {

			var btn = document.getElementById("naver-pay-btn");
			if (btn) {
				btn.innerHTML = "";
			}

			option = option || {};
			option.COUNT = option.COUNT || 1;

			var naverProducts = [];
			var naverZZimProducts = [];
			var amount = 0;

			foreach(items, function(item) {

				var product = {};
				product.id = item.id;
				product.name = item.name;
				product.basePrice = item.price;
				product.taxType = "TAX_FREE";
				product.quantity = item.qty;
				product.infoUrl = location.protocol + "//" + location.hostname + "/product/" + item.id;
				product.imageUrl = item.thumbnail && item.thumbnail.src;

				product.shipping = {
					groupId: "",
					method: "DELIVERY",
					baseFee: 3000,
					feePayType: "PREPAYED", //PREPAYED(선불), CASH_ON_DELIVERY(착불)
					feeRule: {
						freeByThreshold: 50000
					}
				};

				amount += (product.basePrice * product.quantity);
				naverProducts.push(product);


				var zzim = {};
				zzim.id = item.id;
				zzim.name = item.name;
				zzim.desc = item.name;
				zzim.uprice = item.price;
				zzim.url = location.protocol + "//" + location.hostname + "/product/" + item.id;
				zzim.image = item.thumbnail && item.thumbnail.src;
				naverZZimProducts.push(zzim);
			});


			naver.NaverPayButton.apply({
				BUTTON_KEY: "F15C84DF-94D4-4F90-97EC-2098EB390320",
				TYPE: "A", //버튼 스타일
				COLOR: 1, //버튼 색상타입
				COUNT: option.COUNT, // 네이버페이버튼 + 찜하기버튼 모두 출력 여부
				ENABLE: "Y", //네이버페이 활성여부(재고부족 등에는 N으로 비활성처리)
				EMBED_ID: "naver-pay-btn", //네이버페이 버튼 UI가 부착될 HTML element의 ID

				BUY_BUTTON_HANDLER: function() {
					IMP.request_pay({
						pg: 'naverco',
						merchant_uid: 'merchant_' + new Date().getTime(), //상점에서 관리하시는 고유 주문번호를 전달
						name: items[0].name + (items.length <= 1 ? "" : "외 " + (items.length - 1) + "개"),
						amount: amount,
						naverProducts: naverProducts,
						naverInterface: {
							"cpaInflowCode": $cookie.get("CPAValidator"),
							"naverInflowCode": $cookie.get("NA_CO"),
							"saClickId": $cookie.get("NVADID")
						}
					});
				},

				WISHLIST_BUTTON_HANDLER: function() {
					IMP.naver_zzim({
						naverProducts: naverZZimProducts
					});
				}
			});
		}
	}
});




