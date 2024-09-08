(function () {

	if ( typeof window.CustomEvent === "function" ) return false;

	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
})();


(function (ELEMENT) {
	ELEMENT.matches = ELEMENT.matches ||
		ELEMENT.mozMatchesSelector ||
		ELEMENT.msMatchesSelector ||
		ELEMENT.oMatchesSelector ||
		ELEMENT.webkitMatchesSelector;

	ELEMENT.closest = ELEMENT.closest || function closest(selector) {
			var element = this;

			while (element) {
				if (element.matches(selector)) {
					return element;
				} else {
					element = element.parentElement;
				}

			}

			return null;
		};
}(Element.prototype));



function _makeTemplate(element) {

	if (element.tagName === "TEMPLATE" && !element.content) {
		var frag = document.createDocumentFragment();
		while(element.firstChild) {
			frag.appendChild(element.firstChild);
		}
		element.content = frag;
	}
}