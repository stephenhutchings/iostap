// zepto.iostap - v0.0.3 - MIT
// A micro-library for iOS-like tap events in the browser
// https://github.com/stephenhutchings/zepto.iostap
(function(window, document) {
  var activeClass, checkForScroll, eventName, getFirstTouch, isTouch, minimumActiveTime, nearBuffer, nearEnough, onCancel, onEnd, onMove, onStart, parentIfText, scrollBuffer, toggleActiveState, touch, _cancel, _end, _move, _start;
  touch = {};
  isTouch = "ontouchstart" in window;
  _start = isTouch ? "touchstart" : "mousedown";
  _move = isTouch ? "touchmove" : "mousemove";
  _end = isTouch ? "touchend" : "mouseup";
  _cancel = isTouch ? "touchcancel" : void 0;
  nearBuffer = Math.pow(window.innerHeight * window.innerWidth, 0.35);
  scrollBuffer = nearBuffer / 5;
  activeClass = "__active";
  eventName = "iostap";
  minimumActiveTime = 100;
  nearEnough = false;
  parentIfText = function(node) {
    if ("tagName" in node) {
      return node;
    } else {
      return node.parentNode;
    }
  };
  getFirstTouch = function(e) {
    if (isTouch) {
      return e.touches[0];
    } else {
      return e;
    }
  };
  checkForScroll = function() {
    var el, i, _i, _len, _ref, _results;
    if (!touch.scrollParents) {
      return;
    }
    _ref = touch.scrollParents;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      el = _ref[i];
      if (Math.abs(touch.scrollOffsets[i] - el.scrollTop) > scrollBuffer) {
        _results.push(nearEnough = false);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  toggleActiveState = function(isEnd) {
    if (!touch.el || typeof (touch.el.get(0).className) !== "string") {
      return;
    }
    nearEnough = Math.abs(touch.x1 - touch.x2) < nearBuffer && Math.abs(touch.y1 - touch.y2) < nearBuffer && !isEnd;
    checkForScroll();
    touch.el.toggleClass(activeClass, nearEnough);
    return touch.el.parents().toggleClass(activeClass, nearEnough);
  };
  onStart = function(e) {
    var _e;
    _e = getFirstTouch(e);
    touch = {
      el: $(parentIfText(_e.target)),
      x1: _e.clientX,
      y1: _e.clientY,
      scrollParents: [],
      scrollOffsets: []
    };
    touch.el.parents().each(function(el) {
      if ((typeof window.getComputedStyle === "function" ? window.getComputedStyle(this).overflow : void 0) === "scroll") {
        touch.scrollParents.push(this);
        return touch.scrollOffsets.push(this.scrollTop);
      }
    });
    toggleActiveState(false);
    return onMove(e);
  };
  onMove = function(e) {
    var _e;
    _e = getFirstTouch(e);
    touch.x2 = _e.clientX;
    touch.y2 = _e.clientY;
    return toggleActiveState(false);
  };
  onEnd = function() {
    checkForScroll();
    if (nearEnough) {
      touch.el.trigger(eventName);
    }
    return window.setTimeout((function() {
      toggleActiveState(true);
      touch = {};
    }), minimumActiveTime);
  };
  onCancel = function() {
    toggleActiveState(true);
    touch = {};
  };
  if (window.getComputedStyle) {
    $(document).ready(function() {
      $(document.body).on(_start, onStart).on(_move, onMove).on(_end, onEnd);
      if (_cancel != null) {
        return $(document.body).on(_cancel, onCancel);
      }
    });
  } else {
    $(document).ready(function() {
      return $("body").on("click", function(e) {
        return $(e.target).trigger("iostap");
      });
    });
  }
  $.fn[eventName] = function(callback) {
    return this.on(m, callback);
  };
})(window, document);
