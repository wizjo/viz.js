//$(function($) {
  var RectangleChart = Chart.extend({
    init: function(selector, data, options) {
      this._super(selector, options);
      var self = this;
      

  
      //if (Raphael.svg) {
       // this.vis = d3.select(selector)
        //    .append("svg:svg")
         //   .attr("width", this.width)
          //  .attr("height", this.height);
      //} else {
        this.paper = Raphael(jQuery(selector)[0], this.height, this.width);
      //}
      
      this.g = this.createGroup();

      //this.g = this.vis.append("svg:g")
      //    .attr("transform", "translate(" + this.margin + ", " + this.margin + ")");
      

      this.addToGroup(this.g, "rect")
          .attr('width', 50)
          .attr('height', 50);

      this.g.translate(this.margin, this.margin);//"transform", "translate(" + this.margin + ", " + this.margin + ")");


//      this.g.append("svg:rect")
 //         .attr('width', 50)
  //        .attr('height', 50)
          
    },

    createElement: function(type) {
      return this.paper[type]();// : this.vis.append("svg:"+type);
    },

    createGroup: function() {
      return this.paper.set();// : this.vis.append("svg:g");
    }, 

    addToGroup: function(group, type) {
      return group.push(this.createElement(type));// : group.append("svg:"+type);
    },
  });
//});
