var viz = { version: '1.0.0' };// Based in part on John Resig’s Simple JavaScript Inheritance.

/*
* Copyright (c) John Resig

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
// John Resig's simple inheritance. Inspired by base2 and Prototype
// from http://ejohn.org/blog/simple-javascript-inheritance/#postcomment
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();
;var Chart = Class.extend({
  defaults: {
    height: 400, 
    width: 600,
    xLeftMargin: 50,
    xRightMargin: 30,
    yMargin: 30
  },

  init: function(selector, options) {
    // Put properties from defaults and options on this object
    $.extend(true, this, this.defaults, options);
  }
});
;/* 
  var data = {
    labels: ["Web", "Desktop", "iPhone", "Windows Phone", "Android"], 
    values: {
      "Mission District": [ {x:0, y:75.9}, {x:1, y:36.9}, {x:2, y:9.8}, {x:3, y:0.2}, {x:4, y:0.1} ], 
      "Potrero Hill": [ {x:0, y:95.0}, {x:1, y:10.9}, {x:2, y:9.8}, {x:3, y:0.1}, {x:4, y:2.4} ]
    }
  }
*/

var BarChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup, all these can be overwritten by options
    this.width = this.width || 400;
    this.space = this.space || 20;
    this.leftMargin = this.leftMargin || 5;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 5;
    this.bottomMargin = this.bottomMargin || 5;
    this.barWidth = this.barWidth || 5; // sets the width of each bar
    
    this.baseline = this.baseline || "right"; // available values: "left", "right"
    this.stacked = this.stacked || false; // true: stacked bars; false: grouped bars
    this.fill = this.fill || d3.scale.category10();
    this.addRules = this.addRules || true;
    this.useTipsy = this.useTipsy || false;
    this.formatter = this.formatter || ".2f";
    
    // Reformat data for charting (and labeling)
    this.series = this.series || $.map(data.values, function(values, key){ return [key]; })
    data.values = d3.layout.stack()($.map(data.values, function(values, key){ return [values]; }));
    
    // Override height based on spacing between bars and width of bar given
    this.height = ((data.labels.length - 1) * this.space + 
      (this.stacked ? 1 : this.series.length) * data.labels.length * this.barWidth) + this.bottomMargin;
    
    this.max = this.max || d3.max($.map(data.values, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(data.values, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    
    // Bars extend horizontally in BarChart, vertically in ColumnChart
    if(self.baseline === 'left') {
      this.hScale = this.hScale || d3.scale.linear()
        .domain([(self.min < 0 ? self.min : 0), self.max])
        .range([0, self.width - self.leftMargin - self.rightMargin]);
    } else {
      this.hScale = this.hScale || d3.scale.linear()
        .domain([(self.min < 0 ? self.min : 0), self.max])
        .range([self.width - self.leftMargin - self.rightMargin, 0]);
    }
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "bar_chart")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + this.leftMargin + ", "+ this.topMargin + ")");
    
    if(this.addRules || this.numRules && this.numRules > 0) {
      this.g.selectAll("line.rule")
          .data(function() {
            var rules = self.hScale.ticks(self.numRules);
            return $.map(rules, function(value, idx){ if(idx < rules.length) { return [value] } });
          })
        .enter().append("line")
          .attr("class", "rule")
          .attr("x1", this.hScale)
          .attr("x2", this.hScale)
          .attr("y1", 0)
          .attr("y2", this.height)
          .style("stroke", function(d, i){ return i>0? "#ccc" : "#333"; })
          .attr("stroke-width", function(d, i){ return i>0? 0.6:1 });
    }
    
    $.each(data.values, function(key, values) {
      self.addBar(key, values);
    })
    
    if(this.useTipsy) {
      $(selector+' rect').tipsy({
        gravity: self.baseline == 'right'? 'e' : 'w', 
        title: function() {
          var d = this.__data__;
          return d3.format(self.formatter)(d.y);
        }
      });
    }
  }
  
  , addBar: function(key, values) {
    self = this;
    this.g.selectAll("rect." + "series_" + key)
        .data(values)
      .enter().append("svg:rect")
        .attr("class", function() { return "series_" + key; })
        .attr("x", function(d) { 
          if(self.baseline === 'left') { return self.hScale( self.stacked? d.y0 : 0); }
          else { return self.hScale( self.stacked? (d.y+d.y0) : d.y); }
        })
        .attr("y", function(d, i) { 
          return (self.stacked? 0 : parseInt(key) * self.barWidth) + i * ((self.stacked ? 1 : self.series.length)*self.barWidth + self.space); 
        })
        .attr("height", self.barWidth)
        .attr("width", function(d) { 
          if(self.baseline === 'left') { return self.hScale(d.y); }
          else { return self.hScale(0) - self.hScale(d.y); }
        })
        .attr("stroke", "none")
        .attr("fill", function(d, i) { return self.fill("bar_" + key + "_" + i) });
  }
});
;/*
"title" and "subtitle" are both optional.

data = [
  {"title":"Revenue","subtitle":"US$, in thousands","ranges":[150,225,300],"measures":[220,270],"markers":[250]},
  {"title":"Profit","subtitle":"%","ranges":[20,25,30],"measures":[21,23],"markers":[26]},
  {"title":"Order Size","subtitle":"US$, average","ranges":[350,500,600],"measures":[100,320],"markers":[550]},
  {"title":"New Customers","subtitle":"count","ranges":[1400,2000,2500],"measures":[1000,1650],"markers":[2100]},
  {"title":"Satisfaction","subtitle":"out of 5","ranges":[3.5,4.25,5],"measures":[3.2,4.7],"markers":[4.4]}
];
*/

var BulletChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    this.selector = selector;
    
    this.width = this.width || 500;
    this.height = this.height || 45;
    this.leftMargin = this.leftMargin || 100;
    this.rightMargin = this.rightMargin || 5;
    this.topMargin = this.topMargin || 2;
    this.bottomMargin = this.bottomMargin || 2;
    
    this.title = this.title || false;
    this.subtitle = this.subtitle || false;
    this.fill = this.fill || d3.scale.category10();
    this.hover_events = this.hover_events || false;
    this.hover_label_color = this.hover_label_color || "#333";
        
    this.chart = this.chart || d3.chart.bullet()
        .width(this.width - this.leftMargin - this.rightMargin)
        .height(this.height - this.topMargin - this.bottomMargin);
    
    this.vis = d3.select(selector).selectAll("svg")
        .data(data)
      .enter().append("svg:svg")
        .attr("class", "bullet")
        .attr("id", function(d, i){ return "chart-" + i })
        .attr("width", this.width)
        .attr("height", this.height)
      .append("svg:g")
        .attr("transform", "translate(" + this.leftMargin + ", " + this.topMargin + ")")
        .call(this.chart);
    
    this.t = d3.select(selector).selectAll("svg.bullet")
        .attr("text-anchor", "end");
        
    this.hover_idx = -1;
    
    if(this.title) {
      this.addTitle();
    }
    
    if(this.subtitle) {
      this.addSubTitle();
    }

    if(this.annotation) {
      this.addAnnotation();
    }
    
    if(this.hover_events) {
      this.addChartTips();
      this.vis
          .on("mouseover", function(d, i){ return self.mouseover(d, i) })
          .on("mouseout",  function(d, i){ return self.mouseout(d, i) });
    }
  }
  
  , addTitle: function() {
    this.t.append("svg:text")
        .attr("class", "title")
        .attr("transform", "translate(" + this.leftMargin*.95 + ", " + (this.height - this.topMargin - this.bottomMargin) / 2 + ")")
        .text(function(d) { return d.title; });
  }
  
  , addSubTitle: function() {
    this.t.append("svg:text")
        .attr("class", "subtitle")
        .attr("transform", "translate(" + this.leftMargin*.70 + ", " + (this.height - this.topMargin - this.bottomMargin + 4) / 2 + ")")
        .attr("dy", "1em")
        .text(function(d) { return d.subtitle; });
  }

  , addAnnotation: function() {
    this.t.append("svg:text")
        .attr("class", "annotation")
        .attr("transform", "translate(" + this.leftMargin*.95 + ", " + (this.height - this.topMargin - this.bottomMargin + 6) / 2 + ")")
        .attr("dy", "1em")
        .text(function(d) { return "(" + d.annotation + ")"; });
  }
  
  , addChartTips: function() {
    self = this;
    this.t.append("svg:text")
        .attr("class", "tip")
        .attr("dy", ".8em")
        .attr("transform", function(d) {
          return "translate(" + (self.leftMargin + (self.width - self.leftMargin - self.rightMargin) / d.ranges[d.ranges.length - 1] * d.measures[0])
            + ", " + (self.height - self.topMargin - self.bottomMargin) / 2 + ")";
        })
        .text(function(d) { return d.measures[0]; })
        .attr("fill", "none");
  }
  
  // Hover over bulletchart to view metric value
  , mouseover: function(d, i) {
    var self = this;
    this.hover_idx = i;
    d3.select(this.selector).selectAll("text.tip")
      .attr("fill", function(d, i) { return self.hover_idx==i? self.hover_label_color : "none"; });
    d3.select(this.selector).selectAll("rect.measure")
      .attr("stroke", function(d, i) { return self.hover_idx==i? "#FFF" : "none"; })
      .attr("stroke-width", "2px");
    this.hover_idx = -1;
  }
  
  // And hide this value metric again when mouseout
  , mouseout: function(d, i) {
    var self = this;
    this.hover_idx = i;
    d3.select(this.selector).selectAll("text.tip")
      .attr("fill", "none");
    d3.select(this.selector).selectAll("rect.measure")
      .attr("stroke", "none")
    this.hover_idx = -1;
  }
  
});
;/* 
  var data = {
    labels: ["Web", "Desktop", "iPhone", "Windows Phone", "Android"], 
    values: {
      "SOMA": [ {x:0, y:75.9}, {x:1, y:36.9}, {x:2, y:9.8}, {x:3, y:0.2}, {x:4, y:0.1} ], 
      "Market Square": [ {x:0, y:95.0}, {x:1, y:10.9}, {x:2, y:9.8}, {x:3, y:0.1}, {x:4, y:2.4} ]
    }
  }
*/

var ColumnChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup, all these can be overwritten by options
    this.height = this.height || 400;
    this.space = this.space || 20;
    this.leftMargin = this.leftMargin || 5;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 5;
    this.bottomMargin = this.bottomMargin || 5;
    this.barWidth = this.barWidth || 5; // sets the width of each bar
    
    this.baseline = this.baseline || "bottom"; // available values: "top", "bottom"
    this.stacked = this.stacked || false; // true: stacked bars; false: grouped bars
    // this.fill = this.fill || d3.scale.category10();
    
    // Set up rules, axis, ticks
    this.numRules = this.numRules || 1; // number of rules to add, first rule is where the bars' baseline is
    this.yaxis_position = this.yaxis_position || "left"; // position to place yaxis: "left", "right", "none"
    this.ynumTicks = this.ynumTicks || 10; // number of ticks on the Y Axis
    this.yAxisMargin = this.yAxisMargin || 30;
    this.show_labels = this.show_labels || false;
    this.label_position = this.label_position || "vertical";
    this.useTipsy = this.useTipsy || false;
    this.formatter = this.formatter || ".2f";
    
    // Reformat data for charting (and labeling)
    this.series = this.series || $.map(data.values, function(values, key){ return [key]; })
    data.values = d3.layout.stack()($.map(data.values, function(values, key){ return [values]; }));
    
    // Override width based on spacing between bars and width of bar given
    this.width = ((data.labels.length - 1) * this.space + 
      (this.stacked ? 1 : this.series.length) * data.labels.length * this.barWidth) + this.leftMargin + this.rightMargin + this.yAxisMargin;
    
    this.max = this.max || d3.max($.map(data.values, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(data.values, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    
    // Bars extend horizontally in BarChart, vertically in ColumnChart
    if(self.baseline === 'top') {
      this.vScale = this.vScale || d3.scale.linear()
        .domain([(self.min < 0 ? self.min : 0), self.max])
        .range([0, self.height - self.topMargin - self.bottomMargin]);
    } else {
      this.vScale = this.vScale || d3.scale.linear()
        .domain([(self.min < 0 ? self.min : 0), self.max])
        .range([self.height - self.topMargin - self.bottomMargin, 0]);
    }
    
    // Define yAxis
    this.yAxis = d3.svg.axis().scale(this.vScale).ticks(this.ynumTicks).tickFormat(
        function(d) {
          var wholeNumber = d3.format(",0d");
          if (d == 0) { return 0; }
          if (d > 1) { return wholeNumber(d); }
          if (d >= 0.01) { return n.toPrecision(2); }
          return parseFloat(n.toPrecision(2)).toExponential();
        }
    ).orient(this.yaxis_position);
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "column_chart")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + (this.yaxis_position === 'left'? this.yAxisMargin+this.leftMargin : this.leftMargin) + ", "+ this.topMargin + ")");
    
    // Draw chart
    $.each(data.values, function(key, values) {
      self.addBar(key, values);
    })
    
    // Add rules
    if(this.numRules > 0) {
      this.g.selectAll("line.rule")
          .data(function() {
            var rules = self.vScale.ticks(self.numRules);
            return rules.slice(0,self.numRules);
          })
        .enter().append("svg:line")
          .attr("class", function(d, i){ return i>0? "rule" : "rule_first"})
          .attr("y1", this.vScale)
          .attr("y2", this.vScale)
          .attr("x1", -this.leftMargin)
          .attr("x2", this.width);
    }
    
    // Add Y Axis
    if(this.yaxis_position !== 'none') {
      this.g.append("svg:g")
          .attr("class", "y axis")
          .attr("transform", function() {
            if(self.yaxis_position === 'left') {
              return "translate(-" + self.leftMargin + ", " + 0 + ")"
            } else{
              return "translate(" + (self.width - self.rightMargin) + ", " + 0 + ")"
            } })
          .call(this.yAxis);
    }
    
    // Add labels against baseline
    if(this.show_labels) {
      this.g.selectAll("text.label")
          .data(data.labels)
        .enter().append("svg:text")
          .attr("class", "label")
          .attr("x", function(d, i) { 
            return (self.stacked? 0 : parseInt(key) * self.barWidth) + i * ((self.stacked ? 1 : self.series.length)*self.barWidth + self.space); 
          })
          .attr("y", this.height - this.topMargin  - this.bottomMargin)
          .attr("text-anchor", "end")
          .attr("transform", function(d, i){
            return "translate(" + ((self.stacked? 0.55 : 1.05) * self.barWidth) + ", " + (self.label_position=="vertical"? 5: 8) + ")" 
              + "rotate(" + (self.label_position == 'vertical'? "-90" : "-45")
              + " " + ((self.stacked? 0 : parseInt(key) * self.barWidth) + i * ((self.stacked ? 1 : self.series.length)*self.barWidth + self.space))
              + " " + (self.height - self.topMargin  - self.bottomMargin) + ")";
          })
          .text(function(d) { return d; });
    }
    
    if(this.useTipsy) {
      $(selector+' rect').tipsy({
        gravity: 'sw', 
        title: function() {
          var d = this.__data__;
          return d3.format(self.formatter)(d.y);
        }
      });
    }
  }
  
  , addBar: function(key, values) {
    self = this;
    this.g.selectAll("rect." + "series_" + key)
        .data(values)
      .enter().append("svg:rect")
        .attr("class", function() { return "series_" + key; })
        .attr("y", function(d) { 
          if(self.baseline === 'top') { return self.vScale( self.stacked? d.y0 : 0); }
          else { return self.vScale( self.stacked? (d.y0+d.y) : d.y ); }
        })
        .attr("x", function(d, i) { 
          return (self.stacked? 0 : parseInt(key) * self.barWidth) + i * ((self.stacked ? 1 : self.series.length)*self.barWidth + self.space); 
        })
        .attr("width", self.barWidth)
        .attr("height", function(d) { 
          if(self.baseline === 'top') { return self.vScale(d.y); }
          else { return self.vScale(0) - self.vScale(d.y); }
        })
        .attr("fill", function(d, i) { return self.fill? self.fill("bar_" + key + "_" + i) : "none" });
  }
});
;/*
data = {
  var1: 1,
  var2: 0.56,
  var3: 0.25,
  var4: ...
}
*/
var ConcentricChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    this.align = this.align || "center"; // available values: "left", "right", "up", "bottom", "center"
    this.margin = this.margin || 5;
    this.fill = this.fill || d3.scale.category10();
    this.rScale = this.rScale || d3.scale.sqrt().domain([0, 1]).range([0, (this.height - 2 * this.margin) / 2.0]);
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + this.margin + ", " + this.margin + ")");

    $.each(data, function(key, value) {
      // self.addCircle(key, Math.sqrt(value * Math.pow(self.height / 2.0, 2)));
      self.addCircle(key, value);
    })
  }

  , addCircle: function(key, value) {
    var self = this;
    this.g.append("svg:circle")
        .attr("class", "circle " + key)
        .attr("cx", function() {
          switch(self.align) {
            case "left":
              return self.rScale(value);
              break;
            case "right":
              return 2 * self.rScale(1) - self.rScale(value);
              break;
            case "center":
              return self.rScale(1);
              break;
            case "up":
              return self.rScale(1);
              break;
            case "down":
              return self.rScale(1);
              break;
            default:
              return self.rScale(1);
              break;
          }
        })
        .attr("cy", function() {
          switch(self.align) {
            case "left":
              return self.rScale(1);
              break;
            case "right":
              return self.rScale(1);
              break;
            case "center":
              return self.rScale(1);
              break;
            case "up":
              return self.rScale(value);
              break;
            case "bottom":
              return 2 * self.rScale(1) - self.rScale(value);
            default:
              return self.rScale(1);
          }
        })
        .attr("stroke", "none")
        .attr("fill", this.fill(key))
        .attr("r", this.rScale(value));
  }
  
});
;/* FilledSeries chart filled in a specified color between two series,
 * optionally taking in a median/mean line series.
 * Great for visualizing the distribution of a timeseries.
*/
/*
var data = {
  top: [ 
    {x:0,y:5.295770},{x:1,y:4.687696},{x:2,y:4.780019},{x:3,y:4.708572},{x:4,y:4.059563},{x:5,y:3.304786},{x:6,y:3.698539},{x:7,y:5.769050},
    {x:8,y:7.148457},{x:9,y:5.379059},{x:10,y:5.096190},{x:11,y:3.430098},{x:12,y:3.650171},{x:13,y:3.930086},{x:14,y:5.255793},{x:15,y:4.658709},
    {x:16,y:5.083070},{x:17,y:5.085777},{x:18,y:4.228270},{x:19,y:4.367545},{x:20,y:4.765577},{x:21,y:5.031843},{x:22,y:5.614700},{x:23,y:6.586822}
  ],
  bottom: [
    {x:0,y:3.411224},{x:1,y:1.151568},{x:2,y:3.944863},{x:3,y:2.207100},{x:4,y:1.863008},{x:5,y:2.5},{x:6,y:2.6},{x:7,y:4.302097},
    {x:8,y:3.900753},{x:9,y:2.673806},{x:10,y:2.318036},{x:11,y:1.2},{x:12,y:1.981834},{x:13,y:2.588354},{x:14,y:2.327278},{x:15,y:3.0},
    {x:16,y:2.546604},{x:17,y:3.539270},{x:18,y:2.657060},{x:19,y:3.645859},{x:20,y:3.330045},{x:21,y:2.217949},{x:22,y:3.230335},{x:23,y:4.268979}
  ],
  mean: [
    {x:0,y:4.409359},{x:1,y:4.231371},{x:2,y:4.270392},{x:3,y:3.697520},{x:4,y:3},{x:5,y:3.0},{x:6,y:3.45},{x:7,y:5},
    {x:8,y:5.5},{x:9,y:4.854011},{x:10,y:4.461596},{x:11,y:2},{x:12,y:3.2},{x:13,y:3.297944},{x:14,y:4.521973},{x:15,y:4.5},
    {x:16,y:4.682949},{x:17,y:4},{x:18,y:3.605923},{x:19,y:3.835811},{x:20,y:3.718230},{x:21,y:4.142473},{x:22,y:3.551300},{x:23,y:4.945163}
  ]
};
*/

