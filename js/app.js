// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

var width = $(document).width();
var height = $(document).height();
var aspect = width / height;
var scrollPos = $(window).scrollTop();
var windowWidth = $(window).width();
var windowHeight = $(window).height();

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "trail");

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

var node = svg.append("circle")
  .attr("id", "node")
  .attr("r", 12)
  .attr("cx", 0)
  .attr("cy", 0);

// This animates our line down the page
// Ensure that the length of the line is the same as the length of the page!
function drawLineNode(line, node, scrollPos) {
  var pathLength = line.getTotalLength(),
    maxScrollTop = height - windowHeight,
    percentDone = scrollPos / maxScrollTop,
    length = percentDone * pathLength,
    difference = (scrollPos + (windowHeight / 2)) - line.getPointAtLength(length).y,
    multiplier = 0.5,
    newLength = length + (multiplier * difference);

  // Give a multiplier of 1 immediately catch up to the center of the page
  line.style.strokeDasharray = [newLength, pathLength].join(' ');

  var newPosition = line.getPointAtLength(newLength);

  // Give the node its proper placement
  node.attr("cx", newPosition.x).attr("cy", newPosition.y);
}

// Call it for the first time
drawLineNode(path2[0][0], node, scrollPos);

// Call things when we scroll
$(window).scroll(function() {
  scrollPos = $(window).scrollTop();

  drawLineNode(path2[0][0], node, scrollPos);
});

$(window).resize(function() {
  width = $(document).width();
  height = $(document).height();
  aspect = width / height;
  scrollPos = $(window).scrollTop();
  windowWidth = $(window).width();
  windowHeight = $(window).height();

  svg.attr("width", windowWidth).attr("height", height);
});
