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

    this.unit = this.unit || "total";
    this.lineStrokeColor = this.lineStrokeColor || "#EBEBEB";
    this.lineStrokeWidth = this.lineStrokeWidth || 1.5;

    this.fill = this.fill || "#77c5d5";
    
    this.benchmarkFill = this.benchmarkFill || "#AA4643";

    this.legend = this.legend || null; 
    this.legend.position = this.legend.position || "right";

    // Reformat data for charting (and labeling)
    this.series = this.series || $.map(data.values, function(values, key){ return [key]; })
    data.values = d3.layout.stack()($.map(data.values, function(values, key){ return [values]; }));

    this.barWidth = $(window).width()/data.values[0].length - 2*this.space;
    if(this.barWidth < 0) console.log("'space' option is too large for the number of bars given!");

    this.arrowHeight = 20 + 35 * (data.values[0][1].content.length+1);

    this.arrowWidth = self.barWidth + this.space/2;


    // Override width based on spacing between bars and width of bar/arrows
    this.bottomMargin = this.arrowHeight + this.bottomMargin || this.arrowHeight;
    this.width = data.values[0].length * (this.barWidth + self.space) + this.leftMargin + this.rightMargin + this.yAxisMargin;
    
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


    this.vScale = this.vScale || d3.scale.linear()
      .domain([(self.min < 0 ? self.min : 0), self.max])
      .range([self.height - self.topMargin - self.bottomMargin, 0]);

  
    // Define yAxis
    this.yAxis = d3.svg.axis().scale(this.vScale).ticks(this.ynumTicks).tickFormat(
        function(d) {
          var wholeNumber = d3.format(",0d");
          if (d == 0) { return 0 + "%"; }
          if (d > 1) { return wholeNumber(d) + "%"; }
          if (d >= 0.01) { return n.toPrecision(2) + "%"; }
          return parseFloat(n.toPrecision(2)).toExponential() + "%";
        }
    ).orient(this.yaxis_position);

    //draw legend
    if(self.legend) {
      var legend = '<div style="background-color:white;border-color:#EDEDED;border-bottom-width:5px;border-style:solid;padding:12px;float:' + self.legend.position + '"><table>';
      var benchmarkPath = '<svg style="height:15px"><g><line x1=0 x2=35 y1=5 y2=5 style="stroke:' + self.benchmarkFill + ';stroke-width:2;"></line>'
      + '<path d="m14 5 l4 4 l4 -4 l-4 -4 Z" style="fill:' + self.benchmarkFill + '"></path></g></svg>'; 
      legend += '<tr><td style="width:40px">' + benchmarkPath + '</td>';
      if(self.legend.benchmarkLabel)
        legend += '<td style="color:' + self.benchmarkFill + '">' + self.legend.benchmarkLabel + '</td>';
      else 
        legend += '<td style="color:' + self.benchmarkFill + '">' + self.legend.benchmarkLabel + '</td>';
      

      legend += '<td style="width:35px"><svg><rect x=15 width=10 height=25 style="fill:' + self.fill + '"></rect></svg></td>' ;
      if(self.legend.metricLabel) 
        legend += '<td style="color:' + self.fill + '" >' + self.legend.metricLabel + '</td>';
      else 
        legend += '<td style="color:' + self.fill + '" >' + self.name + '</td>';
      legend += '</tr></table></div>';

      $(selector).append(legend);
    }

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
          .attr("x1", 0)
          .attr("x2", this.width)
          .attr("style", "stroke-width:" + self.lineStrokeWidth + ";stroke:" + self.lineStrokeColor);
    }

    // Draw chart
    $.each(data.values, function(key, values) {
      self.addBar(key, values, selector);
    })

    // Add Y Axis
    if(this.yaxis_position !== 'none') {
      this.g.append("svg:g")
          .attr("class", "y axis")
          .call(this.yAxis);
    }
  }
  
  , addBar: function(key, values, selector) {
    self = this;
    var groups = this.g.selectAll("rect." + "series_" + key).data(values)
      .enter().append("svg:g");

    //makes bars
    var bars = groups.append("svg:rect")
      .attr("class", function() { return "series_" + key; })
      .attr("x", function(d, i) {return i*self.barWidth + (i+1)*self.space})
      .attr("width", self.barWidth)
      .style("fill", self.fill)
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
        return self.vScale( self.stacked? (d.y0+d.y) : d.y ); 
      });
      
      //makes benchmarks
    var benchmarks = groups.append("svg:line")
      .attr("x1", function(d, i) {return (i+.5)*self.barWidth + (i+1)*self.space})
      .attr("x2", function(d, i) {return (i+.5)*self.barWidth + (i+1)*self.space})
      .attr("y1", function(d) { 
        return self.vScale( d.benchmark ); 
      })
      .attr("y2", function(d) { 
        return self.vScale( d.benchmark ); 
      })
      .style("stroke", self.benchmarkFill)
      .attr("stroke-width", 2)
      .transition().duration(function(d, idx) {
        return (idx+1) * 250;
      })
      .attr("x1", function(d, i) {return (i+0.25)*self.barWidth + (i+1)*self.space})
      .attr("x2", function(d, i) {return (i+0.75)*self.barWidth + (i+1)*self.space});

    groups.append("svg:path")
      .attr("d", function(d, i) {
        var x = (i+0.5)*self.barWidth + (i+1)*self.space;
        var y = self.vScale( d.benchmark );
        return "m" + (x-5) + " " + y + " l5 5 l5 -5 l-5 -5 Z";
      })
      .style("fill", self.benchmarkFill)
      .attr("opacity", 0.0)
      .transition().duration(function(d, idx) {
        return idx * 250;
      })
      .attr("opacity", 1.0);

      //makes arrows
      var x_indent = self.space;
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
        .style("stroke", self.fill)
        .attr("stroke-width", 3)
        .style("fill", "#EDF7FF");

      var text = arrowGroups.append("svg:text").attr("y", y_indent);
      
      text.append("svg:tspan")
        .attr("x", x_indent)
        .attr("font-weight", "bold")
        .attr("font-size", 17)
        .text(function(d) { return d.title;});

      text.selectAll("text").data(function(d, i) { return i!=0 ? d.content : []}).enter().append("svg:tspan")
        .attr("x", x_indent)
        .attr("dy", 25)
        .attr("font-size", 13)
        .text(function(s) {return s + "% of initial"});

      groups.on("mouseover", function(d, i) {
        $($($(this).children()[3]).children()[0]).css("stroke", "#696969");
        $($(this).children()[0]).css("stroke-width", 3);
        $($(this).children()[0]).css("stroke", "#696969");
        
        var j = i < groups[0].length/2 ? i+1 : i;

        var x = (j)*(self.barWidth) + (j+1)*self.space + self.leftMargin + self.yAxisMargin;
        if(i > groups[0].length/2) x -= (self.barWidth + 1.5*self.space);

        var y = self.height - self.vScale(d.benchmark) + self.arrowHeight;
        var style = '-webkit-transform:translate(' + x + 'px, -' + y + 'px);width:' + (self.barWidth - self.space/2) + 'px';

        var content = '<h3 style="color:black">' + d.title + '</h3><div style="margin-left:20px"><p><h4 style="display:inline">' + d.total + '</h4>  ' + self.unit + '</p>';

        if(i > 0) content += '<p><h4 style="display:inline">' + d.y + '</h4>% of initial ' + self.unit + '</p>'
          + '<p style="color:' + self.benchmarkFill + ';display:inline"> Was </p> <h4 style="color:' + self.benchmarkFill + ';display:inline">' + d.benchmark 
          + '%</h4> <p style="color:' + self.benchmarkFill + ';display:inline"> three months ago (benchmark) </p></div>';
        
        var tooltip = '<div id="tooltip" style="' + style + '">' + content + '</div>';  
        $(selector).append(tooltip);

        if(i > groups[0].length/2) {
          $("#tooltip").addClass("afterarrow");
        } else {
          $("#tooltip").addClass("beforearrow")
        }


      });

      groups.on("mouseout", function(d, i) {
        $($($(this).children()[3]).children()[0]).css("stroke", self.fill);
        $($(this).children()[0]).css("stroke-width", 0);
        $($(this).children()[0]).css("stroke", "none");
        $("#tooltip").remove();
      }); 
  }

});