var FilledSeries = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup, all these can be overwritten by options
    this.startX = this.startX || d3.min($.map(data, function(values){ return values[0].x; }));
    this.endX = this.endX || d3.max($.map(data, function(values){ return values[values.length-1].x; }));
    this.max = this.max || d3.max($.map(data, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(data, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return values.y; 
      })) 
    }));
    
    // Only support linear scales for the time being
    this.x = this.x || d3.scale.linear().domain([this.startX, this.endX]).range([0 + this.xLeftMargin, this.width - this.xLeftMargin - this.xRightMargin]);
    this.y = this.y || d3.scale.linear().domain([this.min<0? this.min:0, this.max]).range([0 + this.yMargin, this.height - this.yMargin]);
    this.yAxisScale = this.yAxisScale || d3.scale.linear().domain([this.min<0? this.min:0, this.max]).range([this.height - this.yMargin, 0 + this.yMargin]);
    this.xNumTicks = this.xNumTicks || 6;
    this.yNumTicks = this.yNumTicks || 4;
    this.fill = this.fill || d3.scale.category10();
    this.drawDots = this.drawDots || false;
    this.useTipsy = this.useTipsy || false;
    this.formatter = this.formatter || ".2f";
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "filled_series")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(0, " + this.height + ")");

    // Use this for adding lines
    this.line = this.line || d3.svg.line()
        .x(function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .y(function(d) { 
          return -1 * self.y(self.yLineTransform && self.yLineTransform(d.y) || d.y); 
        });
    // Use this for adding areas
    this.area = this.area || d3.svg.area()
        .x(function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .y0(function(d) { return -1 * self.y(d.y0) })
        .y1(function(d) { 
          return -1 * self.y(self.yLineTransform && self.yLineTransform(d.y) || d.y); 
        });
    
    // X Axis
    this.xAxis = this.xAxis || d3.svg.axis().scale(this.x).ticks(this.xNumTicks).orient('bottom');
    this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.height - this.yMargin) + ")")
        .call(this.xAxis);
    
    // Left Y axis
    this.yAxis = this.yAxis || d3.svg.axis().scale(this.yAxisScale).ticks(self.yNumTicks).tickFormat(
        function(n) {
            var wholeNumber = d3.format(",0d");
            if (n == 0) { return 0; }
            if (n > 1) { return wholeNumber(n); }
            if (n >= 0.01) { return n.toPrecision(2); }
            return parseFloat(n.toPrecision(2)).toExponential();
        }
    ).orient('left');
    this.vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + this.xLeftMargin + ", 0)")
        .call(this.yAxis);
    
    if(this.rightAxis) {
      this.rightAxis = this.rightAxis || d3.svg.axis().scale(
        d3.scale.linear().domain([0, self.max]).range([this.height - this.yMargin, 0 + this.yMargin])).ticks(this.yNumTicks).orient('right');
      this.vis.append("svg:g")
          .attr("class", "y axis right")
          .attr("transform", "translate(" + (this.width - this.xLeftMargin - this.xRightMargin) + ", 0)")
          .call(this.rightAxis);
    }
    
    // Draw filled area defined by bottom and top series
    var filled_series = $.map(data.bottom, function(value, idx){
      return {x:idx, y0:value.y, y:data.top[idx].y}
    })
    self.addArea('top', filled_series);
    
    // Draw lines and dots
    $.each(data, function(key, values) {
      self.addLine(key, values);
      if(self.drawDots) { 
        self.addDots(key, values); 
        if(!self.useTipsy) self.addLabels(key, values);
      }
    })
    
    if(this.useTipsy) {
      $(selector+' svg circle').tipsy({
        gravity: 'sw', 
        title: function() {
          var d = this.__data__;
          return d3.format(self.formatter)(d.y);
        }
      });
    }
  }

  , addLine: function(key, values) {
    this.g.append("svg:path")
        .attr("d", this.line(values))
        .attr("class", "line " + key)
        .attr("stroke", this.fill(key))
        .attr("fill", "none");
  }
  , addArea: function(key, values) {
    this.g.append("svg:path")
        .attr("class", "area " + key)
        .attr("d", this.area(values))
        .attr("fill", this.fill(key))
        .attr("fill-opacity", this.fillOpacity || .3);
  }
  
  , addDots: function(key, values) {
    var self = this;
    this.g.selectAll("circle.series_" + key)
        .data(values)
      .enter().append("svg:circle")
        .attr("class", "series_" + key)
        .attr("cx", function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .attr("cy", function(d) { return -1 * self.y( (self.yLineTransform && self.yLineTransform(self.stacked? (d.y + d.y0) : d.y)) || self.stacked? (d.y + d.y0) : d.y );
        })
        .attr("r", this.dot_radius)
        .attr("fill", this.fill(key));
  }
  
});
;var ForceDirected = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup - Dimensions
    this.width = this.width || 1200;
    this.height = this.height || 1000;
    this.leftMargin = this.leftMargin || 10;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 10;
    this.bottomMargin = this.bottomMargin || 10;
    
    this.minWidthValue = this.minWidthValue || d3.min( $.map(data.links, function(d){ return d.value }) );
    this.maxWidthValue = this.maxWidthValue || d3.max( $.map(data.links, function(d){ return d.value }) );
    this.width_s = d3.scale.linear().domain([this.minWidthValue, this.maxWidthValue]).range([this.minEdgeWidth, this.maxEdgeWidth]);
    
    if(this.borderScale) {
      this.minBorderValue = this.minBorderWidth || d3.min( $.map(data.nodes, function(d){ return d.border_width }) );
      this.maxBorderValue = this.maxBorderWidth || d3.max( $.map(data.nodes, function(d){ return d.border_width }) );
      this.border_s = d3.scale.linear().domain([this.minBorderValue, this.maxBorderValue]).range([this.minBorderWidth, this.maxBorderWidth]);
    }
    
    this.minSizeValue = this.minSizeValue || d3.min( $.map(data.nodes, function(d){ return d.size }) );
    this.maxSizeValue = this.maxSizeValue || d3.max( $.map(data.nodes, function(d){ return d.size }) );
    this.size_s = d3.scale.linear().domain([this.minSizeValue, this.maxSizeValue]).range([this.minNodeRadius, this.maxNodeRadius]);
    
    this.nodeFill = this.nodeFill || d3.scale.category20b();
    this.edgeColor = this.edgeColor || d3.scale.category20b();
    this.edgeType = this.edgeType || 'bezier';
    this.directed = this.directed || false;
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "force_directed")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.force = d3.layout.force()
        .gravity(.8)
        .charge(-200)
        .distance(d3.max([this.width, this.height]) / 2)
        .nodes(data.nodes)
        .links(data.links)
        .size([this.width - this.leftMargin - this.rightMargin, this.height - this.topMargin - this.bottomMargin])
        .start();
    
    this.links = this.vis.selectAll("link")
        .data(data.links);
    
    this.nodes = this.vis.selectAll("g.node")
        .data(data.nodes);
    
    this.markers = this.directed? 
      this.vis.append("svg:defs")
          .selectAll("marker")
          .data(data.links) : null;
    
    if(this.directed){ this.drawMarkers(); }
    
    this.drawNodesLinks();
  }
  
  , drawEdge: function(d) {
    switch(this.edgeType){
      case 'bezier': // Bezier Curve
        return "M"+d.source.x+","+d.source.y
               + " Q"+(d.source.x+d.target.x)/2+","+(d.source.size >= d.target.size ? d.source.y+10:d.target.y-10)
               + " "+d.target.x+","+d.target.y;
        break;
      case 'arc': // Quadratic Arc
        return "M "+d.source.x+","+d.source.y 
               + " A"+d.target.x+","+d.target.y
               + " 0 "+ (d.source.size>=d.target.size? "0,0":"0,1")
               + d.target.x+","+d.target.y;
        break;
      case 'straight':
        return "M "+d.source.x+" "+d.source.y+" L "+d.target.x+" "+d.target.y;
        break;
      default:
        return "M"+d.source.x+","+d.source.y
               + " Q"+(d.source.x+d.target.x)/2+","+(d.source.size >= d.target.size ? d.source.y+10:d.target.y-10)
               + " "+d.target.x+","+d.target.y;
        break;
    }
  }
  
  , drawMarkers: function() {
    self = this;
    this.markers
      .enter().append("svg:marker")
        .attr("id", function(d, i) { return "arrow-"+i; })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", function(d) { return self.width_s(d.value); })
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("fill", function(d) { return self.nodeFill(d.source); })
        .attr("fill-opacity", 0.6)
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5 Z");
  }
  
  , drawNodesLinks: function() {
    self = this;
    /* edges first. so that it won't float atop circles. */
    this.links
      .enter().append("svg:path")
        .attr("d", function(d){ return self.drawEdge(d); })
        .attr("stroke-width", function(d){ return self.width_s(d.value); })
        .attr("stroke", function(d){ return self.edgeColor(d); })
        .attr("stroke-opacity", 0.6)
        .attr("fill", "none")
        .attr("marker-end", function(d, i){ return self.directed? "url(#arrow-"+i+")" : "none"; });

    /* abstract nodes. to further appened visual attributes. */
    this.nodes
      .enter().append("svg:g")
        .attr("class", "node")
        .call(this.force.drag);

    /* nodes fill color. */
    this.nodes.append("svg:circle")
        .attr("r", function(d){ return self.size_s(d.size); })
        .attr("fill", function(d){ return self.nodeFill(d); })
        .attr("opacity", 0.8);

    /* node labels. */
    this.nodes.append("svg:text")
        .attr("class", "name")
        .text(function(d) { return d.name; });

    /* value labels, shown when mouseover */
   this.nodes.append("svg:text")
        .attr("class", "value")
        .attr("text-anchor", "middle")
        .attr("dy", "-.3em")
        .attr("fill", "none")
        .text(function(d) { return d.size; });
    
    // Fade-in effect on load
    this.vis.style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    
    // Drag behavior
    // TODO: making edge type an option
    this.force.on("tick", function() {
      self.links.attr("d", function(d){ return self.drawEdge(d); });
      self.nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
  }
  
});;/* DECLARATION EXAMPLE
  data = 
  [{  benchmark: "100"
      content: []
      title: "Funnel Entries"
      total: "16,100"
      delay: 0
      x: 0
      y: 100
      y0: 0
    },
   {  benchmark: "96.91"
      content: ["97.27% of initial users"] //content is the text that appears in the arrows
      title: "Confirm" // title is the name of the funnel step
      total: "15,660" //total number of people in that step
      delay: 2.4 //delay time between last step and this step
      x: 1 //index
      y: "97.27" //percentage of total
      y0: 0
   },...
  ]

var selector = ... //id of div to render to

var chart = new FunnelColumnChart(selector, data, {
        space: 15 // spacing between bars
        , leftMargin: 10 // give it a larger leftMargin when you want the y-axis to be on the left-hand side
        , rightMargin: 50
        , topMargin: 25
        , name: 'title'
        , baseline: "bottom"
        , stacked: true // false: grouped bars; true: stacked bars (when there's one than one series)
        , fill: '#77c5d5'
        , numRules: 11 // number of rules to add, first rule is where the bars' baseline is
        , yaxis_position: "left" // position to place yaxis: "left", "right"
        , ynumTicks: 5 // number of ticks on the Y Axis
        , yAxisMargin: 30
        , show_labels: true
        , label_class: "arrow_box" //custom css styling allowed for arrows
        , percent: true //whether to display percentage 
        , unit: users //unit to put after (signup funnel had "users", recruiting had 'applicants')
        , benchmark: {
            enabled: true //whether to show benchmark marks
          , time: "12 weeks" //displays in legend box
        }
        , legend: { 
            enabled: true, 
            metricLabel: '' -- description for metric in legend
            benchmarkLabel: '' -- description for benchmark in legend
            position: left -- which side should the legend go?
          },
        , delay: { 
            enabled: true //display delay box
          , unit: 'day' // unit of the delay (days, weeks, etc)
          , average: averageDelay //give it an average delay or it will automatically average all delays in data
        }
       });

*/

var FunnelColumnChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup, all these can be overwritten by options
    this.height = this.height || 400;
    this.space = this.space || 20;
    this.leftMargin = this.leftMargin || 5;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 5; 
    
    this.baseline = this.baseline || "bottom"; // available values: "top", "bottom"
    this.stacked = this.stacked || false; // true: stacked bars; false: grouped bars


    // Delay Options
    if(this.delay) {
      this.delay.enabled = this.delay.enabled || false;
      this.delay.unit = this.delay.unit || '';  
      this.delay.average = this.delay.average || null;
    }
    
    // Set up rules, axis, ticks
    this.numRules = this.numRules || 1; // number of rules to add, first rule is where the bars' baseline is
    this.yaxis_position = this.yaxis_position || "left"; // position to place yaxis: "left", "right", "none"
    this.ynumTicks = this.ynumTicks || 10; // number of ticks on the Y Axis
    this.yAxisMargin = this.yAxisMargin || 30;
    this.show_labels = this.show_labels || false;
    this.label_position = this.label_position || "vertical";
    this.label_class = this.label_class || "";
    this.useTipsy = this.useTipsy || false;
    this.formatter = this.formatter || ".2f";

    this.unit = this.unit || "total";
    this.lineStrokeColor = this.lineStrokeColor || "#EBEBEB";
    this.lineStrokeWidth = this.lineStrokeWidth || 1.5;

    this.fill = this.fill || "#77c5d5";
    
    // Benchmark Options
    if(this.benchmark) {
      this.benchmark.enabled = this.benchmark.enabled || false;
      this.benchmark.fill = this.benchmark.fill || "#AA4643";
      this.benchmark.time = this.benchmark.time || "";
    }

    // Legend Options
    if(this.legend) {
      this.legend.enabled = this.legend.enabled || false; 
      this.legend.position = this.legend.position || "right";
    }

    // Reformat data for charting (and labeling)
    this.series = this.series || $.map(data.values, function(values, key){ return [key]; })
    data.values = d3.layout.stack()($.map(data.values, function(values, key){ return [values]; }));

    var division = data.values[0].length > 4 ? data.values[0].length : data.values[0].length + 0.5;
    this.barWidth = $(window).width()/division - 2*this.space;
    if(this.barWidth < 0) console.log("'space' option is too large for the number of bars given!");

    this.arrowHeight = 20 + 35 * (data.values[0][1].content.length+1);

    this.arrowWidth = self.barWidth + this.space/2;


    // Override width based on spacing between bars and width of bar/arrows
    this.bottomMargin = this.arrowHeight + this.bottomMargin || this.arrowHeight;
    this.width = data.values[0].length * (this.barWidth + self.space) + this.leftMargin + this.rightMargin + this.yAxisMargin;
    
    this.max = this.max || d3.max($.map(data.values, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(data.values, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));


    this.vScale = this.vScale || d3.scale.linear()
      .domain([(self.min < 0 ? self.min : 0), self.max])
      .range([self.height - self.topMargin - self.bottomMargin, 0]);

  
    /*********
      Y-AXIS
    **********/
    this.yAxis = d3.svg.axis().scale(this.vScale).ticks(this.ynumTicks).tickFormat(
        function(d) {
          var wholeNumber = d3.format(",0d");
          if (d == 0) { return 0 + "%"; }
          if (d > 1) { return wholeNumber(d) + "%"; }
          if (d >= 0.01) { return n.toPrecision(2) + "%"; }
          return parseFloat(n.toPrecision(2)).toExponential() + "%";
        }
    ).orient(this.yaxis_position);

    /******************
      GROUPED REPORTS
    *******************/
    var div = document.createElement('div');
    div.setAttribute('margin-right', self.rightMargin);

    /*********
      LEGEND
    **********/
    if(self.legend && self.legend.enabled) {
      var legend = '<div style="vertical-align:top;background-color:white;border-radius:10px;float:' + self.legend.position + ';border-color:#EDEDED;border-style:solid;padding:17px;"><table>';
      
      if(self.benchmark && self.benchmark.enabled) {
        var benchmarkPath = '<svg style="height:15px"><g><line x1=0 x2=35 y1=5 y2=5 style="stroke:' + self.benchmark.fill + ';stroke-width:2;"></line>'
        + '<path d="m14 5 l4 4 l4 -4 l-4 -4 Z" style="fill:' + self.benchmark.fill + '"></path></g></svg>'; 
        legend += '<tr><td style="width:40px">' + benchmarkPath + '</td>';
        if(self.legend.benchmarkLabel)
          legend += '<td style="padding-right:15px;color:' + self.benchmark.fill + '">' + self.legend.benchmarkLabel + '</td>';
        else 
          legend += '<td style="padding-right:15px;color:' + self.benchmark.fill + '">' + self.legend.benchmarkLabel + '</td>';
      }
      
      legend += '<td style="width:35px"><svg width=25 height=25><rect x=15 y=3 width=10 height=20 fill=' + self.fill + ' style="fill:' + self.fill + '"></rect><rect x=5 y=15 width=10 height=8 fill=' + self.fill + ' style="fill:' + self.fill + '"></rect></svg></td>' ;
      if(self.legend.metricLabel) 
        legend += '<td style="color:' + self.fill + '" >' + self.legend.metricLabel + '</td>';
      else 
        legend += '<td style="color:' + self.fill + '" >' + self.name + '</td>';
      legend += '</tr></table></div>';

      $(div).append(legend);
    }

    /**************
      DELAY REPORT
    ***************/
    if(self.delay && self.delay.enabled) {
      if(!self.delay.average) {
        var average = 0, has = 0;
        for(var i=0; i < (data.values[0]).length; i++) {
          if(data.values[0][i].delay && data.values[0][i].delay != 0) { 
            average += new Number(data.values[0][i].delay);
            has++;
          }
        }
        average = average != 0 ? (average/has).toFixed(2) : 'N/A';
      }
      else average = self.delay.average.toFixed(2);
      var delayReport = '<div style="vertical-align:top;background-color:#EDEDED;border-radius:10px;float:right;margin-right:15px;padding:12px;color:#4D4D4D">Average delay time between steps: <br /> <h1 style="color:#757575">' + average + ' ' + self.delay.unit + 's </h1></div>';
      $(div).append(delayReport);
    }

    if($(div).children().length > 0) 
      $(selector).append(div);


    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height + this.arrowHeight);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + (this.yaxis_position === 'left'? this.yAxisMargin+this.leftMargin : this.leftMargin) + ", "+ this.topMargin + ")");


    // Add rules
    if(this.numRules > 0) {
      this.g.selectAll("line.rule")
          .data(function() {
            var rules = self.vScale.ticks(self.numRules);
            return rules.slice(0,self.numRules);
          })
        .enter().append("svg:line")
          .attr("class", function(d, i){ return i>0? "rule" : "rule_first"})
          .attr("y1", this.vScale)
          .attr("y2", this.vScale)
          .attr("x1", 0)
          .attr("x2", this.width - this.space - 65)
          .attr("style", "stroke-width:" + self.lineStrokeWidth + ";stroke:" + self.lineStrokeColor);
    }

    // Draw chart
    $.each(data.values, function(key, values) {
      self.addBar(key, values, selector);
    })

    // Add Y Axis
    if(this.yaxis_position !== 'none') {
      this.g.append("svg:g")
          .attr("class", "y axis")
          .call(this.yAxis);
    }
  }
  
  , addBar: function(key, values, selector) {
    self = this;
    var groups = this.g.selectAll("rect." + "series_" + key).data(values)
      .enter().append("svg:g");

    /*********
      BARS
    **********/
    var bars = groups.append("svg:rect")
      .attr("class", function() { return "series_" + key; })
      .attr("x", function(d, i) {return i*self.barWidth + (i+1)*self.space})
      .attr("width", self.barWidth)
      .style("fill", self.fill)
      .attr("height", function(d, idx) {
        var first = values[0].y; 
        return self.vScale(0) - self.vScale(first); 
      })
      .transition().duration(function(d, idx) {
          return idx * 250;
        })
      .attr("height", function(d, idx) { 
        return self.vScale(0) - self.vScale(d.y); 
      })
      .attr("y", function(d) { 
        return self.vScale( self.stacked? (d.y0+d.y) : d.y ); 
      });
      
    /*************
      BENCHMARKS
    **************/
    if(self.benchmark && self.benchmark.enabled) {
      var benchmarks = groups.append("svg:line")
        .attr("x1", function(d, i) {return (i+.5)*self.barWidth + (i+1)*self.space})
        .attr("x2", function(d, i) {return (i+.5)*self.barWidth + (i+1)*self.space})
        .attr("y1", function(d) { 
          return self.vScale( d.benchmark ); 
        })
        .attr("y2", function(d) { 
          return self.vScale( d.benchmark ); 
        })
        .style("stroke", self.benchmark.fill)
        .attr("stroke-width", 2)
        .transition().duration(function(d, idx) {
          return (idx+1) * 250;
        })
        .attr("x1", function(d, i) {return (i+0.25)*self.barWidth + (i+1)*self.space})
        .attr("x2", function(d, i) {return (i+0.75)*self.barWidth + (i+1)*self.space});

      groups.append("svg:path")
        .attr("d", function(d, i) {
          var x = (i+0.5)*self.barWidth + (i+1)*self.space;
          var y = self.vScale( d.benchmark );
          return "m" + (x-5) + " " + y + " l5 5 l5 -5 l-5 -5 Z";
        })
        .style("fill", self.benchmark.fill)
        .attr("opacity", 0.0)
        .transition().duration(function(d, idx) {
          return idx * 250;
        })
        .attr("opacity", 1.0);  
    }

    /***********
      ARROWS
    ************/
    var x_indent = self.space;
    var y_indent = this.arrowHeight/(values[1].content.length + 2);
    var arrow_extend = "-" + self.space/3 + " -" + self.space/3;

    var arrowGroups = groups.append("svg:g").attr("transform", function(d,i) {
      var x = i*self.barWidth + (i+1)*self.space;
      var y = self.vScale(d.y0) + 25;
      return "translate(" + x + ", " + y + ")";
    });

    arrowGroups.attr("opacity", 0.0)
    .transition().duration(function(d, idx) {
      return idx * 350;
    })
    .attr("opacity", 1.0);


    arrowGroups.append("svg:path")
      .attr("d", function(d, i) {
        var p = "m"  + arrow_extend + " h" + self.arrowWidth + "l" + self.space/2 + " " 
          + self.arrowHeight/2 + "  l-" + self.space/2 + " " + self.arrowHeight/2 + "  h-" + self.arrowWidth;
        if(i === 0) //if first arrow, cutoff end
          return p += "L" + arrow_extend + " Z";
        else if(i === values.length - 1) //if last
          return "m" + arrow_extend + " h" + (self.arrowWidth + self.space/2) + "v" + self.arrowHeight +  " h-" + (self.arrowWidth + self.space/2)
            + " l" + self.space/2 + " -" + self.arrowHeight/2 + "  L" + arrow_extend + " Z" ;
        return p += " l" + self.space/2 + " -" + self.arrowHeight/2 + "  L" + arrow_extend + " Z"; //if any other, make arrow
      })
      .style("stroke", self.fill)
      .attr("stroke-width", 3)
      .style("fill", "#EDF7FF");

    var text = arrowGroups.append("svg:text").attr("y", y_indent);
    
    text.append("svg:tspan")
      .attr("x", x_indent)
      .attr("font-weight", "bold")
      .attr("font-size", 15)
      .text(function(d) { return d.title;});

    text.selectAll("text").data(function(d, i) { return d.content }).enter().append("svg:tspan")
      .attr("x", x_indent)
      .attr("dy", 25)
      .attr("font-size", 13)
      .text(function(s) {return s});

    /***********
      TOOLTIPS
    ************/

    groups.on("mouseover", function(d, i) {
      $($($(this).children()[3]).children()[0]).css("stroke", "#696969");
      $($(this).children()[0]).css("stroke-width", 3);
      $($(this).children()[0]).css("stroke", "#696969");
      
      var j = i > groups[0].length/2 ? i : i+1;

      var x = (j)*(self.barWidth) + (j+1)*self.space + self.leftMargin + self.yAxisMargin;
      if(i > groups[0].length/2) x -= (self.barWidth + 2*self.space);

      var y = self.height - self.vScale(d.y) + self.arrowHeight;
      var style = '-o-transform:translate(' + x + 'px, -' + y + 'px);-webkit-transform:translate(' + x + 'px, -' + y + 'px);-ms-transform:translate(' + x + 'px, -' + y + 'px);width:' + (self.barWidth - self.space/2) + 'px;-moz-transform:translate(' + x + 'px, -' + y + 'px)';

      var content = '<h3 style="color:black">' + d.title + '</h3><div style="margin-left:20px"><p><h4 style="display:inline">' + d.total + '</h4>  ' + self.unit + '</p>';

      if(i > 0) { 
        content += '<p><h4 style="display:inline">' + d.y + '</h4>% of initial ' + self.unit + '</p>';
        if(d.delay) {
          content += '<p style="display:inline">Averaged <h4 style="display:inline">' + d.delay + ' ' + self.delay.unit + '</h4> delay between this and the last step</p>';
        }
        if(d.benchmark) {
          content += '<p style="color:' + self.benchmark.fill + ';display:inline"> Has been <br /> </p> <h4 style="color:' + self.benchmark.fill + ';display:inline">' + d.benchmark 
          + '%</h4> <p style="color:' + self.benchmark.fill + ';display:inline"> the last ' + self.benchmark.time + ' (benchmark) </p></div>';
          if(d.benchdelay) {
            content += '<p style="color:' + self.benchmark.fill + 'display:inline">Averaged <h4 style="color:' + self.benchmark.fill + 'display:inline">' + d.delay + '</h4> delay between this and the last step in the last ' + self.benchmark.time + '(benchmark delay)</p>';
        }
        }
      }



      var tooltip = '<div id="tooltip" style="' + style + '">' + content + '</div>';  
      $(selector).append(tooltip);

      if(i > groups[0].length/2) {
        $("#tooltip").addClass("afterarrow");
      } else {
        $("#tooltip").addClass("beforearrow")
      }


    });

    groups.on("mouseout", function(d, i) {
      $($($(this).children()[3]).children()[0]).css("stroke", self.fill);
      $($(this).children()[0]).css("stroke-width", 0);
      $($(this).children()[0]).css("stroke", "none");
      $("#tooltip").remove();
    }); 
  }

});
;/*
var data = [
  {"id":1, "param":{"code":"2001"},
    "values":[
    {"end_time":"2012/02/07 17:57:57","state":"succeeded","start_time":"2012/02/07 17:57:36"},
    {"end_time":"2012/02/07 20:03:21","state":"succeeded","start_time":"2012/02/07 20:03:16"},
    {"end_time":"2012/02/08 08:04:43","state":"succeeded","start_time":"2012/02/08 08:04:30"}],
    "label":"group-a"
  },

  {"id":2, "param":{"code":"2001"},
    "values":[
    {"end_time":"2012/02/07 17:57:56","state":"succeeded","start_time":"2012/02/07 17:57:35"},
    {"end_time":"2012/02/07 18:02:33","state":"succeeded","start_time":"2012/02/07 18:02:28"},
    {"end_time":"2012/02/07 19:02:41","state":"succeeded","start_time":"2012/02/07 19:02:31"},
    {"end_time":"2012/02/07 20:02:37","state":"succeeded","start_time":"2012/02/07 20:02:29"},
    {"end_time":"2012/02/07 21:02:33","state":"succeeded","start_time":"2012/02/07 21:02:25"},
    {"end_time":"2012/02/07 22:02:30","state":"succeeded","start_time":"2012/02/07 22:02:27"},
    {"end_time":"2012/02/07 23:02:28","state":"succeeded","start_time":"2012/02/07 23:02:25"},
    {"end_time":"2012/02/08 00:02:36","state":"succeeded","start_time":"2012/02/08 00:02:29"},
    {"end_time":"2012/02/08 01:02:29","state":"failed","start_time":"2012/02/08 01:02:26"},
    {"end_time":"2012/02/08 02:02:28","state":"succeeded","start_time":"2012/02/08 02:02:25"},
    {"end_time":"2012/02/08 03:02:25","state":"succeeded","start_time":"2012/02/08 03:02:22"},
    {"end_time":"2012/02/08 04:02:27","state":"succeeded","start_time":"2012/02/08 04:02:24"},
    {"end_time":"2012/02/08 05:02:30","state":"succeeded","start_time":"2012/02/08 05:02:27"},
    {"end_time":"2012/02/08 06:02:30","state":"succeeded","start_time":"2012/02/08 06:02:27"},
    {"end_time":"2012/02/08 07:02:34","state":"succeeded","start_time":"2012/02/08 07:02:29"},
    {"end_time":"2012/02/08 08:02:22","state":"succeeded","start_time":"2012/02/08 08:02:19"},
    {"end_time":"2012/02/08 09:02:28","state":"running","start_time":"2012/02/08 09:02:25"}],
    "label":"group-b"
  },

  {"id":3, "param":{"code":"2007"},
    "values":[
    {"end_time":"2012/02/07 17:57:34","state":"succeeded","start_time":"2012/02/07 17:57:24"},
    {"end_time":"2012/02/07 18:02:30","state":"succeeded","start_time":"2012/02/07 18:02:23"},
    {"end_time":"2012/02/07 19:02:40","state":"succeeded","start_time":"2012/02/07 19:02:28"},
    {"end_time":"2012/02/07 20:02:26","state":"succeeded","start_time":"2012/02/07 20:02:22"},
    {"end_time":"2012/02/07 21:02:33","state":"succeeded","start_time":"2012/02/07 21:02:26"},
    {"end_time":"2012/02/07 22:02:39","state":"succeeded","start_time":"2012/02/07 22:02:31"},
    {"end_time":"2012/02/07 23:02:31","state":"succeeded","start_time":"2012/02/07 23:02:27"},
    {"end_time":"2012/02/08 00:02:33","state":"failed","start_time":"2012/02/08 00:02:27"},
    {"end_time":"2012/02/08 01:02:28","state":"succeeded","start_time":"2012/02/08 01:02:24"},
    {"end_time":"2012/02/08 02:02:31","state":"succeeded","start_time":"2012/02/08 02:02:27"},
    {"end_time":"2012/02/08 03:02:29","state":"succeeded","start_time":"2012/02/08 03:02:26"},
    {"end_time":"2012/02/08 04:02:28","state":"succeeded","start_time":"2012/02/08 04:02:24"},
    {"end_time":"2012/02/08 05:02:35","state":"succeeded","start_time":"2012/02/08 05:02:30"},
    {"end_time":"2012/02/08 06:02:29","state":"succeeded","start_time":"2012/02/08 06:02:26"},
    {"end_time":"2012/02/08 07:02:34","state":"succeeded","start_time":"2012/02/08 07:02:30"},
    {"end_time":"2012/02/08 08:02:28","state":"succeeded","start_time":"2012/02/08 08:02:23"},
    {"end_time":"2012/02/08 09:02:28","state":"running","start_time":"2012/02/08 09:02:25"}],
    "label":"group-c"
  },

  { "id": 4, "param":{"code":"2001"},
    "values":[
    {"end_time":"2012/02/07 10:01:24","state":"succeeded","start_time":"2012/02/07 10:01:21"},
    {"end_time":"2012/02/07 11:01:33","state":"succeeded","start_time":"2012/02/07 11:01:29"},
    {"end_time":"2012/02/07 12:01:33","state":"succeeded","start_time":"2012/02/07 12:01:30"},
    {"end_time":"2012/02/07 13:01:35","state":"succeeded","start_time":"2012/02/07 13:01:32"},
    {"end_time":"2012/02/07 14:01:32","state":"failed","start_time":"2012/02/07 14:01:29"},
    {"end_time":"2012/02/07 15:01:33","state":"failed","start_time":"2012/02/07 15:01:29"},
    {"end_time":"2012/02/07 16:01:39","state":"failed","start_time":"2012/02/07 16:01:35"},
    {"end_time":"2012/02/07 17:01:32","state":"succeeded","start_time":"2012/02/07 17:01:29"},
    {"end_time":"2012/02/07 18:01:38","state":"succeeded","start_time":"2012/02/07 18:01:31"},
    {"end_time":"2012/02/07 19:01:50","state":"succeeded","start_time":"2012/02/07 19:01:35"},
    {"end_time":"2012/02/07 20:01:37","state":"succeeded","start_time":"2012/02/07 20:01:29"},
    {"end_time":"2012/02/07 21:01:36","state":"succeeded","start_time":"2012/02/07 21:01:32"},
    {"end_time":"2012/02/07 22:01:37","state":"succeeded","start_time":"2012/02/07 22:01:33"}],
    "label":"group-d"
  }
];
*/

var GanttChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup
    this.width = this.width || 1000;
    this.leftMargin = this.leftMargin || 10;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 10;
    this.bottomMargin = this.bottomMargin || 10;
    this.barHeight = this.barHeight || 20;
    this.height = this.height || data.length * (this.bottomMargin + this.barHeight) + this.topMargin + 100;
    this.formatter = this.formatter || ".2f";
    this.xNumTicks = this.xNumTicks || 24;
    this.rowBackground = this.rowBackground || "#666";
    
    // TODO: find out the xScale in case it's not specified
    // this.startX = this.startX || ...;
    // this.endX = this.endX || ...;
    // this.xScale = this.xScale || ;
    
    this.hover_idx = -1;
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "gantt_chart")
        .attr("width", this.width)
        .attr("height", this.height);
        
    // Draw bar series
    $.each(data, function(key, value){
      self.addSeries(key, value);
    })
    
    // Draw top axis with ticks
    this.topAxis = this.topAxis || d3.svg.axis().scale(this.xScale).ticks(this.xNumTicks).orient('bottom');
    this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + this.leftMargin + ", " + this.topMargin/2 + ")")
        .call(this.topAxis);
    
    // Draw bottom axis with ticks
    this.bottomAxis = this.bottomAxis || d3.svg.axis().scale(this.xScale).ticks(this.xNumTicks).orient('top');
    this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + this.leftMargin + ", " + (this.height - 2) + ")")
        .call(this.bottomAxis);
    
    // Tipsy style mouseover
    $(selector+' rect.series').tipsy({
      gravity: 'e',
      html: true,
      title: function() {
        var d = this.__data__;
        return d.label || (self.label && self.label(d)) || null; 
      }
    });
  }
  
  , addSeries: function(key, value){
    var self = this;
    
    // The container
    var g = this.vis
        .append("svg:g")
        .attr("class", "series " + value.id)
        .attr("transform", "translate(" + this.leftMargin + ", " + (this.topMargin + parseInt(key) * (this.barHeight)) +")");
    
    g.append("svg:rect")
        .attr("class", "row")
        .attr("id", "row-" + key)
        .attr("x", -this.leftMargin)
        .attr("y", 0)
        .attr("width", this.width - this.rightMargin)
        .attr("height", this.barHeight)
        .attr("fill", key%2 == 0? this.rowBackground : "none")
        .attr("fill-opacity", 0.2);
    
    // Draw bars with links: <a><rect></rect></a>
    var ahrefs = g.selectAll("a.bar-href")
        .data(value.values)
      .enter().append("a")
        .attr("xlink:href", function(d){ return d.tipLink; })
        .attr("class", "bar-href");
    
    ahrefs.append("svg:rect")
        .attr("class", function(d, i){ return "series " + d.state; })
        .attr("x", function(d, i){ return self.xScale(self.xTransform(d.start_time)); })
        .attr("y", 0)
        .attr("width", function(d, i){
          return self.xScale(self.xTransform(d.end_time)) - self.xScale(self.xTransform(d.start_time)) + 8;
        })
        .attr("height", this.barHeight)
        .attr("fill", this.fill && this.fill(value.id) || "none")
        .on("mouseover", function(d, i){ return self.mouseover(value.id, i); })
        .on("mouseout",  function(d, i){ return self.mouseout(value.id, i); });
    
    // Highlight Execution start and end times on mouseover
    g.selectAll("line.start")
       .data(value.values)
     .enter().append("svg:line")
       .attr("transform", "translate(0, -" + (this.topMargin + parseInt(key) * (this.barHeight)) +")")
       .attr("class", "highlight")
       .attr("id", function(d, i){ return "start" + value.id + "_" + i; })
       .attr("x1", function(d, i){ return self.xScale(self.xTransform(d.start_time)); })
       .attr("x2", function(d, i){ return self.xScale(self.xTransform(d.start_time)); })
       .attr("y1", this.topMargin / 2)
       .attr("y2", this.height - 2)
       .attr("stroke", "none");

    g.selectAll("line.end")
       .data(value.values)
     .enter().append("svg:line")
       .attr("transform", "translate(0, -" + (this.topMargin + parseInt(key) * (this.barHeight)) +")")
       .attr("class", "highlight")
       .attr("id", function(d, i){ return "end" + value.id + "_" + i; })
       .attr("x1", function(d, i){ return self.xScale(self.xTransform(d.end_time)) + 8 })
       .attr("x2", function(d, i){ return self.xScale(self.xTransform(d.end_time)) + 8 })
       .attr("y1", this.topMargin / 2)
       .attr("y2", this.height - 2)
       .attr("stroke", "none");
    
    // Draw baseline
    g.append("svg:line")
        .attr("class", "baseline")
        .attr("y1", this.barHeight - 1)
        .attr("y2", this.barHeight - 1)
        .attr("x1", 0)
        .attr("x2", this.width - this.leftMargin - this.rightMargin);
    
    // Draw labels
    var lcontainer = this.vis
        .append("svg:g")
        .attr("class", "labels")
        .attr("transform", "translate(0, " + (this.topMargin + parseInt(key) * this.barHeight) + ")");
    
    // construct <text><a><tspan></tspan></a>
    var label = lcontainer.append("svg:text")
        .attr("class", "title")
        .attr("transform", "translate(0, " + this.topMargin/2 + ")")
        .attr("text-anchor", "start");
    label.append("a")
        .attr("xlink:href", value.titleLink);
    label.selectAll("a")
        .append("svg:tspan")
        .text(function(){ return value.label; });
  }
  
  // Hover over bar to highlight start and end
  , mouseover: function(key, i) {
    this.hover_idx = i;
    
    this.vis.select("line#start" + key + "_" + i)
      .attr("stroke", "#666");
    this.vis.select("line#end" + key + "_" + i)
      .attr("stroke", "#666");
    
    this.hover_idx = -1;
  }
  
  // And hide highlight lines when mouseout
  , mouseout: function(key, i) {
    this.hover_idx = i;
    
    this.vis.select("line#start" + key + "_" + i)
      .attr("stroke", "none");
    this.vis.select("line#end" + key + "_" + i)
      .attr("stroke", "none");
    
    this.hover_idx = -1;
  }

});
;/*
data = {
  var1: [{x: 1, y: 15}, {x: 2, y: 16}, ...],
  var2: [{x: 1, y: 15}, {x: 2, y: 16}, ...],
  var3: [{x: 1, y: 15}, {x: 2, y: 16}, ...],
  var4: [{x: 1, y: 15}, {x: 2, y: 16}, ...]
}
*/
var LineChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    this.stacked = this.stacked || false;
    var values = $.map(data, function(values, key){ return [values]; });
    if(values.length > 1) {
      data = d3.layout.stack()($.map(data, function(values, key){ return [values]; }));
    }
    
    // Setup, all these can be overwritten by options
    this.startX = this.startX || d3.min($.map(data, function(values){ return values[0].x; }));
    this.endX = this.endX || d3.max($.map(data, function(values){ return values[values.length-1].x; }));
    this.max = this.max || d3.max($.map(data, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(data, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    
    // Only support linear scales for the time being
    this.x = this.x || d3.scale.linear().domain([this.startX, this.endX]).range([0 + this.xLeftMargin, this.width - this.xLeftMargin - this.xRightMargin]);
    this.y = this.y || d3.scale.linear().domain([this.min<0? this.min:0, this.max]).range([0 + this.yMargin, this.height - this.yMargin]);
    this.yAxisScale = this.yAxisScale || d3.scale.linear().domain([this.min<0? this.min:0, this.max]).range([this.height - this.yMargin, 0 + this.yMargin]);
    this.xNumTicks = this.xNumTicks || 6;
    this.yNumTicks = this.yNumTicks || 4;
    this.fill = this.fill || d3.scale.category10();
    this.fillShades = this.fillShades || false;
    this.drawDots = this.drawDots || false;
    this.useTipsy = this.useTipsy || false;
    this.formatter = this.formatter || ",0d";
    
    if(!this.useTipsy){ // If not using Tipsy, default to the d3 version of mouseover events
      this.hover_idx = -1;
      this.dot_radius = this.dot_radius || 5;
    }
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "line_chart")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(0, " + this.height + ")");

    // Use this for adding lines
    this.line = this.line || d3.svg.line()
        .x(function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .y(function(d) { 
          return -1 * self.y(
            (self.yLineTransform && self.yLineTransform(self.stacked? (d.y + d.y0) : d.y)) || self.stacked? (d.y + d.y0) : d.y
          ); 
        });

    // Use this for adding areas
    this.area = this.area || d3.svg.area()
        .x(function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .y0(function(d) { return -1 * (self.stacked ? self.y(d.y0) : self.yMargin) })
        .y1(function(d) { 
          return -1 * self.y(
            (self.yLineTransform && self.yLineTransform(self.stacked? (d.y + d.y0) : d.y)) || self.stacked? (d.y + d.y0) : d.y
          ); 
        });
    
    // X Axis
    this.xAxis = this.xAxis || d3.svg.axis().scale(this.x).ticks(this.xNumTicks).orient('bottom');
    this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.height - this.yMargin) + ")")
        .call(this.xAxis);
    
    // Left Y axis
    this.yAxis = this.yAxis || d3.svg.axis().scale(this.yAxisScale).ticks(self.yNumTicks).tickFormat(
        function(n) {
            var wholeNumber = d3.format(",0d");
            if (n == 0) { return 0; }
            if (n > 1) { return wholeNumber(n); }
            if (n >= 0.01) { return n.toPrecision(2); }
            return parseFloat(n.toPrecision(2)).toExponential();
        }
    ).orient('left');
    this.vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + this.xLeftMargin + ", 0)")
        .call(this.yAxis);
    
    if(this.rightAxis) {
      this.rightAxis = this.rightAxis || d3.svg.axis().scale(
        d3.scale.linear().domain([0, self.max]).range([this.height - this.yMargin, 0 + this.yMargin])).ticks(this.yNumTicks).orient('right');
      this.vis.append("svg:g")
          .attr("class", "y axis right")
          .attr("transform", "translate(" + (this.width - this.xLeftMargin - this.xRightMargin) + ", 0)")
          .call(this.rightAxis);
    }
    
    // Add the lines, conditionally fill the area underneath
    $.each(data, function(key, values) {
      self.addLine(key, values);
      if(self.fillShades) { self.addArea(key, values); }
      if(self.drawDots) { 
        self.addDots(key, values); 
        if(!self.useTipsy) self.addLabels(key, values);
      }
    })
    
    if(this.useTipsy) {
      $(selector+' svg circle').tipsy({
        gravity: 'sw', 
        title: function() {
          var d = this.__data__;
          return d3.format(self.formatter)(d.y);
        }
      });
    }
  }

  , addLine: function(key, values) {
    this.g.append("svg:path")
        .attr("d", this.line(values))
        .attr("class", "line " + key)
        .attr("stroke", this.fill(key))
        .attr("fill", "none");
  }
  , addArea: function(key, values) {
    this.g.append("svg:path")
        .attr("class", "area " + key)
        .attr("d", this.area(values))
        .attr("fill", this.fill(key));
  }
  
  , addDots: function(key, values) {
    var self = this;
    this.g.selectAll("circle.series_" + key)
        .data(values)
      .enter().append("svg:circle")
        .attr("class", "series_" + key)
        .attr("cx", function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .attr("cy", function(d) { return -1 * self.y( (self.yLineTransform && self.yLineTransform(self.stacked? (d.y + d.y0) : d.y)) || self.stacked? (d.y + d.y0) : d.y );
        })
        .attr("r", this.dot_radius)
        .attr("fill", this.fill(key))
        .on("mouseover", function(d, i) { return self.mouseover(key, d, i); })
        .on("mouseout",  function(d, i) { return self.mouseout(key, d, i); });
  }
  
  , addLabels: function(key, values) {
    var self = this;
    this.g.selectAll("text.label_" + key)
        .data(values)
      .enter().append("svg:text")
        .attr("class", "label_" + key)
        .attr("transform", "translate(-"+ 2*this.dot_radius + ", -"+ 1.5*this.dot_radius +")")
        .attr("dx", function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .attr("dy", function(d) { 
          return -1 * self.y(
            (self.yLineTransform && self.yLineTransform(self.stacked? (d.y + d.y0) : d.y)) || self.stacked? (d.y + d.y0) : d.y
          );
        })
        .attr("fill", "none")
        .text(function(d) { return d3.format(self.formatter)(d.y); });
  }
  
  // Hover over bulletchart to view metric value
  , mouseover: function(key, d, i) {
    var self = this;
    this.hover_idx = i;
    this.g.selectAll("text.label_" + key)
      .attr("fill", function(d, i) { return i === self.hover_idx? self.fill(key) : "none"; })
      .attr("opacity", 0)
      .transition()
        .duration(200)
        .attr("opacity", 1);
    this.hover_idx = -1;
  }
  
  // And hide this value metric again when mouseout
  , mouseout: function(key, d, i) {
    this.g.selectAll("text.label_" + key)
        .attr("fill", "none")
  }
  
});
;/*
var data = { 
  series1: [ {"label":"Web", "value":76.16}, {"label":"Desktop", "value":16.81}, 
    {"label":"Mobile", "value":4.27}, {"label":"Other", "value":2.72}, {"label":"Windows Phone", "value":0.03} ],
  series2: [ {"label":"Web", "value":36.16}, {"label":"Desktop", "value":26.81}, 
    {"label":"Mobile", "value":14.27}, {"label":"Other", "value":2.72}, {"label":"Windows Phone", "value":10.03} ]
  };
*/

var PieChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup
    this.leftMargin = this.leftMargin || 10;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 10;
    this.bottomMargin = this.bottomMargin || 10;
    
    this.fill = this.fill || d3.scale.category10();
    this.innerRadiusRatio = this.innerRadiusRatio || 0;
    this.outerRadius = options.outerRadius || 200;
    this.arc = this.arc || d3.svg.arc().innerRadius(this.innerRadiusRatio * this.outerRadius).outerRadius(this.outerRadius);
    this.highlight = this.highlight || d3.svg.arc().innerRadius(this.outerRadius).outerRadius(this.outerRadius + 8);
    this.highlight_color = this.highlight_color || "#AEAEAE";
    this.formatter = this.formatter || ".2f";
    
    this.vis = d3.select(selector)
        .attr("class", "pie_chart");
    
    this.hover_idx = -1;
    
    // Get the keys for each PieChart in the small multiples
    var pies = $.map(data, function(values, key){ return [key]; })
    
    // Draw pies
    $.each(pies, function(i, d){
      var value = data[d];
      self.addPie(i, d, value);
      
      // Tipsy style mouseover
      $(selector+' path.slice').tipsy({
        gravity: 'sw', 
        title: function() {
          var d = this.__data__;
          var i = $.inArray(d.value, $.map(value, function(d){ return d.value; }));
          var labels = $.map(value, function(d){ return d.label; })
          return labels[i] + ": " + d3.format(self.formatter)(d.value);
        }
      });
    })
  }
  
  , addPie: function(i, key, value){
    var self = this;
    
    // The container
    var g = this.vis
        .append("svg:svg")
        .attr("class", "svg " + key)
        .attr("width", this.leftMargin + this.rightMargin + 2 * this.outerRadius)
        .attr("height", this.topMargin + this.bottomMargin + 2 * this.outerRadius)
        .append("svg:g")
        .attr("class", "pie " + key)
        .attr("transform", "translate(" + (this.leftMargin + this.outerRadius) + ", " + (this.topMargin + this.outerRadius) + ")");
    
    // Draw each slice
    g.selectAll("path.slice")
        .data(function() { var data = $.map(value, function(d){ return d.value; }); return d3.layout.pie()(data); })
      .enter().append("svg:path")
        .attr("class", "slice")
        .attr("d", this.arc)
        .attr("fill", function(d, i){ return self.fill(i); })
        .on("mouseover", function(d, i){
          self.hover_idx = i;
          g.selectAll("path.highlight")
              .attr("fill", function(d, i){ return self.hover_idx == i? self.highlight_color : "none"; });
          self.idx = -1;
        })
        .on("mouseout", function(){
          g.selectAll("path.highlight")
              .attr("fill", "none");
        });
    
    // Draw highlights
    g.selectAll("path.highlight")
        .data(function() { var data = $.map(value, function(d){ return d.value; }); return d3.layout.pie()(data); })
      .enter().append("svg:path")
        .attr("class", "highlight")
        .attr("d", this.highlight)
        .attr("fill", "none");
    
    // Place labels
    g.selectAll("text.label")
        .data(function() { var data = $.map(value, function(d){ return d.value; }); return d3.layout.pie()(data); })
      .enter().append("svg:text")
        .attr("class", "label")
        .attr("transform", function(d) { return "translate(" + self.arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("display", function(d) { return (d.endAngle - d.startAngle) > Math.PI/6 ? null : "none"; })
        .text(function(d, i) { return d.value; });
  }
});
;/* 
  var data = {
    series1: [
      {time_id: "2012-02-01 00:05", y: 125.38, state: "succeeded"},
      {time_id: "2012-02-01 01:05", y: 119.23, state: "succeeded"},
      {time_id: "2012-02-01 02:05", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 03:05", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 04:05", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 05:05", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 06:05", y: 67.12, state: "running"} ]
  };
*/

