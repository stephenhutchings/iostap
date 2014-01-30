## zepto.iostap

See the [demo](http://stephenhutchings.github.io/zepto.iostap/demo/).

### How to use it

Download the source files from the `build` directory, or use [Bower](http://www.bower.io/).

```bash
$ bower install zepto.iostap
```

Then you're good to go. You can listen for `"iostap"` events on any old element. For example:

```js
$("a.link").on("iostap", function(e) {
  console.log(e.currentTarget);
})
```

### Tell me more

`zepto.iostap` is a plugin designed to work on top of [Zepto's](http://www.zeptojs.com/) pre-existing touch event module. It mimics the behaviour of tapping a button in the iOS ecosystem with a great degree of precision, affording developers who build hybrid web apps a greater user experience for their users. `zepto.iostap` is a super-lightweight library, weighing in at about 1kb, and doesn't add unecessary overhead client-side.

Under the hood, there is more going on than you might think.

The library aims to acheive several goals in imitating the native iOS tap:
  - Tapping on an element and releasing *near* that element triggers an `"iostap"` event.
  - Moving a significant distance away from the original element with your finger cancels the event, *unless* your finger returns to the element without leaving the surface of the touch device.
  - When an element is active, the element (and all of its parent elements), are given an `__active` pseudo `pseudo::` class, so that you can control their appearance with CSS. For example: `a.button.__active {...}`.
  - If you start a tap on an element, but it or its parents *begin to scroll*, the tap event is cancelled.
  - The `"iostap"` event is triggered regardless of whether the device is touch-enabled or not, so you can use it in any environment without extra configuration.
  - The library reverts to click events if `window.getComputedStyle` is unavailable, making it compatible with IE 8.

### Developing and testing

There is a `Cakefile` for building, watching and linting. All these commands can be run with `cake`.

```bash
$ cake build    # Build the library
$ cake watch    # Watch for changes
$ cake lint     # Lint the compiled javascript.
```

Feel free to submit [issues](https://github.com/stephenhutchings/zepto.iostap/issues) or make [pull](https://github.com/stephenhutchings/zepto.iostap/pulls) requests.
