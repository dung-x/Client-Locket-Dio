// Safari 12.5 baseline polyfills — must be the FIRST import in main.jsx.
// Transpilation (vite-plugin-legacy) fixes syntax (?./??); this file fixes
// missing runtime APIs so the app doesn't throw on first render.

import "core-js/stable";
import "regenerator-runtime/runtime";
import "resize-observer-polyfill";
import "intersection-observer";

// --- Promise.allSettled (Safari 13+) ---
if (!Promise.allSettled) {
  Promise.allSettled = function (promises) {
    return Promise.all(
      Array.prototype.map.call(promises, function (p) {
        return Promise.resolve(p).then(
          function (value) {
            return { status: "fulfilled", value: value };
          },
          function (reason) {
            return { status: "rejected", reason: reason };
          }
        );
      })
    );
  };
}

// --- Promise.prototype.finally (defensive; Safari 11.1+ has it, keep for webviews) ---
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (onFinally) {
    var P = this.constructor;
    return this.then(
      function (value) {
        return P.resolve(onFinally()).then(function () {
          return value;
        });
      },
      function (reason) {
        return P.resolve(onFinally()).then(function () {
          throw reason;
        });
      }
    );
  };
}

// --- String.prototype.replaceAll (Safari 13.1+) ---
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (search, replacement) {
    if (search instanceof RegExp && !search.global) {
      throw new TypeError(
        "String.prototype.replaceAll called with a non-global RegExp"
      );
    }
    if (search instanceof RegExp) {
      return this.replace(search, replacement);
    }
    return this.split(search).join(replacement);
  };
}

// --- Array.prototype.at (Safari 15.4+) ---
if (!Array.prototype.at) {
  Array.prototype.at = function (index) {
    var len = this.length;
    var i = Math.trunc(index) || 0;
    if (i < 0) i += len;
    if (i < 0 || i >= len) return undefined;
    return this[i];
  };
}

// --- Array.prototype.flat / flatMap (Safari 12 has flat, guard anyway) ---
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    var d = depth === undefined ? 1 : Math.trunc(depth);
    var flatten = function (arr, level) {
      return arr.reduce(function (acc, val) {
        if (Array.isArray(val) && level > 0) {
          acc.push.apply(acc, flatten(val, level - 1));
        } else {
          acc.push(val);
        }
        return acc;
      }, []);
    };
    return flatten(this, d < 0 ? 0 : d);
  };
}
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function (callback, thisArg) {
    return this.map(callback, thisArg).flat(1);
  };
}

// --- Object.hasOwn (Safari 15.4+) ---
if (!Object.hasOwn) {
  Object.hasOwn = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(Object(obj), prop);
  };
}

// --- Object.fromEntries (Safari 12.1+, guard for older webviews) ---
if (!Object.fromEntries) {
  Object.fromEntries = function (entries) {
    var obj = {};
    for (var i = 0; i < entries.length; i++) {
      obj[entries[i][0]] = entries[i][1];
    }
    return obj;
  };
}

// --- globalThis (Safari 12.1+, guard anyway) ---
if (typeof globalThis === "undefined") {
  // eslint-disable-next-line no-global-assign
  window.globalThis = window;
}

// --- AbortController / AbortSignal (Safari 12.1+ has it; minimal stub for older) ---
if (typeof window.AbortController === "undefined") {
  window.AbortController = function () {
    this.signal = { aborted: false, addEventListener: function () {} };
    this.abort = function () {
      this.signal.aborted = true;
    };
  };
}

// --- requestIdleCallback fallback (used by some libs) ---
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function (cb) {
    return setTimeout(function () {
      cb({ didTimeout: false, timeRemaining: function () { return 50; } });
    }, 1);
  };
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}

// --- smooth scroll behavior fallback: Safari 12 throws on { behavior: "smooth" } ---
(function () {
  if (!("scrollBehavior" in document.documentElement.style)) {
    var originalScrollTo = window.scrollTo.bind(window);
    window.scrollTo = function (options) {
      if (options && typeof options === "object") {
        return originalScrollTo(options.left || 0, options.top || 0);
      }
      return originalScrollTo.apply(window, arguments);
    };
    if (Element.prototype.scrollIntoView) {
      var originalScrollIntoView = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (options) {
        if (options && typeof options === "object") {
          return originalScrollIntoView.call(this, true);
        }
        return originalScrollIntoView.apply(this, arguments);
      };
    }
  }
})();
