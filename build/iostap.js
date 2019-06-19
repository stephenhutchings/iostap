/* iostap - v1.3.1 - MIT */
/* A micro-library for iOS-like tap events in the browser */
/* https://github.com/stephenhutchings/iostap.git */
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Creates a new event ("iostap"), which creates pseudo active
// states ("__active") for all elements that are touched.
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
    module.exports = factory();
  } else {
    root.iostap = factory();
  }
})(this, function () {
  var options;
  options = {
    // Name of the event to be fired
    eventName: "iostap",
    // Class applied to every element in the tree on touch
    activeClass: "__active",
    // Mininum time for the element to be active, after the touch ends
    minActiveMS: 50,
    // Buffer area around the element that is still considered active
    buffer: 20,
    // Maximum distance travelled before the touch becomes inactive
    maxDistance: Math.pow(window.innerHeight * window.innerWidth, 0.35),
    // Allow default behaviour and event propagation for events of this type
    allowDefault: function allowDefault(e) {
      return e.target.nodeName.match(/^(INPUT|TEXTAREA|SELECT)$/);
    }
  };
  return {
    set: function set() {
      var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var key, results, val;
      results = [];
      for (key in overrides) {
        val = overrides[key];
        if (val != null) {
          results.push(options[key] = val);
        }
      }
      return results;
    },
    initialize: function initialize(overrides) {
      var _end, _move, _start, bindEvent, isPointer, isTouch, nearEnough, onCancel, _onEnd, onMove, onStart, parentIfData, parentIfText, parentScrolls, ref, timeout, toggleActiveState, touch, unbindEvent;
      // The touch object will store the current touch information
      touch = null;
      // Reference to the timeouts we will use
      timeout = null;
      // Reference to whether the touch is close enough to the target element
      nearEnough = false;
      // Multi-device events
      isPointer = "onpointerdown" in window;
      isTouch = "ontouchstart" in window;

      var _ref = isPointer ? ["pointerdown", "pointermove", "pointerup"] : isTouch ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];

      var _ref2 = _slicedToArray(_ref, 3);

      _start = _ref2[0];
      _move = _ref2[1];
      _end = _ref2[2];

      this.set(overrides);
      parentIfText = function parentIfText(node) {
        if ("tagName" in node) {
          return node;
        } else {
          return node.parentNode;
        }
      };
      parentIfData = function parentIfData(el) {
        var node, ref, ref1;
        node = el;
        while (node.parentNode && !((ref = node.dataset) != null ? ref.touch : void 0)) {
          node = node.parentNode;
        }
        if (node != null ? (ref1 = node.dataset) != null ? ref1.touch : void 0 : void 0) {
          return node;
        } else {
          return el;
        }
      };
      parentScrolls = function parentScrolls(node) {
        var scrolls;
        scrolls = false;
        while (node.parentNode && isTouch && !isPointer) {
          if (scrolls = /^(auto|scroll)$/.test(typeof getComputedStyle === "function" ? getComputedStyle(node).overflow : void 0)) {
            break;
          } else {
            node = node.parentNode;
          }
        }
        return scrolls && node;
      };
      toggleActiveState = function toggleActiveState(isActive) {
        var el, i, len, ref, results, results1;
        if (isActive) {
          el = touch.el;
          results = [];
          while (el.parentNode) {
            el.classList.add(options.activeClass);
            if (el.dataset.nobubble) {
              break;
            }
            results.push(el = el.parentNode);
          }
          return results;
        } else {
          ref = document.querySelectorAll("." + options.activeClass);
          results1 = [];
          for (i = 0, len = ref.length; i < len; i++) {
            el = ref[i];
            results1.push(el.classList.remove(options.activeClass));
          }
          return results1;
        }
      };
      onStart = function onStart(e) {
        var el;
        if (touch || e.target === document.activeElement && e.target.nodeName.match(/^(INPUT|TEXTAREA)$/)) {
          return;
        }
        window.clearTimeout(timeout);
        el = parentIfText(e.target);
        el = parentIfData(el);
        touch = {
          el: el,
          offset: el.getBoundingClientRect(),
          scrollParent: parentScrolls(el)
        };
        onMove(e);
        bindEvent(_move, onMove, false);
        return bindEvent(_end, _onEnd, false);
      };
      onMove = function onMove(e) {
        var _e, base, base1, clientX, clientY, height, left, ref, ref1, ref2, top, width;
        if (!touch) {
          return;
        }
        _e = ((ref = e.touches) != null ? ref[0] : void 0) || e;
        var _e2 = _e;
        clientX = _e2.clientX;
        clientY = _e2.clientY;
        var _touch$offset = touch.offset;
        width = _touch$offset.width;
        top = _touch$offset.top;
        left = _touch$offset.left;
        height = _touch$offset.height;

        if ((base = touch.offset).startX == null) {
          base.startX = clientX;
        }
        if ((base1 = touch.offset).startY == null) {
          base1.startY = clientY;
        }
        if (touch.parentScrollY == null) {
          touch.parentScrollY = (ref1 = touch.scrollParent) != null ? ref1.scrollTop : void 0;
        }
        if (touch.parentScrollY !== ((ref2 = touch.scrollParent) != null ? ref2.scrollTop : void 0)) {
          return onCancel();
        }
        nearEnough = clientX > left - options.buffer && clientX < left + width + options.buffer && clientY > top - options.buffer && clientY < top + height + options.buffer && Math.abs(clientX - touch.offset.startX) < options.maxDistance && Math.abs(clientY - touch.offset.startY) < options.maxDistance;
        return toggleActiveState(nearEnough);
      };
      _onEnd = function onEnd(e) {
        var _e, clientX, clientY, el, pageX, pageY, scrollParent, startX, startY, tapEvent;
        if (!touch) {
          return;
        }
        unbindEvent(_move, onMove, false);
        unbindEvent(_end, _onEnd, false);
        if (nearEnough) {
          if (!options.allowDefault(e)) {
            e.preventDefault();
            e.stopPropagation();
          }
          _e = isTouch && !isPointer ? e.changedTouches[0] : e;
          var _touch = touch;
          el = _touch.el;
          scrollParent = _touch.scrollParent;
          var _e3 = _e;
          pageX = _e3.pageX;
          pageY = _e3.pageY;
          clientX = _e3.clientX;
          clientY = _e3.clientY;
          var _touch$offset2 = touch.offset;
          startX = _touch$offset2.startX;
          startY = _touch$offset2.startY;

          tapEvent = document.createEvent("Event");
          tapEvent.initEvent(options.eventName, true, true);
          tapEvent.detail = { pageX: pageX, pageY: pageY, clientX: clientX, clientY: clientY, startX: startX, startY: startY };
          if (scrollParent) {
            el = document.elementFromPoint(_e.pageX, _e.pageY) || el;
          } else {
            el.dispatchEvent(tapEvent);
          }
          window.clearTimeout(timeout);
          timeout = window.setTimeout(function () {
            toggleActiveState(false);
            if (scrollParent) {
              return el.dispatchEvent(tapEvent);
            }
          }, options.minActiveMS);
        }
        return touch = null;
      };
      onCancel = function onCancel() {
        if (!touch) {
          return;
        }
        unbindEvent(_move, onMove, false);
        unbindEvent(_end, _onEnd, false);
        touch = null;
        return toggleActiveState(false);
      };
      bindEvent = function bindEvent(evt, fn) {
        var capture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        return window.addEventListener(evt, fn, capture);
      };
      unbindEvent = function unbindEvent(evt, fn) {
        var capture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        return window.removeEventListener(evt, fn, capture);
      };
      if ((ref = window.Backbone) != null) {
        ref.on("canceltap", onCancel);
      }
      bindEvent(_start, onStart, false);
      if (isTouch) {
        bindEvent("touchcancel", onCancel, false);
      }
      if (isPointer) {
        return bindEvent("pointercancel", onCancel, false);
      }
    }
  };
});