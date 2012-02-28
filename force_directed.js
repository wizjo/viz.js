var ForceDirected = Chart.extend({
  init: function(selector, data, options) {
    this._super(selector, options);
    var self = this;
    
    // Setup - Dimensions
    this.width = this.width || 1200;
    this.height = this.height || 1000;
    this.leftMargin = this.leftMargin || 10;
    this.rightMargin = this.rightMargin || 10;
    this.topMargin = this.topMargin || 10;
    this.bottomMargin = this.bottomMargin || 10;
    
    this.minWidthValue = this.minWidthValue || d3.min( $.map(data.links, function(d){ return d.value }) );
    this.maxWidthValue = this.maxWidthValue || d3.max( $.map(data.links, function(d){ return d.value }) );
    this.width_s = d3.scale.linear().domain([this.minWidthValue, this.maxWidthValue]).range([this.minEdgeWidth, this.maxEdgeWidth]);
    
    if(this.borderScale) {
      this.minBorderValue = this.minBorderWidth || d3.min( $.map(data.nodes, function(d){ return d.border_width }) );
      this.maxBorderValue = this.maxBorderWidth || d3.max( $.map(data.nodes, function(d){ return d.border_width }) );
      this.border_s = d3.scale.linear().domain([this.minBorderValue, this.maxBorderValue]).range([this.minBorderWidth, this.maxBorderWidth]);
    }
    
    this.minSizeValue = this.minSizeValue || d3.min( $.map(data.nodes, function(d){ return d.size }) );
    this.maxSizeValue = this.maxSizeValue || d3.max( $.map(data.nodes, function(d){ return d.size }) );
    this.size_s = d3.scale.linear().domain([this.minSizeValue, this.maxSizeValue]).range([this.minNodeRadius, this.maxNodeRadius]);
    
    this.nodeFill = this.nodeFill || d3.scale.category20b();
    this.edgeColor = this.edgeColor || d3.scale.category20b();
    
    this.vis = d3.select(selector)
        .attr("class", "force_directed")
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height);
    
    this.force = d3.layout.force()
        .gravity(.8)
        .charge(-200)
        .distance(d3.min([this.width, this.height]) / 2)
        .nodes(data.nodes)
        .links(data.links)
        .size([this.width - this.leftMargin - this.rightMargin, this.height - this.topMargin - this.bottomMargin])
        .start();
    
    this.links = this.vis.selectAll("link")
        .data(data.links);
    this.nodes = this.vis.selectAll("g.node")
        .data(data.nodes);
    
    this.drawNodesLinks();
  }
  
  , drawNodesLinks: function() {
    self = this;
    /* edges first. so that it won't float atop circles. */
    this.links
      .enter().append("svg:path")
        .attr("stroke-width", function(d){ return self.width_s(d.value); })
        .attr("stroke", function(d){ return self.edgeColor(d); })
        .attr("stroke-opacity", 0.6)
        .attr("fill", "none")
        .attr("d", function(d) {
          // TODO: Making edge type an option
          return "M"+d.source.x+","+d.source.y
                 + " Q"+(d.source.x+d.target.x)/2+","+(d.source.size >= d.target.size ? d.source.y+10:d.target.y-10)
                 + " "+d.target.x+","+d.target.y; 
        });

    /* abstract nodes. to further appened visual attributes. */
    this.nodes
      .enter().append("svg:g")
        .attr("class", "node")
        .call(this.force.drag);

    /* nodes fill color. */
    this.nodes.append("svg:circle")
        .attr("r", function(d){ return self.size_s(d.size); })
        .attr("fill", function(d){ return self.nodeFill(d); })
        .attr("opacity", 0.8);

    /* node labels. */
    this.nodes.append("svg:text")
        .attr("class", "name")
        .text(function(d) { return d.name; });

    /* value labels, shown when mouseover */
   this.nodes.append("svg:text")
        .attr("class", "value")
        .attr("text-anchor", "middle")
        .attr("dy", "-.3em")
        .attr("fill", "none")
        .text(function(d) { return d.size; });
    
    // Fade-in effect on load
    this.vis.style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    
    // Drag behavior
    // TODO: making edge type an option
    this.force.on("tick", function() {
      self.links.attr("d", function(d) {
        return "M"+d.source.x+","+d.source.y
               + " Q"+(d.source.x+d.target.x)/2+","+(d.source.size >= d.target.size ? d.source.y+10:d.target.y-10)
               + " "+d.target.x+","+d.target.y;
      });
      self.nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
  }
  
});