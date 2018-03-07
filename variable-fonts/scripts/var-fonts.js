/* eslint-env browser */
/* eslint-disable no-var, prefer-template, strict, prefer-arrow-callback, object-shorthand, no-continue, no-undefined, no-constant-condition */
/*globals event*/

/*
 *	VARIABLE FONTS SCRIPTS
 *	=============================================
 */

/*
 *	COMPONENT: PAUSE ANIMATIONS BUTTON
 *	Toggles "has-anim" class; CSS selectors and JS
 *	should be written so that animations only run
 *	when this class is present
 *	----------------------------------------------
 */

(function () {
	'use strict';

	const animButton = document.getElementById('toggle-anim');

	if (animButton) {
		const toggleAnim = function() {
			const stateName = animButton.querySelector('.c-toggle-anim__state');
			if (animButton.getAttribute('aria-pressed') === 'true') {
				animButton.setAttribute('aria-pressed', 'false');
				stateName.innerText = animButton.getAttribute('data-unpressed-text');
				document.body.classList.add('has-anim');
			} else {
				animButton.setAttribute('aria-pressed', 'true');
				stateName.innerText = animButton.getAttribute('data-pressed-text');
				document.body.classList.remove('has-anim');
			}
		};

		const showAnimButton = function() {
			document.body.classList.add('has-anim');
			animButton.removeAttribute('aria-hidden');
			animButton.setAttribute('aria-pressed', 'false');
			animButton.addEventListener('click', toggleAnim, false);
		};

		showAnimButton();
	}
}());

/*
 *	POEM DEMO
 *	---------------------------------------------
 */

