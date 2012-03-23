/* 
  var data = {
    series1: [
      {time_id: "2012-02-01 00:05:00", y: 125.38, state: "succeeded"},
      {time_id: "2012-02-01 01:05:00", y: 119.23, state: "succeeded"},
      {time_id: "2012-02-01 02:05:00", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 03:05:00", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 04:05:00", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 05:05:00", y: 108.65, state: "failed"},
      {time_id: "2012-02-01 06:05:00", y: 67.12, state: "running"} ]
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
