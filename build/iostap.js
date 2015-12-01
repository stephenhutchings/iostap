/* iostap - v1.0.0 - MIT */
/* A micro-library for iOS-like tap events in the browser */
/* https://github.com/stephenhutchings/iostap.git */
var defaults;

defaults = {
  eventName: "iostap",
  activeClass: "__active",
  minActiveMS: 50,
  buffer: 20,
  maxDistance: Math.pow(window.innerHeight * window.innerWidth, 0.35)
};

(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.iostap = factory();
  }
})(this, function() {
  return {
    initialize: function(options) {
      var activeClass, bindEvent, buffer, eventName, isTouch, maxDistance, minActiveMS, nearEnough, onCancel, onEnd, onMove, onStart, parentIfData, parentIfText, parentScrolls, timeout, toggleActiveState, touch, unbindEvent, _end, _move, _start;
      if (options == null) {
        options = {};
      }
      touch = null;
      timeout = null;
      nearEnough = false;
      isTouch = "ontouchstart" in window;
      _start = isTouch ? "touchstart" : "mousedown";
      _move = isTouch ? "touchmove" : "mousemove";
      _end = isTouch ? "touchend" : "mouseup";
      eventName = options.eventName || defaults.eventName;
      activeClass = options.activeClass || defaults.activeClass;
      minActiveMS = options.minActiveMS || defaults.minActiveMS;
      buffer = options.buffer || defaults.buffer;
      maxDistance = options.maxDistance || defaults.maxDistance;
      parentIfText = function(node) {
        if ("tagName" in node) {
          return node;
        } else {
          return node.parentNode;
        }
      };
      parentIfData = function(el) {
        var node, _ref, _ref1;
        node = el;
        while (node.parentNode && !((_ref = node.dataset) != null ? _ref.touch : void 0)) {
          node = node.parentNode;
        }
        if (node != null ? (_ref1 = node.dataset) != null ? _ref1.touch : void 0 : void 0) {
          return node;
        } else {
          return el;
        }
      };
      parentScrolls = function(node) {
        var scrolls;
        scrolls = false;
        while (node.parentNode && isTouch) {
          if (scrolls = scrolls || node.scrollHeight > node.offsetHeight) {
            break;
          } else {
            node = node.parentNode;
          }
        }
        return scrolls && node;
      };
      toggleActiveState = function(isActive) {
        var el, _i, _len, _ref, _results, _results1;
        if (isActive) {
          el = touch.el;
          _results = [];
          while (el.parentNode) {
            el.classList.add(activeClass);
            if (el.dataset.nobubble) {
              break;
            }
            _results.push(el = el.parentNode);
          }
          return _results;
        } else {
          _ref = document.querySelectorAll("." + activeClass);
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            _results1.push(el.classList.remove(activeClass));
          }
          return _results1;
        }
      };
      onStart = function(e) {
        var el;
        if (touch) {
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
        return bindEvent(_end, onEnd, false);
      };
      onMove = function(e) {
        var clientX, clientY, height, left, top, width, _base, _base1, _e, _ref, _ref1, _ref2;
        if (!touch) {
          return;
        }
        _e = isTouch ? e.touches[0] : e;
        clientX = _e.clientX, clientY = _e.clientY;
        _ref = touch.offset, width = _ref.width, top = _ref.top, left = _ref.left, height = _ref.height;
        if ((_base = touch.offset).startX == null) {
          _base.startX = clientX;
        }
        if ((_base1 = touch.offset).startY == null) {
          _base1.startY = clientY;
        }
        if (touch.parentScrollY == null) {
          touch.parentScrollY = (_ref1 = touch.scrollParent) != null ? _ref1.scrollTop : void 0;
        }
        if (touch.parentScrollY !== ((_ref2 = touch.scrollParent) != null ? _ref2.scrollTop : void 0)) {
          return onCancel();
        }
        nearEnough = clientX > left - buffer && clientX < left + width + buffer && clientY > top - buffer && clientY < top + height + buffer && Math.abs(clientX - touch.offset.startX) < maxDistance && Math.abs(clientY - touch.offset.startY) < maxDistance;
        return toggleActiveState(nearEnough);
      };
      onEnd = function(e) {
        var el, scrollParent, tapEvent, _e;
        if (!touch) {
          return;
        }
        unbindEvent(_move, onMove, false);
        unbindEvent(_end, onEnd, false);
        if (nearEnough) {
          e.preventDefault();
          e.stopPropagation();
          el = touch.el, scrollParent = touch.scrollParent;
          tapEvent = document.createEvent("Event");
          tapEvent.initEvent(eventName, true, true);
          if (scrollParent) {
            _e = e.changedTouches[0];
            el = document.elementFromPoint(_e.pageX, _e.pageY) || el;
          } else {
            el.dispatchEvent(tapEvent);
          }
          window.clearTimeout(timeout);
          timeout = window.setTimeout((function() {
            toggleActiveState(false);
            if (scrollParent) {
              return el.dispatchEvent(tapEvent);
            }
          }), minActiveMS);
        }
        return touch = null;
      };
      onCancel = function() {
        if (!touch) {
          return;
        }
        unbindEvent(_move, onMove, false);
        unbindEvent(_end, onEnd, false);
        touch = null;
        return toggleActiveState(false);
      };
      bindEvent = function(evt, fn, capture) {
        if (capture == null) {
          capture = false;
        }
        return window.addEventListener(evt, fn, capture);
      };
      unbindEvent = function(evt, fn, capture) {
        if (capture == null) {
          capture = false;
        }
        return window.removeEventListener(evt, fn, capture);
      };
      if (typeof Backbone !== "undefined" && Backbone !== null) {
        Backbone.on("canceltap", onCancel);
      }
      bindEvent(_start, onStart, false);
      if (isTouch) {
        return bindEvent("touchcancel", onCancel, false);
      }
    }
  };
});
