var RectangleChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + this.margin + ", " + this.margin + ")");
    
    this.g.append("svg:rect")
        .attr('width', 50)
        .attr('height', 50)
  }
});
