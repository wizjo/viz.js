/*
var data = [
  {"id":1, "param":{"period":"2001"},
    "values":[
    {"end_time":"2012/02/07 17:57:57","state":"succeeded","start_time":"2012/02/07 17:57:36"},
    {"end_time":"2012/02/07 20:03:21","state":"succeeded","start_time":"2012/02/07 20:03:16"},
    {"end_time":"2012/02/08 08:04:43","state":"succeeded","start_time":"2012/02/08 08:04:30"}],
    "label":"verthouse/dashboard_rollups/activation_sources"
  },
  {"id":2, "param":{"period":"2001"},
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
    "label":"verthouse/dashboard_rollups/activations"
  },
  {"id":3, "param":{"period":"2007"},
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
    "label":"verthouse/dashboard_rollups/activations"
  },
  { "id": 4, "param":{"period":"2001"},
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
    "label":"verthouse/dashboard_rollups/client_engagements"
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
