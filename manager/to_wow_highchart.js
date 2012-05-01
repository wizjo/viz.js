VizJs.toWowHighChart = function(data, column) {
  var series = [];
  var time_ids = $.map(data.results, function(d, i){
    // Better cast timestamps to integers already
    return new Date(d["time_id"]).valueOf();
  })
  var values = $.map(data.results, function(d, i){
    return d[column];
  })
  
  var weeks = [0, 1, 4];
  for(i=0; i < weeks.length; i++){
    var data = [];
    $.map(time_ids, function(time_id, idx){
      if(idx - weeks[i]*7*24 >= 0){ data.push([time_id, values[idx - weeks[i]*7*24]]) }
    })
    
    series.push( {name: (i==0? "current": i + " week" + (i>1? "s":"") + " ago"), data: data} );
  }
  
  return series;
}