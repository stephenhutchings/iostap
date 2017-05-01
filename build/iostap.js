/* iostap - v1.2.2 - MIT */
/* A micro-library for iOS-like tap events in the browser */
/* https://github.com/stephenhutchings/iostap.git */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.iostap = factory();
  }
})(this, function() {
  var options;
  options = {
    eventName: "iostap",
    activeClass: "__active",
    minActiveMS: 50,
    buffer: 20,
    maxDistance: Math.pow(window.innerHeight * window.innerWidth, 0.35),
    allowDefault: function(e) {
      return e.target.nodeName.match(/^(INPUT|TEXTAREA|SELECT)$/);
    }
  };
  return {
    set: function(overrides) {
      var key, val, _results;
      if (overrides == null) {
        overrides = {};
      }
      _results = [];
      for (key in overrides) {
        val = overrides[key];
        if (val != null) {
          _results.push(options[key] = val);
        }
      }
      return _results;
    },
    initialize: function(overrides) {
      var bindEvent, isPointer, isTouch, nearEnough, onCancel, onEnd, onMove, onStart, parentIfData, parentIfText, parentScrolls, timeout, toggleActiveState, touch, unbindEvent, _end, _move, _ref, _ref1, _start;
      touch = null;
      timeout = null;
      nearEnough = false;
      isPointer = "onpointerdown" in window;
      isTouch = "ontouchstart" in window;
      _ref = isPointer ? ["pointerdown", "pointermove", "pointerup"] : isTouch ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"], _start = _ref[0], _move = _ref[1], _end = _ref[2];
      this.set(overrides);
      parentIfText = function(node) {
        if ("tagName" in node) {
          return node;
        } else {
          return node.parentNode;
        }
      };
      parentIfData = function(el) {
        var node, _ref1, _ref2;
        node = el;
        while (node.parentNode && !((_ref1 = node.dataset) != null ? _ref1.touch : void 0)) {
          node = node.parentNode;
        }
        if (node != null ? (_ref2 = node.dataset) != null ? _ref2.touch : void 0 : void 0) {
          return node;
        } else {
          return el;
        }
      };
      parentScrolls = function(node) {
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
      toggleActiveState = function(isActive) {
        var el, _i, _len, _ref1, _results, _results1;
        if (isActive) {
          el = touch.el;
          _results = [];
          while (el.parentNode) {
            el.classList.add(options.activeClass);
            if (el.dataset.nobubble) {
              break;
            }
            _results.push(el = el.parentNode);
          }
          return _results;
        } else {
          _ref1 = document.querySelectorAll("." + options.activeClass);
          _results1 = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            el = _ref1[_i];
            _results1.push(el.classList.remove(options.activeClass));
          }
          return _results1;
        }
      };
      onStart = function(e) {
        var el;
        if (touch || (e.target === document.activeElement && e.target.nodeName.match(/^(INPUT|TEXTAREA)$/))) {
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
        var clientX, clientY, height, left, top, width, _base, _base1, _e, _ref1, _ref2, _ref3, _ref4;
        if (!touch) {
          return;
        }
        _e = ((_ref1 = e.touches) != null ? _ref1[0] : void 0) || e;
        clientX = _e.clientX, clientY = _e.clientY;
        _ref2 = touch.offset, width = _ref2.width, top = _ref2.top, left = _ref2.left, height = _ref2.height;
        if ((_base = touch.offset).startX == null) {
          _base.startX = clientX;
        }
        if ((_base1 = touch.offset).startY == null) {
          _base1.startY = clientY;
        }
        if (touch.parentScrollY == null) {
          touch.parentScrollY = (_ref3 = touch.scrollParent) != null ? _ref3.scrollTop : void 0;
        }
        if (touch.parentScrollY !== ((_ref4 = touch.scrollParent) != null ? _ref4.scrollTop : void 0)) {
          return onCancel();
        }
        nearEnough = clientX > left - options.buffer && clientX < left + width + options.buffer && clientY > top - options.buffer && clientY < top + height + options.buffer && Math.abs(clientX - touch.offset.startX) < options.maxDistance && Math.abs(clientY - touch.offset.startY) < options.maxDistance;
        return toggleActiveState(nearEnough);
      };
      onEnd = function(e) {
        var clientX, clientY, el, pageX, pageY, scrollParent, startX, startY, tapEvent, _e, _ref1;
        if (!touch) {
          return;
        }
        unbindEvent(_move, onMove, false);
        unbindEvent(_end, onEnd, false);
        if (nearEnough) {
          if (!options.allowDefault(e)) {
            e.preventDefault();
            e.stopPropagation();
          }
          _e = isTouch && !isPointer ? e.changedTouches[0] : e;
          el = touch.el, scrollParent = touch.scrollParent;
          pageX = _e.pageX, pageY = _e.pageY, clientX = _e.clientX, clientY = _e.clientY;
          _ref1 = touch.offset, startX = _ref1.startX, startY = _ref1.startY;
          tapEvent = document.createEvent("Event");
          tapEvent.initEvent(options.eventName, true, true);
          tapEvent.detail = {
            pageX: pageX,
            pageY: pageY,
            clientX: clientX,
            clientY: clientY,
            startX: startX,
            startY: startY
          };
          if (scrollParent) {
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
          }), options.minActiveMS);
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
      if ((_ref1 = window.Backbone) != null) {
        _ref1.on("canceltap", onCancel);
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
