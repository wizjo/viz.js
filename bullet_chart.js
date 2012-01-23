/*
"title" and "subtitle" are both optional.

data = [
  {"title":"Revenue","subtitle":"US$, in thousands","ranges":[150,225,300],"measures":[220,270],"markers":[250]},
  {"title":"Profit","subtitle":"%","ranges":[20,25,30],"measures":[21,23],"markers":[26]},
  {"title":"Order Size","subtitle":"US$, average","ranges":[350,500,600],"measures":[100,320],"markers":[550]},
  {"title":"New Customers","subtitle":"count","ranges":[1400,2000,2500],"measures":[1000,1650],"markers":[2100]},
  {"title":"Satisfaction","subtitle":"out of 5","ranges":[3.5,4.25,5],"measures":[3.2,4.7],"markers":[4.4]}
];
*/

var BulletChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    this.width = this.width || 500;
    this.height = this.height || 45;
    this.leftMargin = this.leftMargin || 100;
    this.rightMargin = this.rightMargin || 5;
    this.topMargin = this.topMargin || 2;
    this.bottomMargin = this.bottomMargin || 2;
    
    this.title = this.title || false;
    this.subtitle = this.subtitle || false;
    this.fill = this.fill || d3.scale.category10();
    this.hover_events = this.hover_events || false;
    this.hover_label_color = this.hover_label_color || "#333";
        
    this.chart = this.chart || d3.chart.bullet()
        .width(this.width - this.leftMargin - this.rightMargin)
        .height(this.height - this.topMargin - this.bottomMargin);
    
    this.vis = d3.select(selector).selectAll("svg")
        .data(data)
      .enter().append("svg:svg")
        .attr("class", "bullet")
        .attr("width", this.width)
        .attr("height", this.height)
      .append("svg:g")
        .attr("transform", "translate(" + this.leftMargin + ", " + this.topMargin + ")")
        .call(this.chart)
        .on("mouseover", mouseover);
    
    this.t = d3.selectAll("svg.bullet")
        .attr("text-anchor", "end");
    
    this.tip = d3.selectAll("rect.measure");
    
    this.hover_idx = -1;
    
    // hover over bulletchart to view metric value
    function mouseover(d, i) {
      self.hover_idx = i;
      d3.selectAll("text.tip")
        .attr("fill", function(d, i) { return self.hover_idx==i? self.hover_label_color : "none"; });
      d3.selectAll("rect.measure")
        .attr("stroke", function(d, i) { return self.hover_idx==i? "#FFF" : "none"; })
        .attr("stroke-width", "2px");
      self.hover_idx = -1;
    }
    
    if(this.title) {
      this.addTitle();
    }
    
    if(this.subtitle) {
      this.addSubTitle();
    }
    
    if(this.hover_events) {
      this.addChartTips();
    }
  }
  
  , addTitle: function() {
    this.t.append("svg:text")
        .attr("class", "title")
        .attr("transform", "translate(" + this.leftMargin*.95 + ", " + (this.height - this.topMargin - this.bottomMargin) / 2 + ")")
        .text(function(d) { return d.title; });
  }
  
  , addSubTitle: function() {
    this.t.append("svg:text")
        .attr("class", "subtitle")
        .attr("transform", "translate(" + this.leftMargin*.95 + ", " + (this.height - this.topMargin - this.bottomMargin) / 2 + ")")
        .attr("dy", "1em")
        .text(function(d) { return d.subtitle; });
  }
  
  , addChartTips: function() {
    this.t.append("svg:text")
        .attr("class", "tip")
        .attr("dy", ".8em")
        .attr("transform", function(d) {
          return "translate(" + (self.leftMargin + (self.width - self.leftMargin - self.rightMargin) / d.ranges[d.ranges.length - 1] * d.measures[0])
            + ", " + (self.height - self.topMargin - self.bottomMargin) / 2 + ")";
        })
        .text(function(d) { return d.measures[0]; })
        .attr("fill", "none");
  }
  
});
