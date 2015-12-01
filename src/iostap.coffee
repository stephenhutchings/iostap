# Creates a new event ("iostap"), which creates pseudo active
# states ("__active") for all elements that are touched.

defaults =
  # Name of the event to be fired
  eventName: "iostap"

  # Class applied to every element in the tree on touch
  activeClass: "__active"

  # Mininum time for the element to be active, after the touch ends
  minActiveMS: 50

  # Buffer area around the element that is still considered active
  buffer: 20

  # Maximum distance travelled before the touch becomes inactive
  maxDistance: Math.pow(window.innerHeight * window.innerWidth, 0.35)

((root, factory) ->
  if typeof define is "function" and define.amd
    define [], factory
  else if typeof exports is "object"
    module.exports = factory()
  else
    root.iostap = factory()
  return
) this, ->
  initialize: (options = {}) ->

    # The touch object will store the current touch information
    touch = null

    # Reference to the timeouts we will use
    timeout = null

    # Reference to whether the touch is close enough to the target element
    nearEnough =  false

    # Multi-device events
    isTouch = "ontouchstart" of window
    _start  = if isTouch then "touchstart" else "mousedown"
    _move   = if isTouch then "touchmove" else "mousemove"
    _end    = if isTouch then "touchend" else "mouseup"

    eventName   = options.eventName   or defaults.eventName
    activeClass = options.activeClass or defaults.activeClass
    minActiveMS = options.minActiveMS or defaults.minActiveMS
    buffer      = options.buffer      or defaults.buffer
    maxDistance = options.maxDistance or defaults.maxDistance

    parentIfText = (node) ->
      if "tagName" of node then node else node.parentNode

    parentIfData = (el) ->
      node = el

      while node.parentNode and not node.dataset?.touch
        node = node.parentNode

      if node?.dataset?.touch then node else el

    parentScrolls = (node) ->
      scrolls = false

      while node.parentNode and isTouch
        if scrolls = scrolls or node.scrollHeight > node.offsetHeight
          break
        else
          node = node.parentNode

      return scrolls and node

    toggleActiveState = (isActive) ->
      if isActive
        el = touch.el
        while el.parentNode
          el.classList.add activeClass
          break if el.dataset.nobubble
          el = el.parentNode
      else
        for el in document.querySelectorAll("." + activeClass)
          el.classList.remove activeClass

    onStart = (e) ->
      return if touch

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

      _e = if isTouch then e.touches[0] else e

      {clientX, clientY} = _e
      {width, top, left, height} = touch.offset

      touch.offset.startX ?= clientX
      touch.offset.startY ?= clientY
      touch.parentScrollY ?= touch.scrollParent?.scrollTop

      if touch.parentScrollY isnt touch.scrollParent?.scrollTop
        return onCancel()

      nearEnough = clientX > left - buffer and
                   clientX < left + width + buffer and
                   clientY > top - buffer and
                   clientY < top + height + buffer and
                   Math.abs(clientX - touch.offset.startX) < maxDistance and
                   Math.abs(clientY - touch.offset.startY) < maxDistance

      toggleActiveState(nearEnough)

    onEnd = (e) ->
      return unless touch

      unbindEvent(_move, onMove, false)
      unbindEvent(_end, onEnd, false)

      if nearEnough
        e.preventDefault()
        e.stopPropagation()

        {el, scrollParent} = touch

        tapEvent = document.createEvent "Event"
        tapEvent.initEvent eventName, true, true

        if scrollParent
          _e = e.changedTouches[0]
          el = document.elementFromPoint(_e.pageX, _e.pageY) or el
        else
          el.dispatchEvent(tapEvent)

        window.clearTimeout timeout
        timeout = window.setTimeout (->
          toggleActiveState(false)
          el.dispatchEvent(tapEvent) if scrollParent
        ), minActiveMS

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

    Backbone?.on("canceltap", onCancel)

    bindEvent(_start, onStart, false)
    bindEvent("touchcancel", onCancel, false) if isTouch
