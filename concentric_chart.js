/*
data = {
  var1: 1,
  var2: 0.56,
  var3: 0.25,
  var4: ...
}
*/
var ConcentricChart = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    this.align = this.align || "center"; // available values: "left", "right", "up", "bottom", "center"
    this.margin = this.margin || 5;
    this.fill = this.fill || d3.scale.category10();
    this.rScale = this.rScale || d3.scale.sqrt().domain([0, 1]).range([0, (this.height - 2 * this.margin) / 2.0]);
    
    this.vis = d3.select(selector)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.g = this.vis.append("svg:g")
        .attr("transform", "translate(" + this.margin + ", " + this.margin + ")");

    $.each(data, function(key, value) {
      // self.addCircle(key, Math.sqrt(value * Math.pow(self.height / 2.0, 2)));
      self.addCircle(key, value);
    })
  }

  , addCircle: function(key, value) {
    var self = this;
    this.g.append("svg:circle")
        .attr("class", "circle " + key)
        .attr("cx", function() {
          switch(self.align) {
            case "left":
              return self.rScale(value);
              break;
            case "right":
              return 2 * self.rScale(1) - self.rScale(value);
              break;
            case "center":
              return self.rScale(1);
              break;
            case "up":
              return self.rScale(1);
              break;
            case "down":
              return self.rScale(1);
              break;
            default:
              return self.rScale(1);
              break;
          }
        })
        .attr("cy", function() {
          switch(self.align) {
            case "left":
              return self.rScale(1);
              break;
            case "right":
              return self.rScale(1);
              break;
            case "center":
              return self.rScale(1);
              break;
            case "up":
              return self.rScale(value);
              break;
            case "bottom":
              return 2 * self.rScale(1) - self.rScale(value);
            default:
              return self.rScale(1);
          }
        })
        .attr("stroke", "none")
        .attr("fill", this.fill(key))
        .attr("r", this.rScale(value));
  }
  
});
