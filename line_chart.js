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
          return d3.format(",0d")(d.y);
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
        .text(function(d) { return d3.format(",0d")(d.y); });
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
    this.hover_idx = i;
    this.g.selectAll("text.label_" + key)
        .attr("fill", "none")
    this.hover_idx = -1;
  }
  
});
