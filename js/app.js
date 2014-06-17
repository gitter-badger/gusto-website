// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

$(document).ready(function() {

});

var width = $(document).width();
var height = $(document).height();
var aspect = width / height;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "trail")
  .attr("viewBox", '0 0 ' + width + ' ' + height)
  .attr("preserveAspectRatio", "xMidYMid");

var points = [];

$('[data-stop]').each(function() {
  var value = $(this).attr('data-stop'),
    hyphenPos = value.indexOf('-'),
    xAxis = value.substring(hyphenPos + 1),
    yAxis = value.substring(0, hyphenPos),
    offset = $(this).offset(),
    width = $(this).width(),
    height = $(this).height();

  var stop = [];

  if(value !== "left-circle" && value !== "right-circle") {
    if(xAxis === "left")
      stop.push(offset.left);
    else if(xAxis === "center")
      stop.push(offset.left + (width / 2));
    else if(xAxis === "right")
      stop.push(offset.left + width);

    if(yAxis === "top")
      stop.push(offset.top);
    else if(yAxis === "middle")
      stop.push(offset.top + (height / 2));
    else if(yAxis === "bottom")
      stop.push(offset.top + height);

    points.push(stop);
  }
  else {
    var radius = width / 2,
      centerX = offset.left + (width / 2),
      centerY = offset.top + (height / 2);

    function angleCoord(angle) { return [centerX + (radius * Math.sin(angle)), centerY + (radius * Math.cos(angle))]; }

    if(value === "left-circle")
      points.push(angleCoord(-90), angleCoord(-45), angleCoord(0), angleCoord(45), angleCoord(90), angleCoord(135), angleCoord(180), angleCoord(225));
    else if(value === "right-circle")
      points.push(angleCoord(90), angleCoord(45), angleCoord(0), angleCoord(-45), angleCoord(-90), angleCoord(-135), angleCoord(-180), angleCoord(-225));
  }
});

var line = d3.svg.line()
  .interpolate("basis");

var path1 = svg.append("path")
  .datum(points)
  .attr("id", "gray-path")
  .attr("class", "line")
  .attr("d", line);

var path2 = svg.append("path")
  .datum(points)
  .attr("id", "red-path")
  .attr("class", "line")
  .attr("d", line);

function drawLine(line) {
  var pathLength = line.getTotalLength(),
    maxScrollTop = $(document).height() - $(window).height(),
    percentDone = $(window).scrollTop() / maxScrollTop,
    length = percentDone * pathLength;

  line.style.strokeDasharray = [length, pathLength].join(' ');
}

drawLine(path2[0][0]);
$(window).scroll(function() { drawLine(path2[0][0]); });

$(window).on("resize", function() {
  var targetWidth = $(window).width();

  svg.attr("width", targetWidth)
    .attr("height", targetWidth / aspect);
});
