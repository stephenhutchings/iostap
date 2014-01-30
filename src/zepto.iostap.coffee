# Creates a new event called "iostap", which creates pseudo active
# states ("__active") for all elements that are touched, if the user's
# pointer is close enough to the original element.

((window, document) ->
  # The object that will retain scroll and co-ordinate information, as well
  # as the source element.
  touch = {}

  # Determine whether touch events are available.
  isTouch = "ontouchstart" of window

  # Setup events based on whether touch events are available on the device.
  _start =  if isTouch then "touchstart" else "mousedown"
  _move =   if isTouch then "touchmove" else "mousemove"
  _end =    if isTouch then "touchend" else "mouseup"
  _cancel = if isTouch then "touchcancel"

  # Buffers are proportional to overall size of the window. Smaller devices
  # should require greater accuracy.
  nearBuffer = Math.pow(window.innerHeight * window.innerWidth, 0.35)
  scrollBuffer = nearBuffer / 5

  # The class we will give actively touched elements.
  activeClass = "__active"

  # The name of the event.
  eventName = "iostap"

  # Time before the state is removed from the active element.
  minimumActiveTime = 100

  # Whether the current position is near enough to trigger the event.
  nearEnough = false

  # If the current node is text, return it's parent element.
  parentIfText = (node) ->
    if "tagName" of node then node else node.parentNode

  # If touch events are available, return the first touch of the touches array.
  getFirstTouch = (e) ->
    if isTouch then e.touches[0] else e

  # If any parents scroll by more than the buffer, cancel the event.
  checkForScroll = ->
    for el, i in touch.scrollParents
      if Math.abs(touch.scrollOffsets[i] - el.scrollTop) > scrollBuffer
        nearEnough = false

  # Toggle the active state of the element and all its parents.
  # The check for the type of the class name is a fix for svg content,
  # whose class name is a special string and fails for $.toggleClass()
  toggleActiveState = (isEnd) ->
    return if not touch.el or
           typeof(touch.el.get(0).className) isnt "string"

    nearEnough = Math.abs(touch.x1 - touch.x2) < nearBuffer and
                 Math.abs(touch.y1 - touch.y2) < nearBuffer and
                 not isEnd

    checkForScroll()
    touch.el
      .toggleClass(activeClass, nearEnough)
      .parents()
      .toggleClass(activeClass, nearEnough)

  # Attach move and end events.
  # Only connect the cancel event if it exists.
  attachEvents = ->
    $(document.body)
      .on(_move, onMove)
      .on(_end, onEnd)

    if _cancel
      $(document.body)
        .on(_cancel, onCancel)

  # Detach move and end events.
  # Only disconnect the cancel event if it exists.
  detachEvents = ->
    $(document.body)
      .off(_move, onMove)
      .off(_end, onEnd)

    if _cancel
      $(document.body)
        .off(_cancel, onCancel)

  # Store the event, and the current co-ordinates of the start event. Retain
  # a cached reference to the original DOM element, and any parent elements
  # that have their overflow set to "scroll". Toggle the class for all elements
  # and auto-trigger the move event, in case the user taps without dragging.
  onStart = (e) ->
    _e = getFirstTouch(e)

    touch =
      el: $(parentIfText(_e.target))
      x1: _e.clientX
      y1: _e.clientY
      scrollParents: []
      scrollOffsets: []

    touch.el.parents().each ->
      if window.getComputedStyle(this).overflow is "scroll"
        touch.scrollParents.push this
        touch.scrollOffsets.push @scrollTop

    toggleActiveState(false)
    onMove(e)
    attachEvents()

  # Store consequent movements on the users pointer for state change comparison.
  onMove = (e) ->
    _e = getFirstTouch(e)
    touch.x2 = _e.clientX
    touch.y2 = _e.clientY
    toggleActiveState(false)

  # Check that no scroll has occured, and trigger the event if the pointer is
  # near enough. Wait the minimum time before doing final state changes and
  # clearing the touch object.
  onEnd = ->
    checkForScroll()
    touch.el.trigger eventName if nearEnough

    window.setTimeout (->
      toggleActiveState(true)
      touch = {}
      return
    ), minimumActiveTime

    detachEvents()

  # Doing final state changes and clear the touch object.
  onCancel = ->
    toggleActiveState(true)
    touch = {}
    detachEvents()

  # If the required getComputedStyle is available, set up events as normal.
  if window.getComputedStyle
    $(document).ready ->
      $(document.body).on(_start, onStart)

  # If getComputedStyle isn't supported, the touch module will not work
  # properly, so we'll just map clicks to "iostap".
  else
    $(document).ready ->
      $(document.body).on("click", (e) ->
        $(e.target).trigger("iostap"))

  # Add the event to Zepto.
  $.fn[eventName] = (callback) ->
    @on m, callback

  return
)(window, document)
