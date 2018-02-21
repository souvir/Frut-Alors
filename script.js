var ListFilter = (function() {

	var _ = function (input_container, result_container , listArrayToFilter) {
		var that = this;

		// Setup

		this.isOpened = false;

		this.input = $(input_container);
		this.result_container = $(result_container);
		this.list = listArrayToFilter;

		this.index = -1;

		// CONFIGURATION
		this.properties = {
			filter: _.FILTER_CONTAINS,
			item: _.ITEM,
			replace: _.REPLACE
		}
		for (var i in this.properties) {
			this[i] = this.properties[i];
		}


		this.status = $.create("h1", this.result_container, { textContent: "Cherchez un aliment." });
		this.ul = $.create("ul", this.result_container, { hidden: "hidden" });

		// Bind events

		$.bind(this.input, {
			"input": this.evaluate.bind(this),
			"keydown": function(evt) {
				var c = evt.keyCode;
				// If the dropdown `ul` is in view, then act on keydown for the following keys:
				// Enter / Esc / Up / Down
				if(that.isOpened) {
					switch (c) {
						case 13: // Enter
							if(that.index > -1) {
								evt.preventDefault();
								that.select();
							}
							break;
						case 27: // Esc
								that.close({ reason: "esc" });
							break;
						case 38: // Up arrow
								evt.preventDefault();
								that.previous();
							break;
						case 40: // Down arrow
								evt.preventDefault();
								that.next();
							break;
						default:
					}
				}
			}
		});

		$.bind(this.ul, {
			// Prevent the default mousedowm, which ensures the input is not blurred.
			// The actual selection will happen on click. This also ensures dragging the
			// cursor away from the list item will cancel the selection
			"mousedown": function(evt) {
				evt.preventDefault();
			},
			// The click event is fired even if the corresponding mousedown event has called preventDefault
			"click": function(evt) {
				var li = evt.target;

				if (li !== this) {
					while (li && !/li/i.test(li.nodeName)) {
						li = li.parentNode;
					}
					if (li && evt.button === 0) {  // Only select on left click
						evt.preventDefault();
						that.select(li, evt.target);
					}
				}
			}
		});

		_.all.push(this);
	};

	_.prototype = {
		set list(list) {
			if (Array.isArray(list)) {
				this._list = list;
			}
		},

		close: function (options) {

			if (!this.isOpened || !options) { return; }

			if(options.reason === "esc") {
				this.ul.setAttribute("hidden", "");
				this.status.textContent = "Cherchez un aliment.";
			}

			this.ul.setAttribute("hidden", "");
			this.isOpened = false;
			this.index = -1;

		},

		open: function () {
			this.ul.removeAttribute("hidden");
			this.isOpened = true;

		},

		next: function () {
			var count = this.ul.children.length;
			this.goto(this.index < count - 1 ? this.index + 1 : (count ? 0 : -1) );
		},

		previous: function () {
			var count = this.ul.children.length;
			var pos = this.index - 1;

			this.goto((this.index > -1) && pos !== -1 ? pos : count - 1);
		},

		// Highlights specific item without any checks!
		goto: function (i) {
			var listItem = this.ul.children;

			if (this.index > -1) { listItem[this.index].setAttribute("aria-selected", "false"); }

			this.index = i;

			if (i > -1 && listItem.length > 0) {
				listItem[i].setAttribute("aria-selected", "true");

				this.status.textContent = "→ " + listItem[i].textContent;

			}
		},

		select: function (selected, origin) {
			if (selected) {
				var siblingIndex = function (el) {
					/* eslint-disable no-cond-assign */
					for (var i = 0; el = el.previousElementSibling; i++);
					return i;
				};
				this.index = siblingIndex(selected);
			}

			// Assign the vaue to the input
			this.input.value = this.suggestions[this.index];

			this.evaluate();

		},

		evaluate: function() {
			var that = this;
			var inputValue = this.input.value;

			if (this._list.length > 0) {
				this.index = -1;
				// Populate list with options that match
				this.ul.innerHTML = "";

				this.suggestions = this._list
				.filter(function(item) {
					return that.filter(item, inputValue);
				});

				this.suggestions.forEach(function(text, index) {
					that.ul.appendChild(that.item(text, inputValue, index));
				});

				if (this.ul.children.length === 0) {

					this.status.textContent = "Frut alors !";

					this.close({ reason: "nomatches" });

				} else {
					this.open();

					this.status.textContent = this.ul.children.length + " Résultats";
				}
			}
			else {
				this.close({ reason: "nomatches" });

				this.status.textContent = "Frut alors !";
			}
		}
	};

	// Static methods/properties

	_.all = [];

	_.FILTER_CONTAINS = function (text, input) {
		return RegExp(input.trim(), "i").test(text);
	};

	_.FILTER_STARTSWITH = function (text, input) {
		return RegExp("^" + input.trim(), "i").test(text);
	};

	_.ITEM = function (text, input, item_id) {
		var html = text.replace(RegExp(input.trim(), "gi"), "<mark>$&</mark>");
		return $.create("li", null, {
			innerHTML: html,
			"aria-selected": "false",
		});
	};

	_.REPLACE = function (text) {
		this.input.value = text.value;
	};

	// Private functions



	// Helpers

	function $(expr) {
		return expr;
	}

	$.create = function(tag, inside, options) {
		var element = document.createElement(tag);

		inside ? $(inside).appendChild(element) : null;

		for (var i in options) {
			if (i in element) {
				element[i] = options[i];
			}
			else {
				element.setAttribute(i, options[i]);
			}
		}

		return element;
	};

	$.bind = function(element, options) {
		if (element) {
			for (var event in options) {
				var callback = options[event];

				event.split(/\s+/).forEach(function (event) {
					element.addEventListener(event, callback);
				});
			}
		}
	};

	// Initialization

	function init() {
		console.log("started !")
	}

	// Are we in a browser? Check for Document constructor
	if (typeof Document !== "undefined") {
		// DOM already loaded?
		if (document.readyState !== "loading") {
			init();
		}
		else {
			// Wait for it
			document.addEventListener("DOMContentLoaded", init);
		}
	}

	_.$ = $;

	return _;

})();