(function () {
	'use strict';

	const poemViewer = document.querySelector('.poem-viewer'),
		  poem = poemViewer.querySelector('.poem'),
		  poemSlides = poemViewer.querySelectorAll('.poem__slide'),
		  slidePaneWidth = 100 / poemSlides.length,
		  timeReservedForAxisTransition = 75,
		  lineByLineSemiInterval = -125,
		  lineByLineInterval = 100,
		  wordByWordInterval = 16;

	let poemIndex = 1;

	// UPDATE SLIDE FROM POEM CONTROLS
	const updateSlide = function(slideDir) {
		const currentSlide = poemViewer.querySelector('.poem__slide[data-current]');
		const prevBtn = poemViewer.querySelector('.poem__prev-btn');
		const nextBtn = poemViewer.querySelector('.poem__next-btn');
		const slideAnnouncer = document.getElementById('slideAnnouncer');

		const newSlide = slideDir === 'next' ?
			currentSlide.nextElementSibling :
			currentSlide.previousElementSibling;

		if (newSlide) {
			currentSlide.removeAttribute('data-current');
			currentSlide.setAttribute('aria-hidden', 'true');

			newSlide.setAttribute('data-current', 'true');
			newSlide.removeAttribute('aria-hidden');

			if (slideDir === 'next') {
				poemIndex++;
				poem.style.transform = 'translateX(-' + ((poemIndex - 1) * slidePaneWidth) + '%)';

				// Timeout = transition timing of the poem transform
				setTimeout(function(){
					const newWords = newSlide.querySelectorAll('.poem__line > span, .poem__line > span > span[class]');
					for (var i = 0; i < newWords.length; i++) {
						newWords[i].style.animationPlayState = 'running';
					}

					if (prevBtn.hasAttribute('disabled')) {
						prevBtn.removeAttribute('disabled');
					}

					if (!newSlide.nextElementSibling) {
						nextBtn.setAttribute('disabled', 'true');
					}
				}, 400);
			} else {
				poemIndex--;
				poem.style.transform = 'translateX(-' + ((poemIndex - 1) * slidePaneWidth) + '%)';

				// Timeout = transition timing of the poem transform
				setTimeout(function(){
					if (nextBtn.hasAttribute('disabled')) {
						nextBtn.removeAttribute('disabled');
					}

					if (!newSlide.previousElementSibling) {
						prevBtn.setAttribute('disabled', 'true');
					}
				}, 400);
			}
			slideAnnouncer.innerText = 'Slide ' + poemIndex + ' of ' + poemSlides.length;
		}
	};

	// SET UP POEM CAROUSEL FUNCTIONALITY AND SHOW FIRST SLIDE
	const setUpPoem = function() {
		const poemControls = document.createElement('ul');

		// Set up pagination
		poemControls.className = 'u-simple-list poem__controls';
		poemControls.innerHTML = '<li class="poem__prev"><button disabled class="poem__prev-btn"><span class="u-sr-only">Previous slide</span><svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="29"><path fill="none" stroke="#424F5E" stroke-width="2" stroke-miterlimit="10" d="M13.6 2.5l-12 12 12 12"/></svg></button></li>' +
								 '<li class="poem__next"><button class="poem__next-btn"><span class="u-sr-only">Next slide</span><svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="29"><path fill="none" stroke="#424F5E" stroke-width="2" stroke-miterlimit="10" d="M1 2.5l12 12-12 12"/></svg></button></li>';

		poemViewer.appendChild(poemControls);
		poemControls.querySelector('.poem__prev').addEventListener('click', function(){
			updateSlide('previous');
		});
		poemControls.querySelector('.poem__next').addEventListener('click', function(){
			updateSlide('next');
		});

		// Set up visually-hidden div which announces new slides
		const slideAnnouncer = document.createElement('p');
		slideAnnouncer.setAttribute('id', 'slideAnnouncer');
		slideAnnouncer.setAttribute('aria-live', 'polite');
		slideAnnouncer.setAttribute('aria-atomic', 'true');
		slideAnnouncer.setAttribute('class', 'u-sr-only');
		slideAnnouncer.innerText = 'Slide ' + poemIndex + ' of ' + poemSlides.length;
		poemViewer.appendChild(slideAnnouncer);

		// Show first slide
		poemSlides[0].style.display = 'block';
		poemSlides[0].setAttribute('data-current', 'true');
		poemViewer.style.display = 'block';

		// Hide inactive slides from screen reader
		for (var i = 1; i < poemSlides.length; i++) {
			poemSlides[i].setAttribute('aria-hidden', 'true');
		}

		// wait for layout to happen
		setTimeout(function() {
			// Assign animation offsets to each word of the poem
			for (var slide of poemSlides) {
				var pendingDuration = 0;
				for (var stanzaLine of slide.querySelectorAll('.poem__line')) {
					var stanzaWords = stanzaLine.querySelectorAll('span');
					var lines = [], currentLine = null, lineDuration = 0, lastOffset = Number.NEGATIVE_INFINITY, lastClass = '';

					// divide the poem words into animated lines or semi-lines
					for (var word of stanzaWords) {
						if (word.offsetLeft <= lastOffset || word.className !== lastClass || currentLine === null) {
							// finalize the current line, if any
							if (currentLine) {
								currentLine.style.animationDuration = lineDuration + 'ms';
								pendingDuration += lineDuration;
								lineDuration = 0;

								// if the next line is a semi-line, add the special animation delay modifier
								if (word.offsetLeft <= lastOffset) {
									pendingDuration += lineByLineSemiInterval;
								}

								// if the previous line hadd to be axis-animated, we have to delay more
								if (lastClass) {
									pendingDuration += timeReservedForAxisTransition;
								}
							}

							// create the next line
							currentLine = document.createElement('span');
							currentLine.style.animationDelay = (pendingDuration) + 'ms';
							pendingDuration += lineByLineInterval;
							lines.push(currentLine);

							// if the current line is a semi-line, we want to indent it
							if (word.offsetLeft <= lastOffset || (word.className !== lastClass && lines.length > 1 && lines[lines.length - 2].style.left === '1em')) {
								currentLine.style.position = 'relative';
								currentLine.style.left = '1em';
							}
						}

						// add the current word to the current line
						lastOffset = word.offsetLeft + word.offsetWidth;
						lastClass = word.className;
						const newWord = word.cloneNode(true);
						if (lastClass) {
							newWord.style.animationDelay = (pendingDuration + lineDuration + timeReservedForAxisTransition) + 'ms';
						}
						lineDuration += word.offsetWidth * (400 / 50);
						lineDuration += wordByWordInterval;
						currentLine.appendChild(newWord);
						currentLine.appendChild(document.createTextNode(' '));
					}

					// finalize the last line
					currentLine.style.animationDuration = lineDuration + 'ms';
					pendingDuration += lineDuration + lineByLineInterval;
					lineDuration = 0;

					// replace the default content by the new lines
					stanzaLine.textContent = '';
					for (var line of lines) {
						stanzaLine.appendChild(line);
					}
				}
			}
		}, 100);
	};

	setUpPoem();

	// ANIMATE FONT-WEIGHT ON HEADINGS WHEN THEY ARE IN VIEW
	const animateHeader = function(guideHeader, ratio) {
		if (ratio > 0) {
			if (false && guideHeader.tagName === 'H2') {
				setTimeout(function() {
					guideHeader.classList.add('in-view');
				}, 500);
			} else {
				guideHeader.classList.add('in-view');
			}
		} else if (false && guideHeader.tagName === 'H2') {
			setTimeout(function() {
				guideHeader.classList.remove('in-view');
			}, 500);
		} else {
			guideHeader.classList.remove('in-view');
		}
	};

	const guideHeaders = document.querySelectorAll('.guide-content h2');
	const guideHeadersObserver = new IntersectionObserver((entries) => {
		return entries.forEach((e) => {
			animateHeader(e.target, e.intersectionRatio);
		});
	}, { threshold: 0.3 });
	for (const guideHeader of guideHeaders) {
		guideHeadersObserver.observe(guideHeader);
		guideHeadersObserver.observe(guideHeader.closest('section'));
	}

	// DETECT GRADIENT TRANSITION SUPPORT
	const detectGradientTransitionSupport = function() {
		const gradientDetector = Object.assign(document.body.appendChild(document.createElement('div')), { id: 'no-gradient-transition-test' });
		requestAnimationFrame(function() {
			console.log(getComputedStyle(gradientDetector).backgroundImage);
			if (getComputedStyle(gradientDetector).backgroundImage !== 'linear-gradient(1deg, rgba(0, 0, 0, 0.5) 0%, rgba(102, 102, 102, 0.5) 100%)') {
				document.documentElement.classList.add('no-gradient-transition');
			}
			gradientDetector.remove();
		});
	};
	detectGradientTransitionSupport();

	// ICE DRIFT ANIMATION
	const startIceDriftAnimation = function() {
		if (document.body.classList.contains('has-anim')) {
			var svgBox = document.querySelector('.ice-floes > .svg-center').getBBox();
			var svgCenterX = svgBox.x + (svgBox.width / 2);
			var svgCenterY = svgBox.y + (svgBox.height / 2);
			for (var path of document.querySelectorAll('.ice-floes > path')) {
				var box = path.getBBox();
				var centerX = box.x + (box.width / 2);
				var centerY = box.y + (box.height / 2);
				var dx = (centerX - svgCenterX) / 1.25;
				var dy = (centerY - svgCenterY) / 1.25;
				path.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
				path.style.opacity = '.3';
			}
			document.querySelector('.ice-floes').classList.add('drift-started');
		}
	};

	// start directly on click
	document.querySelector('.poem-start').addEventListener('click', function(e) {
		e.preventDefault();
		document.querySelector('#poem').scrollIntoView({block: 'center', behavior: 'smooth'});
		startIceDriftAnimation();
		return false;
	});

	// also start once scrolling has revealed 10% of the poem
	const poemZoneObserver = new IntersectionObserver((entries) => {
		return entries.forEach((e) => {
			if (e.intersectionRatio >= 0.1) {
				startIceDriftAnimation();
			}
		});
	}, { threshold: 0.1 });
	poemZoneObserver.observe(document.querySelector('#poem'));
}());

