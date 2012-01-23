/*
data = [
  {"label":"Web", "value":76.16}, 
  {"label":"Desktop", "value":16.81}, 
  {"label":"Mobile", "value":4.27}, 
  {"label":"Other", "value":2.72}, 
  {"label":"Sharepoint", "value":0.03} ];
*/

var PieChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup
    this.width = this.width || 480;
    this.height = this.height || 480;
    this.leftMargin = this.leftMargin || 10;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 10;
    this.bottomMargin = this.bottomMargin || 10;
    
    this.title = this.title || false;
    this.fill = this.fill || d3.scale.category10();
    
    this.innerRad = this.innerRad || 0;
    this.outerRad = options.outerRad || (d3.min([this.width, this.height]))/2;
    
    // Actual vis

    this.vis = d3.select(selector).selectAll("svg")
        .data([data])
      .enter().append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height)
      .append("svg:g")
        .attr("transform", "translate(" + this.width/2 + ", " + this.height/2 + ")")
    .selectAll("g.slice")
        .data(d3.layout.pie().value(function(d){ return d.value }))
        .enter()
          .append("svg:g")
            .attr("class","slice")
            .attr("fill-opacity", function(d, i) { return (1 - i*.25)>0? (1 - i*.25) : .1; })
          .append("svg:path")
            .attr("fill",function(d, i) { return self.fill(i);})
            .attr("d",d3.svg.arc().outerRadius(this.outerRad));
  }
});
