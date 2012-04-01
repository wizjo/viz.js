/* FilledSeries chart filled in a specified color between two series,
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
