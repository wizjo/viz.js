/* 
  var data = {
    labels: [<DIV>, <DIV>, <DIV>, <DIV>, <DIV>], 
    values: {
      "Deloitte": [ {x:0, y:75.9}, {x:1, y:36.9}, {x:2, y:9.8}, {x:3, y:0.2}, {x:4, y:0.1} ], 
      "Nationwide": [ {x:0, y:95.0}, {x:1, y:10.9}, {x:2, y:9.8}, {x:3, y:0.1}, {x:4, y:2.4} ]
    }
  }
*/

var FunnelColumnChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup, all these can be overwritten by options
    this.height = this.height || 400;
    this.space = this.space || 20;
    this.leftMargin = this.leftMargin || 5;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 5;
    this.barWidth = this.barWidth || 5; // sets the width of each bar
    
    this.baseline = this.baseline || "bottom"; // available values: "top", "bottom"
    this.stacked = this.stacked || false; // true: stacked bars; false: grouped bars
    
    // Set up rules, axis, ticks
    this.numRules = this.numRules || 1; // number of rules to add, first rule is where the bars' baseline is
    this.yaxis_position = this.yaxis_position || "left"; // position to place yaxis: "left", "right", "none"
    this.ynumTicks = this.ynumTicks || 10; // number of ticks on the Y Axis
    this.yAxisMargin = this.yAxisMargin || 30;
    this.show_labels = this.show_labels || false;
    this.label_position = this.label_position || "vertical";
    this.label_class = this.label_class || "";
    this.useTipsy = this.useTipsy || false;
    this.formatter = this.formatter || ".2f";

    this.unit = this.percent ? "%" : "";
    this.lineStrokeColor = this.lineStrokeColor || "#EBEBEB";
    this.lineStrokeWidth = this.lineStrokeWidth || 1.5;

    this.steps = data.values["Steps"] || [];
    this.benchmark = data.values["Benchmark"] || [];

    // Reformat data for charting (and labeling)
    this.series = this.series || $.map(data.values, function(values, key){ return [key]; })
    this.values = d3.layout.stack()($.map(data.values, function(values, key){ return [values]; }));
    

    this.arrowHeight = 35 * (this.steps[1].content.length+1);
    this.arrowWidth = self.barWidth + this.space/2;

    // Override width based on spacing between bars and width of bar/arrows
    this.bottomMargin = this.arrowHeight + this.bottomMargin || this.arrowHeight;
    this.width = this.steps.length * (this.barWidth + self.space) + this.leftMargin + this.rightMargin + this.yAxisMargin;
    
    this.max = this.max || d3.max($.map(this.values, function(values, key){ 
      return d3.max($.map(values, 
        function(values){ return values.y; 
      })) 
    }));
    this.min = this.min || d3.min($.map(this.values, function(values, key){ 
      return d3.min($.map(values, 
        function(values){ return values.y; 
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
          if (d == 0) { return 0 + self.unit; }
          if (d > 1) { return wholeNumber(d) + self.unit; }
          if (d >= 0.01) { return n.toPrecision(2) + self.unit; }
          return parseFloat(n.toPrecision(2)).toExponential() + self.unit;
        }
    ).orient(this.yaxis_position);
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height + this.arrowHeight);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + (this.yaxis_position === 'left'? this.yAxisMargin+this.leftMargin : this.leftMargin) + ", "+ this.topMargin + ")");
    
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
          .attr("x2", this.width)
          .attr("style", "stroke-width:" + self.lineStrokeWidth + ";stroke:" + self.lineStrokeColor);
    }

    // Draw chart
    self.addBar("Steps", this.steps);
    self.addBar("Benchmark", this.benchmark);

    // Add Y Axis
    if(this.yaxis_position !== 'none') {
      this.g.append("svg:g")
          .attr("class", "y axis")
          .call(this.yAxis);
    }
    
    // Add labels against baseline
    if(this.show_labels) {
      this.g.selectAll("")
          .data(data.labels)
        .enter().append("svg:rect")
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
          });
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
    var groups = this.g.selectAll("rect." + "series_" + key).data(values)
      .enter().append("svg:g");

    if(key === "Benchmark") {

    }
    else{
      var bars = groups.append("svg:rect")
        .attr("class", function() { return "series_" + key; })
        .attr("y", function(d, idx) { 
          var first = values[0].y;
          return self.vScale( first ); 
        })
        .attr("x", function(d, i) {return i*self.barWidth + (i+1)*self.space})
        .attr("width", self.barWidth)
        .attr("fill", function(d, i) { return self.fill? self.fill("bar_" + key + "_" + i) : "none" })
        .attr("height", function(d, idx) {
          var first = values[0].y; 
          return self.vScale(0) - self.vScale(first); 
        })
        .transition().duration(function(d, idx) {
            return idx * 250;
          })
        .attr("height", function(d, idx) { 
          return self.vScale(0) - self.vScale(d.y); 
        })
        .attr("y", function(d) { 
          return self.vScale( d.y ); 
        });
        

        //makes arrows
        var x_indent = self.space/2;
        var y_indent = this.arrowHeight/(values[1].content.length + 2);
        var arrow_extend = "-" + self.space/3 + " -" + self.space/3;

        var arrowGroups = groups.append("svg:g").attr("transform", function(d,i) {
          var x = i*self.barWidth + (i+1)*self.space;
          var y = self.vScale(d.y0) + 25;
          return "translate(" + x + ", " + y + ")";
        });

        arrowGroups.attr("opacity", 0.0)
        .transition().duration(function(d, idx) {
          return idx * 350;
        })
        .attr("opacity", 1.0);


        arrowGroups.append("svg:path")
          .attr("d", function(d, i) {
            var p = "m"  + arrow_extend + " h" + self.arrowWidth + "l" + self.space/2 + " " 
              + self.arrowHeight/2 + "  l-" + self.space/2 + " " + self.arrowHeight/2 + "  h-" + self.arrowWidth;
            if(i === 0) //if first arrow, cutoff end
              return p += "L" + arrow_extend + " Z";
            else if(i === values.length - 1) //if last
              return "m" + arrow_extend + " h" + (self.arrowWidth + self.space/2) + "v" + self.arrowHeight +  " h-" + (self.arrowWidth + self.space/2)
                + " l" + self.space/2 + " -" + self.arrowHeight/2 + "  L" + arrow_extend + " Z" ;
            return p += " l" + self.space/2 + " -" + self.arrowHeight/2 + "  L" + arrow_extend + " Z"; //if any other, make arrow
          })
          .attr("stroke", function(d, i) { return self.fill? self.fill("bar_" + key + "_" + i) : "none" })
          .attr("stroke-width", 3)
          .attr("fill", "#EDF7FF");

        var text = arrowGroups.append("svg:text").attr("y", y_indent);
        
        text.append("svg:tspan")
          .attr("x", x_indent)
          .attr("font-weight", "bold")
          .attr("font-size", 13)
          .text(function(d) { return d.title;});

        text.selectAll("text").data(function(d) { return d.content}).enter().append("svg:tspan")
          .attr("x", x_indent)
          .attr("dy", 19)
          .attr("font-size", 13)
          .text(function(s) {return s });
    }
    
  }
});
