/* 
  var data = {
    labels: ["Web", "Desktop", "Mobile", "SharePoint", "Other"], 
    values: {
      "Deloitte": [ {x:0, y:75.9}, {x:1, y:36.9}, {x:2, y:9.8}, {x:3, y:0.2}, {x:4, y:0.1} ], 
      "Nationwide": [ {x:0, y:95.0}, {x:1, y:10.9}, {x:2, y:9.8}, {x:3, y:0.1}, {x:4, y:2.4} ]
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
