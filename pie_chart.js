/*

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

    this.background_color = this.background_color || "#fff";
    
    this.title = this.title || false;
    this.fill = this.fill || d3.scale.category10();
    
    this.innerRad = this.innerRad || 0;
    this.outerRad = options.outerRad || (d3.min(this.width,this.height))/2;
    
    // Actual vis

    this.vis = d3.select(selector).selectAll("svg")
        .data([data])
      .enter().append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("background-color", this.background_color)
      .append("svg:g")
        .attr("transform", "translate(" + this.outerRad + ", " + this.outerRad + ")")
    .selectAll("g.slice")
        .data(d3.layout.pie().value(function(d) {return d.value;})) // d is an element of the data array, 
                                                                    // so change this to call d.whatever
        .enter()
          .append("svg:g")
            .attr("class","slice")
            //.attr("fill-opacity", function(d, i) { return (1 - i*.25)>0? (1 - i*.25) : .1; })
          .append("svg:path")
            .attr("fill",function(d, i) { return self.fill(i);})
            .attr("d",d3.svg.arc().outerRadius(this.outerRad));
  }
});
