/* 
var data = [
  { label: "web-001",
    vector: [37, 14, 39, 46, 6, 2, 15, 7, 46, 6, 31, 47, 21, 41, 2, 22, 45, 13, 17, 3, 2, 12, 21, 40, 43, 48, 1, 24, 27, 30, 10, 7, 23, 10, 9, 40, 49, 17, 40, 15, 22, 1, 17, 16, 25, 1, 10, 45, 22, 19, 38, 49, 3, 2, 14, 33, 5, 25, 0, 15]
  },
  { label: "web-002",
    vector: [38, 52, 47, 18, 19, 0, 46, 49, 17, 16, 40, 25, 37, 16, 38, 50, 47, 18, 59, 0, 24, 52, 45, 52, 14, 23, 25, 22, 44, 59, 53, 7, 48, 16, 41, 19, 13, 40, 53, 29, 51, 38, 30, 3, 43, 4, 1, 32, 44, 40, 59, 15, 42, 15, 40, 9, 30, 9, 6, 37]
  },
  { label: "stageweb-001",
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
