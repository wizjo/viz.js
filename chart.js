var Chart = Class.extend({
  defaults:{
    height: 400
  , width: 600
  , xLeftMargin: 50
  , xRightMargin: 30
  , yMargin: 30
  }

  , init: function(selector, options) {
    // Put properties from defaults and options on this object
    $.extend(true, this, this.defaults, options);
  }
});
