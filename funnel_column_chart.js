/* DECLARATION EXAMPLE
  data = 
  [{  benchmark: "100"
      content: []
      title: "Funnel Entries"
      total: "16,100"
      delay: 0
      x: 0
      y: 100
      y0: 0
    },
   {  benchmark: "96.91"
      content: ["97.27% of initial users"] //content is the text that appears in the arrows
      title: "Confirm" // title is the name of the funnel step
      total: "15,660" //total number of people in that step
      delay: 2.4 //delay time between last step and this step
      x: 1 //index
      y: "97.27" //percentage of total
      y0: 0
   },...
  ]

var selector = ... //id of div to render to

var chart = new FunnelColumnChart(selector, data, {
        space: 15 // spacing between bars
        , leftMargin: 10 // give it a larger leftMargin when you want the y-axis to be on the left-hand side
        , rightMargin: 50
        , topMargin: 25
        , name: 'title'
        , baseline: "bottom"
        , stacked: true // false: grouped bars; true: stacked bars (when there's one than one series)
        , fill: '#77c5d5'
        , numRules: 11 // number of rules to add, first rule is where the bars' baseline is
        , yaxis_position: "left" // position to place yaxis: "left", "right"
        , ynumTicks: 5 // number of ticks on the Y Axis
        , yAxisMargin: 30
        , show_labels: true
        , label_class: "arrow_box" //custom css styling allowed for arrows
        , percent: true //whether to display percentage 
        , unit: users //unit to put after (signup funnel had "users", recruiting had 'applicants')
        , benchmark: {
            enabled: true //whether to show benchmark marks
          , time: "12 weeks" //displays in legend box
        }
        , legend: { 
            enabled: true, 
            metricLabel: '' -- description for metric in legend
            benchmarkLabel: '' -- description for benchmark in legend
            position: left -- which side should the legend go?
          },
        , delay: { 
            enabled: true //display delay box
          , unit: 'day' // unit of the delay (days, weeks, etc)
          , average: averageDelay //give it an average delay or it will automatically average all delays in data
        }
       });

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


    // Delay Options
    if(this.delay) {
      this.delay.enabled = this.delay.enabled || false;
      this.delay.unit = this.delay.unit || '';  
      this.delay.average = this.delay.average || null;
    }
    
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
    
    // Benchmark Options
    if(this.benchmark) {
      this.benchmark.enabled = this.benchmark.enabled || false;
      this.benchmark.fill = this.benchmark.fill || "#AA4643";
      this.benchmark.time = this.benchmark.time || "";
    }

    // Legend Options
    if(this.legend) {
      this.legend.enabled = this.legend.enabled || false; 
      this.legend.position = this.legend.position || "right";
    }

    // Reformat data for charting (and labeling)
    this.series = this.series || $.map(data.values, function(values, key){ return [key]; })
    data.values = d3.layout.stack()($.map(data.values, function(values, key){ return [values]; }));

    var division = data.values[0].length > 4 ? data.values[0].length : data.values[0].length + 0.5;
    this.barWidth = $(window).width()/division - 2*this.space;
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

  
    /*********
      Y-AXIS
    **********/
    this.yAxis = d3.svg.axis().scale(this.vScale).ticks(this.ynumTicks).tickFormat(
        function(d) {
          var wholeNumber = d3.format(",0d");
          if (d == 0) { return 0 + "%"; }
          if (d > 1) { return wholeNumber(d) + "%"; }
          if (d >= 0.01) { return n.toPrecision(2) + "%"; }
          return parseFloat(n.toPrecision(2)).toExponential() + "%";
        }
    ).orient(this.yaxis_position);

    /******************
      GROUPED REPORTS
    *******************/
    var div = document.createElement('div');
    div.setAttribute('margin-right', self.rightMargin);

    /*********
      LEGEND
    **********/
    if(self.legend && self.legend.enabled) {
      var legend = '<div style="vertical-align:top;background-color:white;border-radius:10px;float:' + self.legend.position + ';border-color:#EDEDED;border-style:solid;padding:17px;"><table>';
      
      if(self.benchmark && self.benchmark.enabled) {
        var benchmarkPath = '<svg style="height:15px"><g><line x1=0 x2=35 y1=5 y2=5 style="stroke:' + self.benchmark.fill + ';stroke-width:2;"></line>'
        + '<path d="m14 5 l4 4 l4 -4 l-4 -4 Z" style="fill:' + self.benchmark.fill + '"></path></g></svg>'; 
        legend += '<tr><td style="width:40px">' + benchmarkPath + '</td>';
        if(self.legend.benchmarkLabel)
          legend += '<td style="padding-right:15px;color:' + self.benchmark.fill + '">' + self.legend.benchmarkLabel + '</td>';
        else 
          legend += '<td style="padding-right:15px;color:' + self.benchmark.fill + '">' + self.legend.benchmarkLabel + '</td>';
      }
      
      legend += '<td style="width:35px"><svg width=25 height=25><rect x=15 y=3 width=10 height=20 fill=' + self.fill + ' style="fill:' + self.fill + '"></rect><rect x=5 y=15 width=10 height=8 fill=' + self.fill + ' style="fill:' + self.fill + '"></rect></svg></td>' ;
      if(self.legend.metricLabel) 
        legend += '<td style="color:' + self.fill + '" >' + self.legend.metricLabel + '</td>';
      else 
        legend += '<td style="color:' + self.fill + '" >' + self.name + '</td>';
      legend += '</tr></table></div>';

      $(div).append(legend);
    }

    /**************
      DELAY REPORT
    ***************/
    if(self.delay && self.delay.enabled) {
      if(!self.delay.average) {
        var average = 0, has = 0;
        for(var i=0; i < (data.values[0]).length; i++) {
          if(data.values[0][i].delay && data.values[0][i].delay != 0) { 
            average += new Number(data.values[0][i].delay);
            has++;
          }
        }
        average = average != 0 ? (average/has).toFixed(2) : 'N/A';
      }
      else average = self.delay.average.toFixed(2);
      var delayReport = '<div style="vertical-align:top;background-color:#EDEDED;border-radius:10px;float:right;margin-right:15px;padding:12px;color:#4D4D4D">Average delay time between steps: <br /> <h1 style="color:#757575">' + average + ' ' + self.delay.unit + 's </h1></div>';
      $(div).append(delayReport);
    }

    if($(div).children().length > 0) 
      $(selector).append(div);


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
          .attr("x2", this.width - this.space - 65)
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

    /*********
      BARS
    **********/
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
      
    /*************
      BENCHMARKS
    **************/
    if(self.benchmark && self.benchmark.enabled) {
      var benchmarks = groups.append("svg:line")
        .attr("x1", function(d, i) {return (i+.5)*self.barWidth + (i+1)*self.space})
        .attr("x2", function(d, i) {return (i+.5)*self.barWidth + (i+1)*self.space})
        .attr("y1", function(d) { 
          return self.vScale( d.benchmark ); 
        })
        .attr("y2", function(d) { 
          return self.vScale( d.benchmark ); 
        })
        .style("stroke", self.benchmark.fill)
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
        .style("fill", self.benchmark.fill)
        .attr("opacity", 0.0)
        .transition().duration(function(d, idx) {
          return idx * 250;
        })
        .attr("opacity", 1.0);  
    }

    /***********
      ARROWS
    ************/
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
      .attr("font-size", 15)
      .text(function(d) { return d.title;});

    text.selectAll("text").data(function(d, i) { return d.content }).enter().append("svg:tspan")
      .attr("x", x_indent)
      .attr("dy", 25)
      .attr("font-size", 13)
      .text(function(s) {return s});

    /***********
      TOOLTIPS
    ************/

    groups.on("mouseover", function(d, i) {
      $($($(this).children()[3]).children()[0]).css("stroke", "#696969");
      $($(this).children()[0]).css("stroke-width", 3);
      $($(this).children()[0]).css("stroke", "#696969");
      
      var j = i > groups[0].length/2 ? i : i+1;

      var x = (j)*(self.barWidth) + (j+1)*self.space + self.leftMargin + self.yAxisMargin;
      if(i > groups[0].length/2) x -= (self.barWidth + 2*self.space);

      var y = self.height - self.vScale(d.y) + self.arrowHeight;
      var style = '-o-transform:translate(' + x + 'px, -' + y + 'px);-webkit-transform:translate(' + x + 'px, -' + y + 'px);-ms-transform:translate(' + x + 'px, -' + y + 'px);width:' + (self.barWidth - self.space/2) + 'px;-moz-transform:translate(' + x + 'px, -' + y + 'px)';

      var content = '<h3 style="color:black">' + d.title + '</h3><div style="margin-left:20px"><p><h4 style="display:inline">' + d.total + '</h4>  ' + self.unit + '</p>';

      if(i > 0) { 
        content += '<p><h4 style="display:inline">' + d.y + '</h4>% of initial ' + self.unit + '</p>';
        if(d.delay) {
          content += '<p style="display:inline">Averaged <h4 style="display:inline">' + d.delay + ' ' + self.delay.unit + '</h4> delay between this and the last step</p>';
        }
        if(d.benchmark) {
          content += '<p style="color:' + self.benchmark.fill + ';display:inline"> Has been <br /> </p> <h4 style="color:' + self.benchmark.fill + ';display:inline">' + d.benchmark 
          + '%</h4> <p style="color:' + self.benchmark.fill + ';display:inline"> the last ' + self.benchmark.time + ' (benchmark) </p></div>';
          if(d.benchdelay) {
            content += '<p style="color:' + self.benchmark.fill + 'display:inline">Averaged <h4 style="color:' + self.benchmark.fill + 'display:inline">' + d.delay + '</h4> delay between this and the last step in the last ' + self.benchmark.time + '(benchmark delay)</p>';
        }
        }
      }



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
