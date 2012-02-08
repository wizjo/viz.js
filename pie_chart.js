/*
var data = { 
  series1: [ {"label":"Web", "value":76.16}, {"label":"Desktop", "value":16.81}, 
    {"label":"Mobile", "value":4.27}, {"label":"Other", "value":2.72}, {"label":"SharePoint", "value":0.03} ],
  series2: [ {"label":"Web", "value":36.16}, {"label":"Desktop", "value":26.81}, 
    {"label":"Mobile", "value":14.27}, {"label":"Other", "value":2.72}, {"label":"SharePoint", "value":10.03} ]
  };
*/

var PieChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup
    this.leftMargin = this.leftMargin || 10;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 10;
    this.bottomMargin = this.bottomMargin || 10;
    
    this.fill = this.fill || d3.scale.category10();
    this.innerRadiusRatio = this.innerRadiusRatio || 0;
    this.outerRadius = options.outerRadius || 200;
    this.arc = this.arc || d3.svg.arc().innerRadius(this.innerRadiusRatio * this.outerRadius).outerRadius(this.outerRadius);
    this.highlight = this.highlight || d3.svg.arc().innerRadius(this.outerRadius).outerRadius(this.outerRadius + 8);
    this.highlight_color = this.highlight_color || "#AEAEAE";
    this.formatter = this.formatter || ".2f";
    
    this.vis = d3.select(selector)
        .attr("class", "pie_chart");
    
    this.hover_idx = -1;
    
    // Get the keys for each PieChart in the small multiples
    var pies = $.map(data, function(values, key){ return [key]; })
    
    // Draw pies
    $.each(pies, function(i, d){
      var value = data[d];
      self.addPie(i, d, value);
      
      // Tipsy style mouseover
      $(selector+' path.slice').tipsy({
        gravity: 'sw', 
        title: function() {
          var d = this.__data__;
          var i = $.inArray(d.value, $.map(value, function(d){ return d.value; }));
          var labels = $.map(value, function(d){ return d.label; })
          return labels[i] + ": " + d3.format(self.formatter)(d.value);
        }
      });
    })
  }
  
  , addPie: function(i, key, value){
    var self = this;
    
    // The container
    var g = this.vis
        .append("svg:svg")
        .attr("class", "svg " + key)
        .attr("width", this.leftMargin + this.rightMargin + 2 * this.outerRadius)
        .attr("height", this.topMargin + this.bottomMargin + 2 * this.outerRadius)
        .append("svg:g")
        .attr("class", "pie " + key)
        .attr("transform", "translate(" + (this.leftMargin + this.outerRadius) + ", " + (this.topMargin + this.outerRadius) + ")");
    
    // Draw each slice
    g.selectAll("path.slice")
        .data(function() { var data = $.map(value, function(d){ return d.value; }); return d3.layout.pie()(data); })
      .enter().append("svg:path")
        .attr("class", "slice")
        .attr("d", this.arc)
        .attr("fill", function(d, i){ return self.fill(i); })
        .on("mouseover", function(d, i){
          self.hover_idx = i;
          g.selectAll("path.highlight")
              .attr("fill", function(d, i){ return self.hover_idx == i? self.highlight_color : "none"; });
          self.idx = -1;
        })
        .on("mouseout", function(){
          g.selectAll("path.highlight")
              .attr("fill", "none");
        });
    
    // Draw highlights
    g.selectAll("path.highlight")
        .data(function() { var data = $.map(value, function(d){ return d.value; }); return d3.layout.pie()(data); })
      .enter().append("svg:path")
        .attr("class", "highlight")
        .attr("d", this.highlight)
        .attr("fill", "none");
    
    // Place labels
    g.selectAll("text.label")
        .data(function() { var data = $.map(value, function(d){ return d.value; }); return d3.layout.pie()(data); })
      .enter().append("svg:text")
        .attr("class", "label")
        .attr("transform", function(d) { return "translate(" + self.arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("display", function(d) { return (d.endAngle - d.startAngle) > Math.PI/6 ? null : "none"; })
        .text(function(d, i) { return d.value; });
  }
});