var SparkBar = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup, all these can be overwritten by options
    this.height = this.height || 80;
    this.space = this.space || 5;
    this.leftMargin = this.leftMargin || 5;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 5;
    this.bottomMargin = this.bottomMargin || 5;
    this.barWidth = this.barWidth || 5; // sets the width of each bar
    this.minBarHeight = this.minBarHeight || 10;
    
    this.baseline = this.baseline || "bottom"; // available values: "top", "bottom"
    this.stacked = this.stacked || false; // true: stacked bars; false: grouped bars
    this.drawBaseline = this.drawBaseline || false;
    
    this.addLinks = this.addLinks || false;
    
    // Set up rules, axis, ticks
    this.useTipsy = this.useTipsy || false;
    this.formatter = this.formatter || ".2f";
    
    this.series = this.series || $.map(data, function(values, key){ return [key]; });
    this.values = $.map(data, function(values, key){ return [values]; })
    
    // Create stacked sparkline series if necessary
    this.stacked = this.stacked || false;
    if(this.stacked) {
      this.values = d3.layout.stack()($.map(data, function(values, key){ return [values]; }));
    }
    
    // Override width based on spacing between bars and width of bar given
    this.width = (this.values[0].length - 1) * this.space + 
      (this.stacked ? 1 : this.series.length) * this.values[0].length * this.barWidth + this.leftMargin + this.rightMargin;
    this.max = this.max || d3.max($.map(this.values, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(this.values, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
        
    // Bars extend vertically in SparkBar
    if(self.baseline === 'top') {
      this.vScale = this.vScale || d3.scale.linear()
        .domain([0, self.max])
        .range([self.topMargin, self.height - self.topMargin - self.bottomMargin - self.minBarHeight]);
    } else {
      this.vScale = this.vScale || d3.scale.linear()
        .domain([0, self.max])
        .range([self.height - self.topMargin - self.bottomMargin - self.minBarHeight, self.bottomMargin]);
    }
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "spark_bar")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + (this.yaxis_position === 'left'? this.yAxisMargin+this.leftMargin : this.leftMargin) + ", "+ this.minBarHeight + ")");
    
    // Draw chart
    $.each(this.values, function(key, values) {
      if(self.addLinks) {
        self.addBarWithLink(key, values);
      } else{
        self.addBar(key, values);
      }
    })
    
    // Draw Baseline
    if(this.drawBaseline) {
      this.vis
          .append("svg:line")
          .attr("class", "rule_first")
          .attr("y1", this.height - 1)
          .attr("y2", this.height - 1)
          .attr("x1", this.leftMargin)
          .attr("x2", this.width - this.rightMargin);
    }
    
    
    if(this.useTipsy) {
      $(selector + ' rect').tipsy({
        html: true,
        gravity: this.baseline == 'bottom'? 'sw':'ne', 
        title: function() {
          var d = this.__data__;
          return d.label || (self.label && self.label(d)) || null;
        }
      });
    }
  }
  
  , addBarWithLink: function(key, values) {
    self = this;
        
    var ahrefs = this.g.selectAll("a.bar-href")
        .data(values)
      .enter().append("a")
        .attr("xlink:href", function(d){ return (self.linkPrefix || '') + d.xlink; })
        .attr("class", "bar-href");
    
    ahrefs.append("svg:rect")
        .data(values)
        .attr("class", function(d){ return "series_" + key + " " + d.state; })
        .attr("y", function(d) { 
          if(self.baseline === 'top') { return self.vScale( self.stacked? d.y0 : 0); }
          else { return self.vScale( self.stacked? (d.y0+d.y) : d.y ); }
        })
        .attr("x", function(d, i) { 
          return (self.stacked? 0 : parseInt(key) * self.barWidth) + i * ((self.stacked ? 1 : self.series.length)*self.barWidth + self.space); 
        })
        .attr("width", self.barWidth)
        .attr("height", function(d) { 
          if(self.baseline === 'top') { return self.vScale(d.y) + self.minBarHeight; }
          else { return self.vScale(0) - self.vScale(d.y) + self.minBarHeight; }
        })
        .attr("fill", function(d, i) { return self.fill? self.fill("bar_" + key + "_" + i) : null; });
  }
  
  , addBar: function(key, values) {
    self = this;
    this.g.selectAll("rect." + "series_")
        .data(values)
      .enter().append("svg:rect")
        .attr("class", function(d) { return "series_" + key + " " + d.state; })
        .attr("y", function(d) { 
          if(self.baseline === 'top') { return self.vScale( self.stacked? d.y0 : 0); }
          else { return self.vScale( self.stacked? (d.y0+d.y) : d.y ); }
        })
        .attr("x", function(d, i) { 
          return (self.stacked? 0 : parseInt(key) * self.barWidth) + i * ((self.stacked ? 1 : self.series.length)*self.barWidth + self.space); 
        })
        .attr("width", self.barWidth)
        .attr("height", function(d) { 
          if(self.baseline === 'top') { return self.vScale(d.y) + self.minBarHeight; }
          else { return self.vScale(0) - self.vScale(d.y) + self.minBarHeight; }
        })
        .attr("fill", function(d, i) { return self.fill? self.fill("bar_" + key + "_" + i) : "none" });
  }
});
;/*
data = {
  series1: [{x: 0, y: 12}, {x:1, y:2}, {x:2, y:13}, ...],
  series2: [{x: 0, y: 21}, {x:1, y:32}, {x:2, y:2}, ...],
  ...
}
*/
var SparkLine = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Create stacked sparkline series if necessary
    this.stacked = this.stacked || false;
    if(this.stacked) {
      data = d3.layout.stack()($.map(data, function(values, key){ return [values]; }));
    }
        
    // Setup, all these can be overwritten by options
    this.startX = this.startX || d3.min($.map(data, function(values){ return values[0].x; }));
    this.endX = this.endX || d3.max($.map(data, function(values){ return values[values.length-1].x; }));
    this.max = this.max || d3.max($.map(data, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(data, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return self.stacked? (values.y0 + values.y) : values.y; 
      })) 
    }));    

    // Options for dots, labels, and fill
    this.usedots = this.usedots || true;
    this.uselabels = this.uselabels || true;
    this.fillShades = this.fillShades || false;
    
    // Set up scale functions, and margins are taken care of
    this.x = this.x || d3.scale.linear().domain([this.startX, this.endX]).range([0 + this.xLeftMargin, this.width - this.xLeftMargin - this.xRightMargin]);
    this.y = this.y || d3.scale.linear().domain([self.min, self.max]).range([0 + this.yMargin, this.height - this.yMargin]);
    
    // Axes setup
    this.yAxisScale = this.yAxisScale || d3.scale.linear().domain([self.min>0 ? 0:self.min, self.max]).range([this.height - this.yMargin, 0 + this.yMargin]);
    this.fill = this.fill || d3.scale.category10();
    this.dot_radius = this.dot_radius || 3;
    this.dot_xOffset = this.dot_xOffset || this.width/8;
    
    // Background fill color
    this.background_color = this.background_color || "#fff";

    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("background-color", this.background_color);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(0, " + this.height + ")");;

    // Use this for adding lines
    this.line = this.line || d3.svg.line()
        .x(function(d) { return self.x(d.x); })
        .y(function(d) { 
          return -1 * self.y(
            (self.yLineTransform && self.yLineTransform(this.stacked? (d.y + d.y0) : d.y)) || this.stacked? (d.y + d.y0) : d.y
          ); 
        });

    // Use this for adding areas
    this.area = this.area || d3.svg.area()
        .x(function(d) { return self.x(d.x); })
        .y0(function(d) { return -1 * (self.stacked ? self.y(d.y0) : self.yMargin) })
        .y1(function(d) { 
          return -1 * self.y(
            (self.yLineTransform && self.yLineTransform(this.stacked? (d.y + d.y0) : d.y)) || this.stacked? (d.y + d.y0) : d.y
          ); 
        });

    // Add the lines and trailing dot to highlight latest sample point
    $.each(data, function(key, values) {
      self.addLine(key, values);
      if (this.usedots) {
        self.addDot(key, values);
      }
      if (this.uselabels) {
        self.addLabel(key, values);
      }
      if(self.fillShades) { self.addArea(key, values); }
    })
  }

  , addLine: function(key, values) {
    this.g.append("svg:path")
      .attr("d", this.line(values))
      .attr("class", "sparkline " + key)
      .attr("stroke", this.fill(key))
      .attr("fill", "none");
  }
  
  , addDot: function(key, values) {
    this.g.append("svg:circle")
      .attr("class", "sparkline_dot")
      .attr("cx", this.x(values[values.length-1].x))
      .attr("cy", -1 * this.y(values[values.length-1].y))
      .attr("r", this.dot_radius)
      .attr("stroke", "none")
      .attr("fill", this.fill(key));
  }
  
  , addLabel: function(key, values) {
    this.g.append("svg:text")
      .attr("class", "latest_value")
      .attr("x", this.x(values[values.length-1].x))
      .attr("y", -1 * this.y(values[values.length-1].y))
      .attr("dx", -1 * this.dot_xOffset) //shift the label a little bit inward
      .attr("text-anchor", "left")
      .text(values[values.length-1].y)
      .attr("fill", this.fill(key))
  }

  , addArea: function(key, values) {
    this.g.append("svg:path")
        .attr("class", "area " + key)
        .attr("d", this.area(values))
        .attr("fill", this.fill(key));
  }
  
});
;/* 
var data = [
  { label: "server-001",
    vector: [37, 14, 39, 46, 6, 2, 15, 7, 46, 6, 31, 47, 21, 41, 2, 22, 45, 13, 17, 3, 2, 12, 21, 40, 43, 48, 1, 24, 27, 30, 10, 7, 23, 10, 9, 40, 49, 17, 40, 15, 22, 1, 17, 16, 25, 1, 10, 45, 22, 19, 38, 49, 3, 2, 14, 33, 5, 25, 0, 15]
  },
  { label: "server-002",
    vector: [38, 52, 47, 18, 19, 0, 46, 49, 17, 16, 40, 25, 37, 16, 38, 50, 47, 18, 59, 0, 24, 52, 45, 52, 14, 23, 25, 22, 44, 59, 53, 7, 48, 16, 41, 19, 13, 40, 53, 29, 51, 38, 30, 3, 43, 4, 1, 32, 44, 40, 59, 15, 42, 15, 40, 9, 30, 9, 6, 37]
  },
  { label: "stageserver-001",
    vector: [53, 17, 16, 32, 9, 59, 33, 15, 53, 40, 58, 42, 4, 6, 26, 15, 15, 3, 42, 21, 30, 13, 14, 36, 5, 15, 16, 42, 46, 43, 6, 29, 20, 50, 55, 16, 29, 35, 49, 59, 15, 25, 38, 33, 14, 23, 20, 28, 49, 46, 15, 55, 30, 29, 10, 6, 57, 40, 32, 49] 
  },
  ...
] */

