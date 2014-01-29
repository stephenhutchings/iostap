## zepto.iostap

---------------

### Using it

Download the source files from the `build` directory, or use [bower](http://www.bower.io/).

```
$ bower install
```

---------------

### What is it?

IOSTAP is a plugin designed to work on top of [Zepto's](http://www.zeptojs.com/) existing touch event module. It mimics the behaviour of tapping a button in the iOS ecosystem with a great degree of precision, affording developers who build hybrid web apps a greater user experience for their users.

Under the hood, there is more going on than you might think.

The library aims to acheive several goals in imitated the native iOS tap:
  - Tapping on an element and releasing *near* that element activates an "iostap event".
  - Moving a significant distance away from the original element with your finger cancels the tap event, *unless* your finger returns to the element without leaving the surface of the touch device.
  - When an element is active, the element (and all of its parent elements), are given an "__active" pseudo-pseudo class, so that you can control their appearance with CSS.
  - If you start a tap on an element, but it or its parents *begin to scroll*, the tap event is cancelled.
  - The "iostap" event is triggered regardless of whether the device is touch-enabled, so you can use it in any environment without extra configuration.
  - The library reverts to click events if `getComputedStyle` is unavailable,
  making it compatible with IE 8.

---------------

### Developing and testing

There is a `Cakefile` for building, watching and linting. All these commands can be run with `cake`.

```
$ cake build         # Build the library

$ cake watch         # Watch for changes

$ cake lint          # Lint the compiled javascript.

```
