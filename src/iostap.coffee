# Creates a new event ("iostap"), which creates pseudo active
# states ("__active") for all elements that are touched.

((root, factory) ->
  if typeof define is "function" and define.amd
    define [], factory
  else if typeof exports is "object"
    module.exports = factory()
  else
    root.iostap = factory()
  return
) this, ->

  options =
    # Name of the event to be fired
    eventName: "iostap"

    # Class applied to every element in the tree on touch
    activeClass: "__active"

    # Mininum time for the element to be active, after the touch ends
    minActiveMS: 50

    # options.Buffer area around the element that is still considered active
    buffer: 20

    # Maximum distance travelled before the touch becomes inactive
    maxDistance: Math.pow(window.innerHeight * window.innerWidth, 0.35)

    # Allow default behaviour and event propagation for events of this type
    allowDefault: (e) ->
      e.target.nodeName.match(/^(INPUT|TEXTAREA|SELECT)$/)

  set: (overrides = {}) ->
    for key, val of overrides when val?
      options[key] = val

  initialize: (overrides) ->
    # The touch object will store the current touch information
    touch = null

    # Reference to the timeouts we will use
    timeout = null

    # Reference to whether the touch is close enough to the target element
    nearEnough =  false

    # Multi-device events
    isPointer = "onpointerdown" of window
    isTouch   = "ontouchstart" of window

    [_start, _move, _end] =
      if isPointer
        ["pointerdown", "pointermove", "pointerup"]
      else if isTouch
        ["touchstart", "touchmove", "touchend"]
      else
        ["mousedown", "mousemove", "mouseup"]

    @set(overrides)

    parentIfText = (node) ->
      if "tagName" of node then node else node.parentNode

    parentIfData = (el) ->
      node = el

      while node.parentNode and not node.dataset?.touch
        node = node.parentNode

      if node?.dataset?.touch then node else el

    parentScrolls = (node) ->
      scrolls = false

      while node.parentNode and isTouch and not isPointer
        if scrolls = /^(auto|scroll)$/.test getComputedStyle?(node).overflow
          break
        else
          node = node.parentNode

      return scrolls and node

    toggleActiveState = (isActive) ->
      if isActive
        el = touch.el
        while el.parentNode
          el.classList.add options.activeClass
          break if el.dataset.nobubble
          el = el.parentNode
      else
        for el in document.querySelectorAll("." + options.activeClass)
          el.classList.remove options.activeClass

    onStart = (e) ->
      if touch or
         (e.target is document.activeElement and
         e.target.nodeName.match(/^(INPUT|TEXTAREA)$/))
        return

      window.clearTimeout timeout

      el = parentIfText(e.target)
      el = parentIfData(el)

      touch =
        el: el
        offset: el.getBoundingClientRect()
        scrollParent: parentScrolls(el)

      onMove(e)

      bindEvent(_move, onMove, false)
      bindEvent(_end, onEnd, false)

    onMove = (e) ->
      return unless touch

      _e = e.touches?[0] or e

      {clientX, clientY} = _e
      {width, top, left, height} = touch.offset

      touch.offset.startX ?= clientX
      touch.offset.startY ?= clientY
      touch.parentScrollY ?= touch.scrollParent?.scrollTop

      if touch.parentScrollY isnt touch.scrollParent?.scrollTop
        return onCancel()

      nearEnough = clientX > left - options.buffer and
                   clientX < left + width + options.buffer and
                   clientY > top - options.buffer and
                   clientY < top + height + options.buffer and
                   Math.abs(clientX - touch.offset.startX) < options.maxDistance and
                   Math.abs(clientY - touch.offset.startY) < options.maxDistance

      toggleActiveState(nearEnough)

    onEnd = (e) ->
      return unless touch

      unbindEvent(_move, onMove, false)
      unbindEvent(_end, onEnd, false)

      if nearEnough
        unless options.allowDefault(e)
          e.preventDefault()
          e.stopPropagation()

        {el, scrollParent} = touch

        tapEvent = document.createEvent "Event"
        tapEvent.initEvent options.eventName, true, true

        if scrollParent
          _e = e.changedTouches[0]
          el = document.elementFromPoint(_e.pageX, _e.pageY) or el
        else
          el.dispatchEvent(tapEvent)

        window.clearTimeout timeout
        timeout = window.setTimeout (->
          toggleActiveState(false)
          el.dispatchEvent(tapEvent) if scrollParent
        ), options.minActiveMS

      touch = null

    onCancel = ->
      return unless touch

      unbindEvent(_move, onMove, false)
      unbindEvent(_end, onEnd, false)

      touch = null
      toggleActiveState(false)

    bindEvent = (evt, fn, capture = false) ->
      window.addEventListener(evt, fn, capture)

    unbindEvent = (evt, fn, capture = false) ->
      window.removeEventListener(evt, fn, capture)

    window.Backbone?.on("canceltap", onCancel)

    bindEvent(_start, onStart, false)
    bindEvent("touchcancel", onCancel, false) if isTouch
    bindEvent("pointercancel", onCancel, false) if isPointer
