require.config({
  baseUrl: '../bower_components',
  paths: {
    'chai'      : 'chai/chai',
    'd3'        : 'd3/d3',
    'jquery'    : 'jquery/dist/jquery',
    'mocha'     : 'mocha/mocha',
    'requrejs'  : 'requirejs/require',
    'tipsy'     : 'tipsy/src/javascripts/jquery.tipsy'
  },
  shim: {},
  // urlArgs: 'bust=' + (new Date()).getTime()
});
 
define('SpecRunner', ['requirejs', 'mocha', 'jquery', 'd3'], function(require, mocha, jQuery, d3) {
  mocha.setup('bdd');
 
  require([
    'spec/bar_chart_spec',
  ], function(require) {
    mocha.run();
  });

});