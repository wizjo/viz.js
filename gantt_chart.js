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
    {"end_time":"2012/02/08 01:02:29","state":"succeeded","start_time":"2012/02/08 01:02:26"},
    {"end_time":"2012/02/08 02:02:28","state":"succeeded","start_time":"2012/02/08 02:02:25"},
    {"end_time":"2012/02/08 03:02:25","state":"succeeded","start_time":"2012/02/08 03:02:22"},
    {"end_time":"2012/02/08 04:02:27","state":"succeeded","start_time":"2012/02/08 04:02:24"},
    {"end_time":"2012/02/08 05:02:30","state":"succeeded","start_time":"2012/02/08 05:02:27"},
    {"end_time":"2012/02/08 06:02:30","state":"succeeded","start_time":"2012/02/08 06:02:27"},
    {"end_time":"2012/02/08 07:02:34","state":"succeeded","start_time":"2012/02/08 07:02:29"},
    {"end_time":"2012/02/08 08:02:22","state":"succeeded","start_time":"2012/02/08 08:02:19"},
    {"end_time":"2012/02/08 09:02:28","state":"succeeded","start_time":"2012/02/08 09:02:25"}],
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
    {"end_time":"2012/02/08 00:02:33","state":"succeeded","start_time":"2012/02/08 00:02:27"},
    {"end_time":"2012/02/08 01:02:28","state":"succeeded","start_time":"2012/02/08 01:02:24"},
    {"end_time":"2012/02/08 02:02:31","state":"succeeded","start_time":"2012/02/08 02:02:27"},
    {"end_time":"2012/02/08 03:02:29","state":"succeeded","start_time":"2012/02/08 03:02:26"},
    {"end_time":"2012/02/08 04:02:28","state":"succeeded","start_time":"2012/02/08 04:02:24"},
    {"end_time":"2012/02/08 05:02:35","state":"succeeded","start_time":"2012/02/08 05:02:30"},
    {"end_time":"2012/02/08 06:02:29","state":"succeeded","start_time":"2012/02/08 06:02:26"},
    {"end_time":"2012/02/08 07:02:34","state":"succeeded","start_time":"2012/02/08 07:02:30"},
    {"end_time":"2012/02/08 08:02:28","state":"succeeded","start_time":"2012/02/08 08:02:23"},
    {"end_time":"2012/02/08 09:02:28","state":"succeeded","start_time":"2012/02/08 09:02:25"}],
    "label":"verthouse/dashboard_rollups/activations"
  },
  { "id": 4, "param":{"period":"2001"},
    "values":[
    {"end_time":"2012/02/07 10:01:24","state":"succeeded","start_time":"2012/02/07 10:01:21"},
    {"end_time":"2012/02/07 11:01:33","state":"succeeded","start_time":"2012/02/07 11:01:29"},
    {"end_time":"2012/02/07 12:01:33","state":"succeeded","start_time":"2012/02/07 12:01:30"},
    {"end_time":"2012/02/07 13:01:35","state":"succeeded","start_time":"2012/02/07 13:01:32"},
    {"end_time":"2012/02/07 14:01:32","state":"succeeded","start_time":"2012/02/07 14:01:29"},
    {"end_time":"2012/02/07 15:01:33","state":"succeeded","start_time":"2012/02/07 15:01:29"},
    {"end_time":"2012/02/07 16:01:39","state":"succeeded","start_time":"2012/02/07 16:01:35"},
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
    this.formatter = this.formatter || ".2f";
    
    // TODO: find out the xScale in case it's not specified
    // this.startX = this.startX || ...;
    // this.endX = this.endX || ...;
    // this.xScale = this.xScale || ;
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("class", "gantt_chart")
        .attr("transform", "translate(" + this.leftMargin + ", " + this.topMargin + ")");
    
    // Draw pies
    $.each(data, function(key, value){
      self.addSeries(key, value);
      
      // Tipsy style mouseover
      $(selector+' rect').tipsy({
        gravity: 'sw',
        html: true,
        title: function() {
          var d = this.__data__;
          var duration = (self.xTransform(d.end_time) - self.xTransform(d.start_time)) / 1000;
          return self.label && self.label(d) || "Started at: " + d.start_time + "UTC <br />duration: " + d3.format(self.formatter)(duration) + "sec"; 
        }
      });
    })
  }
  
  , addSeries: function(key, value){
    var self = this;
    
    // The container
    var g = this.vis
        .append("svg:g")
        .attr("class", "series " + value.id)
        .attr("transform", "translate(0, "+ (parseInt(key) * (this.topMargin + this.barHeight + this.bottomMargin)) +")");
    
    g.selectAll("rect.series")
        .data(value.values)
      .enter().append("svg:rect")
        .attr("class", function(d, i){ return "series " + d.state; })
        .attr("x", function(d, i){ return self.xScale(self.xTransform(d.start_time)); })
        .attr("y", 0)
        .attr("width", function(d, i){
          return self.xScale(self.xTransform(d.end_time)) - self.xScale(self.xTransform(d.start_time)) + 5;
        })
        .attr("height", this.barHeight)
        .attr("fill", this.fill && this.fill(value.id) || "none");
  }

});