var StreamGraph = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Chart dimensions and visuals setup
    this.width = this.width || 1100;
    this.height = this.height || 750;
    this.leftMargin = this.leftMargin || 5;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 5;
    this.bottomMargin = this.bottomMargin || 5;
    this.fill = this.fill || d3.scale.category10();
    
    // StreamGraph options
    this.offset = this.offset || "silhouette"; // "silhouette" - center the stream, "wiggle", "expand", "zero"
    this.order = this.order || "inside-out"; //"inside-out" - sort by index of maximum value, "reverse", "default"
    this.line_interpolate = this.line_interpolate || "linear";
    
    // timestamps
    this.start_time = this.start_time || (new Date().valueOf() - 24*3600000);
    this.interval = this.interval || 60000;
    
    this.label_names = $.map(data, function(d, i){
      return d["label"];
    });
    this.series = $.map(data, function(d, i){
      return [ $.map(d["vector"], function(d, i){ return {x:i, y:d} }) ]
    });
    
    // stream_data will change when layout options get updated
    this.stream_data = d3.layout.stack().offset(this.offset).order(this.order)(this.series);
    
    // this is a hack for encoding the most fuck'ed up one with the reddest color
    this.aggregates = $.map(this.stream_data, function(d, i){
      var total = 0;
      $.each(d, function(k, v){
        total += v.y
      })
      return total;
    })
    this.max_aggregates = d3.max(this.aggregates)
    
    this.mx = this.stream_data[0].length - 1;
    this.my = d3.max(this.stream_data, function(d){
      return d3.max(d, function(d){
        return d.y0 + d.y;
      })
    }) * 1.02;
    this.hover_idx = -1;
    
    /* #chart div, paint streamgraph */
    this.vis = d3.select(selector)
    .append("svg:svg")
      .attr("class", "streamgraph")
      .attr("width", this.width)
      .attr("height", this.height);
    
    this.area = d3.svg.area()
      .x(function(d, i) { return i * self.width / self.mx; })
      .y0(function(d) { return self.height - d.y0 * self.height / self.my; })
      .y1(function(d) { return self.height - (d.y + d.y0) * self.height / self.my; })
      .tension(0.65)
      .interpolate(this.line_interpolate);
    
    this.render();
    
    // Tipsy style labels
    $(selector+' svg path').tipsy({
      gravity: 'sw',
      html: true,
      title: function(){ 
        var d = this.__data__; 
        var i = $.inArray(d, self.stream_data);
        var total = 0;
        $.each(d, function(){ total += this.y; })
        return  self.label_names[i] + "<br />" + "Total Exceptions: " + total;
      }
    });
  }
  
  , render: function(){
    var self = this;
    this.streams = this.vis.selectAll("path")
      .data(this.stream_data)
    .enter().append("svg:path")
      .attr("d", this.area)
      .attr("fill", function(d, i){ return self.fill(self.aggregates[i] / self.max_aggregates); })
      .attr("fill-opacity", .7)
      .attr("stroke", "#EEE")
      .on("mouseover", function(d, i){ return self.mouseover(d, i) })
      .on("mouseout", function(d, i){ return self.mouseout(d, i) });
    
    // Vertical gridlines to show timestamps
    this.grids = this.vis.selectAll("line")
      .data(this.stream_data[0])
    .enter().append("svg:line")
      .attr("class", "grid")
      .attr("x1", function(d, i){ return i * self.width / self.mx; })
      .attr("x2", function(d, i){ return i * self.width / self.mx; })
      .attr("y1", 0)
      .attr("y2", this.height)
      .attr("stroke", "none");
    
    // Place labels for each series
    this.labels = this.vis.selectAll("text")
      .data(this.label_names)
    .enter().append("svg:text")
      .attr("text-anchor", "middle")
      .attr("x", function(d, i){
        var j = Math.floor(self.stream_data[0].length / 2) + i*(i%2>0? -1 : 1);
        return j * self.width / self.mx;
      })
      .attr("y", function(d, i){
        var j = Math.floor(self.stream_data[0].length / 2) + i*(i%2>0? -1 : 1);
        var v = self.stream_data[i][j];
        return self.height - v.y0 * self.height / self.my;
      })
      .attr("fill", "none")
      .text(function(d, i) { return self.label_names[i]; });
  }

  , mouseover: function(d, i){
    var self = this;
    this.hover_idx = i;
    this.labels
      .attr("fill", "none");
    
    this.vis.selectAll("path")
      .attr("fill-opacity", function(d, i) { return self.hover_idx==i? 1:0.1; })
      .attr("stroke", function(d, i) { return self.hover_idx==i? "#F64941":"none"; });
    
    this.grids.attr("stroke", "#E3E3E3");
  }

  , mouseout: function(){
    this.hover_idx = -1;
    this.vis.selectAll("text")
      .attr("fill", "none");
    this.vis.selectAll("path")
      .attr("fill-opacity", .7)
      .attr("stroke", "#EEE")
      .attr("stroke-width", 1);
    this.grids.attr("stroke", "none");
    this.labels.attr("fill", "none");
  }

  , transition: function(offset, order){
    var self = this;
    
    // Update stream_data, my based on new layout
    this.stream_data = d3.layout.stack().offset(offset).order(order)(this.series);
    this.my = d3.max(this.stream_data, function(d){
      return d3.max(d, function(d){
        return d.y0 + d.y;
      })
    }) * 1.02;
    
    this.vis.selectAll("path")
    .transition()
      .delay(100)
      .duration(1000)
      .attr("d", this.area);
  }
});
