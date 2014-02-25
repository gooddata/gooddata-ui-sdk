(function(window, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser Global (gooddata is out global library identifier)
    window.gooddata = factory();
  }
}(this, function() {
