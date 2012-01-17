/*
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
