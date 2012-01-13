/*
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
    
    // Only support linear scales for the time being
    this.x = this.x || d3.scale.linear().domain([this.startX, this.endX]).range([0 + this.xLeftMargin, this.width - this.xLeftMargin - this.xRightMargin]);
    this.y = this.y || d3.scale.linear().domain([self.min, self.max]).range([0 + this.yMargin, this.height - this.yMargin]);
    this.yAxisScale = this.yAxisScale || d3.scale.linear().domain([0, self.max]).range([this.height - this.yMargin, 0 + this.yMargin]);
    this.xNumTicks = this.xNumTicks || 6;
    this.yNumTicks = this.yNumTicks || 4;
    this.fill = this.fill || d3.scale.category10();
    this.fillShades = this.fillShades || false;

    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(0, " + this.height + ")");  // TODO: Account for margin?

    // Use this for adding lines
    this.line = this.line || d3.svg.line()
        .x(function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .y(function(d) { 
          return -1 * self.y(
            (self.yLineTransform && self.yLineTransform(this.stacked? (d.y + d.y0) : d.y)) || this.stacked? (d.y + d.y0) : d.y
          ); 
        });

    // Use this for adding areas
    this.area = this.area || d3.svg.area()
        .x(function(d) { return self.x((self.xLineTransform && self.xLineTransform(d.x)) || d.x); })
        .y0(function(d) { return -1 * (self.stacked ? self.y(d.y0) : self.yMargin) })
        .y1(function(d) { 
          return -1 * self.y(
            (self.yLineTransform && self.yLineTransform(this.stacked? (d.y + d.y0) : d.y)) || this.stacked? (d.y + d.y0) : d.y
          ); 
        });

    // Add the lines, conditionally fill the area underneath
    $.each(data, function(key, values) {
      self.addLine(key, values);
      if(self.fillShades) { self.addArea(key, values); }
    })

    // X Axis
    var xAxis = options.xAxis || d3.svg.axis().scale(this.x).ticks(this.xNumTicks).orient('bottom');
    this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.height - this.yMargin) + ")")
        .call(xAxis);

    // Left Y axis
    var yAxis = options.yAxis || d3.svg.axis().scale(this.yAxisScale).ticks(self.yNumTicks).tickFormat(
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
        .call(yAxis);

    // Add the right axis, possibly with a default, if applicable
    if (options.rightAxis === true) {
      options.rightAxis = d3.svg.axis().scale(
        d3.scale.linear().domain([0, self.max]).range([this.height - this.yMargin, 0 + this.yMargin])).ticks(this.yNumTicks).orient('right');
    }
    if (options.rightAxis) {
      this.vis.append("svg:g")
          .attr("class", "y axis right")
          .attr("transform", "translate(" + (this.width - this.xLeftMargin - this.xRightMargin) + ", 0)")
          .call(options.rightAxis);
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
  
});