/*
 *	DECOVAR ANIMATION
 *	---------------------------------------------
 */

(function () {
	'use strict';

	const decovarObserver = new IntersectionObserver((entries) => {
		return entries.forEach((e) => {
			if (e.intersectionRatio >= 0.1) {
				e.target.classList.add('is-in-view');
			} else {
				e.target.classList.remove('is-in-view');
			}
		});
	}, { threshold: 0.1 });
	decovarObserver.observe(document.querySelector('.vf-decovar'));
}());

/* eslint-disable */

/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
 *
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 */

(function(window, document) {
	'use strict';


	// Exits early if all IntersectionObserver and IntersectionObserverEntry
	// features are natively supported.
	if ('IntersectionObserver' in window &&
		'IntersectionObserverEntry' in window &&
		'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

	  // Minimal polyfill for Edge 15's lack of `isIntersecting`
	  // See: https://github.com/w3c/IntersectionObserver/issues/211
	  if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
		Object.defineProperty(window.IntersectionObserverEntry.prototype,
		  'isIntersecting', {
		  get: function () {
			return this.intersectionRatio > 0;
		  }
		});
	  }
	  return;
	}


	/**
	 * An IntersectionObserver registry. This registry exists to hold a strong
	 * reference to IntersectionObserver instances currently observering a target
	 * element. Without this registry, instances without another reference may be
	 * garbage collected.
	 */
	var registry = [];


	/**
	 * Creates the global IntersectionObserverEntry constructor.
	 * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
	 * @param {Object} entry A dictionary of instance properties.
	 * @constructor
	 */
	function IntersectionObserverEntry(entry) {
	  this.time = entry.time;
	  this.target = entry.target;
	  this.rootBounds = entry.rootBounds;
	  this.boundingClientRect = entry.boundingClientRect;
	  this.intersectionRect = entry.intersectionRect || getEmptyRect();
	  this.isIntersecting = !!entry.intersectionRect;

	  // Calculates the intersection ratio.
	  var targetRect = this.boundingClientRect;
	  var targetArea = targetRect.width * targetRect.height;
	  var intersectionRect = this.intersectionRect;
	  var intersectionArea = intersectionRect.width * intersectionRect.height;

	  // Sets intersection ratio.
	  if (targetArea) {
		this.intersectionRatio = intersectionArea / targetArea;
	  } else {
		// If area is zero and is intersecting, sets to 1, otherwise to 0
		this.intersectionRatio = this.isIntersecting ? 1 : 0;
	  }
	}


	/**
	 * Creates the global IntersectionObserver constructor.
	 * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
	 * @param {Function} callback The function to be invoked after intersection
	 *     changes have queued. The function is not invoked if the queue has
	 *     been emptied by calling the `takeRecords` method.
	 * @param {Object=} opt_options Optional configuration options.
	 * @constructor
	 */
	function IntersectionObserver(callback, opt_options) {

	  var options = opt_options || {};

	  if (typeof callback != 'function') {
		throw new Error('callback must be a function');
	  }

	  if (options.root && options.root.nodeType != 1) {
		throw new Error('root must be an Element');
	  }

	  // Binds and throttles `this._checkForIntersections`.
	  this._checkForIntersections = throttle(
		  this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

	  // Private properties.
	  this._callback = callback;
	  this._observationTargets = [];
	  this._queuedEntries = [];
	  this._rootMarginValues = this._parseRootMargin(options.rootMargin);

	  // Public properties.
	  this.thresholds = this._initThresholds(options.threshold);
	  this.root = options.root || null;
	  this.rootMargin = this._rootMarginValues.map(function(margin) {
		return margin.value + margin.unit;
	  }).join(' ');
	}


	/**
	 * The minimum interval within which the document will be checked for
	 * intersection changes.
	 */
	IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


	/**
	 * The frequency in which the polyfill polls for intersection changes.
	 * this can be updated on a per instance basis and must be set prior to
	 * calling `observe` on the first target.
	 */
	IntersectionObserver.prototype.POLL_INTERVAL = null;

	/**
	 * Use a mutation observer on the root element
	 * to detect intersection changes.
	 */
	IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


	/**
	 * Starts observing a target element for intersection changes based on
	 * the thresholds values.
	 * @param {Element} target The DOM element to observe.
	 */
	IntersectionObserver.prototype.observe = function(target) {
	  var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
		return item.element == target;
	  });

	  if (isTargetAlreadyObserved) {
		return;
	  }

	  if (!(target && target.nodeType == 1)) {
		throw new Error('target must be an Element');
	  }

	  this._registerInstance();
	  this._observationTargets.push({element: target, entry: null});
	  this._monitorIntersections();
	  this._checkForIntersections();
	};


	/**
	 * Stops observing a target element for intersection changes.
	 * @param {Element} target The DOM element to observe.
	 */
	IntersectionObserver.prototype.unobserve = function(target) {
	  this._observationTargets =
		  this._observationTargets.filter(function(item) {

		return item.element != target;
	  });
	  if (!this._observationTargets.length) {
		this._unmonitorIntersections();
		this._unregisterInstance();
	  }
	};


	/**
	 * Stops observing all target elements for intersection changes.
	 */
	IntersectionObserver.prototype.disconnect = function() {
	  this._observationTargets = [];
	  this._unmonitorIntersections();
	  this._unregisterInstance();
	};


	/**
	 * Returns any queue entries that have not yet been reported to the
	 * callback and clears the queue. This can be used in conjunction with the
	 * callback to obtain the absolute most up-to-date intersection information.
	 * @return {Array} The currently queued entries.
	 */
	IntersectionObserver.prototype.takeRecords = function() {
	  var records = this._queuedEntries.slice();
	  this._queuedEntries = [];
	  return records;
	};


	/**
	 * Accepts the threshold value from the user configuration object and
	 * returns a sorted array of unique threshold values. If a value is not
	 * between 0 and 1 and error is thrown.
	 * @private
	 * @param {Array|number=} opt_threshold An optional threshold value or
	 *     a list of threshold values, defaulting to [0].
	 * @return {Array} A sorted list of unique and valid threshold values.
	 */
	IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
	  var threshold = opt_threshold || [0];
	  if (!Array.isArray(threshold)) threshold = [threshold];

	  return threshold.sort().filter(function(t, i, a) {
		if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
		  throw new Error('threshold must be a number between 0 and 1 inclusively');
		}
		return t !== a[i - 1];
	  });
	};


	/**
	 * Accepts the rootMargin value from the user configuration object
	 * and returns an array of the four margin values as an object containing
	 * the value and unit properties. If any of the values are not properly
	 * formatted or use a unit other than px or %, and error is thrown.
	 * @private
	 * @param {string=} opt_rootMargin An optional rootMargin value,
	 *     defaulting to '0px'.
	 * @return {Array<Object>} An array of margin objects with the keys
	 *     value and unit.
	 */
	IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
	  var marginString = opt_rootMargin || '0px';
	  var margins = marginString.split(/\s+/).map(function(margin) {
		var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
		if (!parts) {
		  throw new Error('rootMargin must be specified in pixels or percent');
		}
		return {value: parseFloat(parts[1]), unit: parts[2]};
	  });

	  // Handles shorthand.
	  margins[1] = margins[1] || margins[0];
	  margins[2] = margins[2] || margins[0];
	  margins[3] = margins[3] || margins[1];

	  return margins;
	};


	/**
	 * Starts polling for intersection changes if the polling is not already
	 * happening, and if the page's visibilty state is visible.
	 * @private
	 */
	IntersectionObserver.prototype._monitorIntersections = function() {
	  if (!this._monitoringIntersections) {
		this._monitoringIntersections = true;

		// If a poll interval is set, use polling instead of listening to
		// resize and scroll events or DOM mutations.
		if (this.POLL_INTERVAL) {
		  this._monitoringInterval = setInterval(
			  this._checkForIntersections, this.POLL_INTERVAL);
		}
		else {
		  addEvent(window, 'resize', this._checkForIntersections, true);
		  addEvent(document, 'scroll', this._checkForIntersections, true);

		  if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in window) {
			this._domObserver = new MutationObserver(this._checkForIntersections);
			this._domObserver.observe(document, {
			  attributes: true,
			  childList: true,
			  characterData: true,
			  subtree: true
			});
		  }
		}
	  }
	};


	/**
	 * Stops polling for intersection changes.
	 * @private
	 */
	IntersectionObserver.prototype._unmonitorIntersections = function() {
	  if (this._monitoringIntersections) {
		this._monitoringIntersections = false;

		clearInterval(this._monitoringInterval);
		this._monitoringInterval = null;

		removeEvent(window, 'resize', this._checkForIntersections, true);
		removeEvent(document, 'scroll', this._checkForIntersections, true);

		if (this._domObserver) {
		  this._domObserver.disconnect();
		  this._domObserver = null;
		}
	  }
	};


	/**
	 * Scans each observation target for intersection changes and adds them
	 * to the internal entries queue. If new entries are found, it
	 * schedules the callback to be invoked.
	 * @private
	 */
	IntersectionObserver.prototype._checkForIntersections = function() {
	  var rootIsInDom = this._rootIsInDom();
	  var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

	  this._observationTargets.forEach(function(item) {
		var target = item.element;
		var targetRect = getBoundingClientRect(target);
		var rootContainsTarget = this._rootContainsTarget(target);
		var oldEntry = item.entry;
		var intersectionRect = rootIsInDom && rootContainsTarget &&
			this._computeTargetAndRootIntersection(target, rootRect);

		var newEntry = item.entry = new IntersectionObserverEntry({
		  time: now(),
		  target: target,
		  boundingClientRect: targetRect,
		  rootBounds: rootRect,
		  intersectionRect: intersectionRect
		});

		if (!oldEntry) {
		  this._queuedEntries.push(newEntry);
		} else if (rootIsInDom && rootContainsTarget) {
		  // If the new entry intersection ratio has crossed any of the
		  // thresholds, add a new entry.
		  if (this._hasCrossedThreshold(oldEntry, newEntry)) {
			this._queuedEntries.push(newEntry);
		  }
		} else {
		  // If the root is not in the DOM or target is not contained within
		  // root but the previous entry for this target had an intersection,
		  // add a new record indicating removal.
		  if (oldEntry && oldEntry.isIntersecting) {
			this._queuedEntries.push(newEntry);
		  }
		}
	  }, this);

	  if (this._queuedEntries.length) {
		this._callback(this.takeRecords(), this);
	  }
	};


	/**
	 * Accepts a target and root rect computes the intersection between then
	 * following the algorithm in the spec.
	 * TODO(philipwalton): at this time clip-path is not considered.
	 * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
	 * @param {Element} target The target DOM element
	 * @param {Object} rootRect The bounding rect of the root after being
	 *     expanded by the rootMargin value.
	 * @return {?Object} The final intersection rect object or undefined if no
	 *     intersection is found.
	 * @private
	 */
	IntersectionObserver.prototype._computeTargetAndRootIntersection =
		function(target, rootRect) {

	  // If the element isn't displayed, an intersection can't happen.
	  if (window.getComputedStyle(target).display == 'none') return;

	  var targetRect = getBoundingClientRect(target);
	  var intersectionRect = targetRect;
	  var parent = getParentNode(target);
	  var atRoot = false;

	  while (!atRoot) {
		var parentRect = null;
		var parentComputedStyle = parent.nodeType == 1 ?
			window.getComputedStyle(parent) : {};

		// If the parent isn't displayed, an intersection can't happen.
		if (parentComputedStyle.display == 'none') return;

		if (parent == this.root || parent == document) {
		  atRoot = true;
		  parentRect = rootRect;
		} else {
		  // If the element has a non-visible overflow, and it's not the <body>
		  // or <html> element, update the intersection rect.
		  // Note: <body> and <html> cannot be clipped to a rect that's not also
		  // the document rect, so no need to compute a new intersection.
		  if (parent != document.body &&
			  parent != document.documentElement &&
			  parentComputedStyle.overflow != 'visible') {
			parentRect = getBoundingClientRect(parent);
		  }
		}

		// If either of the above conditionals set a new parentRect,
		// calculate new intersection data.
		if (parentRect) {
		  intersectionRect = computeRectIntersection(parentRect, intersectionRect);

		  if (!intersectionRect) break;
		}
		parent = getParentNode(parent);
	  }
	  return intersectionRect;
	};


	/**
	 * Returns the root rect after being expanded by the rootMargin value.
	 * @return {Object} The expanded root rect.
	 * @private
	 */
	IntersectionObserver.prototype._getRootRect = function() {
	  var rootRect;
	  if (this.root) {
		rootRect = getBoundingClientRect(this.root);
	  } else {
		// Use <html>/<body> instead of window since scroll bars affect size.
		var html = document.documentElement;
		var body = document.body;
		rootRect = {
		  top: 0,
		  left: 0,
		  right: html.clientWidth || body.clientWidth,
		  width: html.clientWidth || body.clientWidth,
		  bottom: html.clientHeight || body.clientHeight,
		  height: html.clientHeight || body.clientHeight
		};
	  }
	  return this._expandRectByRootMargin(rootRect);
	};


	/**
	 * Accepts a rect and expands it by the rootMargin value.
	 * @param {Object} rect The rect object to expand.
	 * @return {Object} The expanded rect.
	 * @private
	 */
	IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
	  var margins = this._rootMarginValues.map(function(margin, i) {
		return margin.unit == 'px' ? margin.value :
			margin.value * (i % 2 ? rect.width : rect.height) / 100;
	  });
	  var newRect = {
		top: rect.top - margins[0],
		right: rect.right + margins[1],
		bottom: rect.bottom + margins[2],
		left: rect.left - margins[3]
	  };
	  newRect.width = newRect.right - newRect.left;
	  newRect.height = newRect.bottom - newRect.top;

	  return newRect;
	};


	/**
	 * Accepts an old and new entry and returns true if at least one of the
	 * threshold values has been crossed.
	 * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
	 *    particular target element or null if no previous entry exists.
	 * @param {IntersectionObserverEntry} newEntry The current entry for a
	 *    particular target element.
	 * @return {boolean} Returns true if a any threshold has been crossed.
	 * @private
	 */
	IntersectionObserver.prototype._hasCrossedThreshold =
		function(oldEntry, newEntry) {

	  // To make comparing easier, an entry that has a ratio of 0
	  // but does not actually intersect is given a value of -1
	  var oldRatio = oldEntry && oldEntry.isIntersecting ?
		  oldEntry.intersectionRatio || 0 : -1;
	  var newRatio = newEntry.isIntersecting ?
		  newEntry.intersectionRatio || 0 : -1;

	  // Ignore unchanged ratios
	  if (oldRatio === newRatio) return;

	  for (var i = 0; i < this.thresholds.length; i++) {
		var threshold = this.thresholds[i];

		// Return true if an entry matches a threshold or if the new ratio
		// and the old ratio are on the opposite sides of a threshold.
		if (threshold == oldRatio || threshold == newRatio ||
			threshold < oldRatio !== threshold < newRatio) {
		  return true;
		}
	  }
	};


	/**
	 * Returns whether or not the root element is an element and is in the DOM.
	 * @return {boolean} True if the root element is an element and is in the DOM.
	 * @private
	 */
	IntersectionObserver.prototype._rootIsInDom = function() {
	  return !this.root || containsDeep(document, this.root);
	};


	/**
	 * Returns whether or not the target element is a child of root.
	 * @param {Element} target The target element to check.
	 * @return {boolean} True if the target element is a child of root.
	 * @private
	 */
	IntersectionObserver.prototype._rootContainsTarget = function(target) {
	  return containsDeep(this.root || document, target);
	};


	/**
	 * Adds the instance to the global IntersectionObserver registry if it isn't
	 * already present.
	 * @private
	 */
	IntersectionObserver.prototype._registerInstance = function() {
	  if (registry.indexOf(this) < 0) {
		registry.push(this);
	  }
	};


	/**
	 * Removes the instance from the global IntersectionObserver registry.
	 * @private
	 */
	IntersectionObserver.prototype._unregisterInstance = function() {
	  var index = registry.indexOf(this);
	  if (index != -1) registry.splice(index, 1);
	};


	/**
	 * Returns the result of the performance.now() method or null in browsers
	 * that don't support the API.
	 * @return {number} The elapsed time since the page was requested.
	 */
	function now() {
	  return window.performance && performance.now && performance.now();
	}


	/**
	 * Throttles a function and delays its executiong, so it's only called at most
	 * once within a given time period.
	 * @param {Function} fn The function to throttle.
	 * @param {number} timeout The amount of time that must pass before the
	 *     function can be called again.
	 * @return {Function} The throttled function.
	 */
	function throttle(fn, timeout) {
	  var timer = null;
	  return function () {
		if (!timer) {
		  timer = setTimeout(function() {
			fn();
			timer = null;
		  }, timeout);
		}
	  };
	}


	/**
	 * Adds an event handler to a DOM node ensuring cross-browser compatibility.
	 * @param {Node} node The DOM node to add the event handler to.
	 * @param {string} event The event name.
	 * @param {Function} fn The event handler to add.
	 * @param {boolean} opt_useCapture Optionally adds the even to the capture
	 *     phase. Note: this only works in modern browsers.
	 */
	function addEvent(node, event, fn, opt_useCapture) {
	  if (typeof node.addEventListener == 'function') {
		node.addEventListener(event, fn, opt_useCapture || false);
	  }
	  else if (typeof node.attachEvent == 'function') {
		node.attachEvent('on' + event, fn);
	  }
	}


	/**
	 * Removes a previously added event handler from a DOM node.
	 * @param {Node} node The DOM node to remove the event handler from.
	 * @param {string} event The event name.
	 * @param {Function} fn The event handler to remove.
	 * @param {boolean} opt_useCapture If the event handler was added with this
	 *     flag set to true, it should be set to true here in order to remove it.
	 */
	function removeEvent(node, event, fn, opt_useCapture) {
	  if (typeof node.removeEventListener == 'function') {
		node.removeEventListener(event, fn, opt_useCapture || false);
	  }
	  else if (typeof node.detatchEvent == 'function') {
		node.detatchEvent('on' + event, fn);
	  }
	}


	/**
	 * Returns the intersection between two rect objects.
	 * @param {Object} rect1 The first rect.
	 * @param {Object} rect2 The second rect.
	 * @return {?Object} The intersection rect or undefined if no intersection
	 *     is found.
	 */
	function computeRectIntersection(rect1, rect2) {
	  var top = Math.max(rect1.top, rect2.top);
	  var bottom = Math.min(rect1.bottom, rect2.bottom);
	  var left = Math.max(rect1.left, rect2.left);
	  var right = Math.min(rect1.right, rect2.right);
	  var width = right - left;
	  var height = bottom - top;

	  return (width >= 0 && height >= 0) && {
		top: top,
		bottom: bottom,
		left: left,
		right: right,
		width: width,
		height: height
	  };
	}


	/**
	 * Shims the native getBoundingClientRect for compatibility with older IE.
	 * @param {Element} el The element whose bounding rect to get.
	 * @return {Object} The (possibly shimmed) rect of the element.
	 */
	function getBoundingClientRect(el) {
	  var rect;

	  try {
		rect = el.getBoundingClientRect();
	  } catch (err) {
		// Ignore Windows 7 IE11 "Unspecified error"
		// https://github.com/w3c/IntersectionObserver/pull/205
	  }

	  if (!rect) return getEmptyRect();

	  // Older IE
	  if (!(rect.width && rect.height)) {
		rect = {
		  top: rect.top,
		  right: rect.right,
		  bottom: rect.bottom,
		  left: rect.left,
		  width: rect.right - rect.left,
		  height: rect.bottom - rect.top
		};
	  }
	  return rect;
	}


	/**
	 * Returns an empty rect object. An empty rect is returned when an element
	 * is not in the DOM.
	 * @return {Object} The empty rect.
	 */
	function getEmptyRect() {
	  return {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		width: 0,
		height: 0
	  };
	}

	/**
	 * Checks to see if a parent element contains a child elemnt (including inside
	 * shadow DOM).
	 * @param {Node} parent The parent element.
	 * @param {Node} child The child element.
	 * @return {boolean} True if the parent node contains the child node.
	 */
	function containsDeep(parent, child) {
	  var node = child;
	  while (node) {
		if (node == parent) return true;

		node = getParentNode(node);
	  }
	  return false;
	}


	/**
	 * Gets the parent node of an element or its host element if the parent node
	 * is a shadow root.
	 * @param {Node} node The node whose parent to get.
	 * @return {Node|null} The parent node or null if no parent exists.
	 */
	function getParentNode(node) {
	  var parent = node.parentNode;

	  if (parent && parent.nodeType == 11 && parent.host) {
		// If the parent is a shadow root, return the host element.
		return parent.host;
	  }
	  return parent;
	}


	// Exposes the constructors globally.
	window.IntersectionObserver = IntersectionObserver;
	window.IntersectionObserverEntry = IntersectionObserverEntry;

	}(window, document));

/* eslint-disable */