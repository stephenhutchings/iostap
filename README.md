## iostap

See the [demo](http://stephenhutchings.github.io/iostap/demo/).

### How to use it

Download the source files from the `build` directory, or use [Bower](http://www.bower.io/).

```bash
$ bower install iostap
```

Initialize the module to start listening for tap events...

```js
window.iostap.initialize();
```

Then you're good to go. You can listen for `"iostap"` events on any old element. For example:

```js
$("a.link").on("iostap", function(e) {
  console.log(e.currentTarget);
})
```

You can pass options to the `initialize` method or `set` them later on.

```js
window.iostap.set({
  // Name of the event to be fired
  eventName: "iostap",

  // Class applied to every element in the tree on touch
  activeClass: "__active",

  // Mininum time for the element to be active, after the touch ends
  minActiveMS: 50,

  // options.Buffer area around the element that is still considered active
  buffer: 20,

  // Maximum distance travelled before the touch becomes inactive
  maxDistance: Math.pow(window.innerHeight * window.innerWidth, 0.35),

  // Allow default behaviour and event propagation for events of this type
  allowDefault: function(e){
    e.target.nodeName.match(/^(INPUT|TEXTAREA|SELECT)$/);
  }
});
```

### Tell me more

`iostap` is a plugin designed to mimic the behaviour of tapping a button in the iOS ecosystem with a great degree of precision, affording developers who build hybrid web apps a greater user experience for their users. `iostap` is a super-lightweight library, weighing in at about 1kb, and doesn't add unecessary overhead client-side.

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

Feel free to submit [issues](https://github.com/stephenhutchings/iostap/issues) or make [pull](https://github.com/stephenhutchings/iostap/pulls) requests.

### Deploy gh-pages

```
git push -f origin master:gh-pages
```
