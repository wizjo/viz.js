/* 
  var data = {
    labels: ["Web", "Desktop", "Mobile", "SharePoint", "Other"], 
    values: {
      "Deloitte": [ {x:0, y:75.9}, {x:1, y:36.9}, {x:2, y:9.8}, {x:3, y:0.2}, {x:4, y:0.1} ], 
      "Nationwide": [ {x:0, y:95.0}, {x:1, y:10.9}, {x:2, y:9.8}, {x:3, y:0.1}, {x:4, y:2.4} ]
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
