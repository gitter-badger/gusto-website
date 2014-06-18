var width = $(document).width(),
  height = $(document).height(),
  aspect = width / height,
  scrollPos = $(window).scrollTop(),
  windowWidth = $(window).width(),
  windowHeight = $(window).height(),
  $stateIndicator = $('.state-indicator'),
  $svg = $('#trail');

$(document).foundation();

$(document).ready(function() {
  if(getMediaQuery() != "small")
    d3Lines();

  if(location.hash.length > 1)
    scrollToPos(location.hash);
});

$(window).scroll(function() {
  scrollPos = $(window).scrollTop();
});

$(window).resize(function() {
  width = $(document).width();
  height = $(document).height();
  aspect = width / height;
  scrollPos = $(window).scrollTop();
  windowWidth = $(window).width();
  windowHeight = $(window).height();

  $svg = $('#trail');

  if(getMediaQuery() != "small" && $svg.length != 1)
    d3Lines();
  else if(getMediaQuery() == "small")
    $svg.remove();
});

// Add capitalize to strings
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

// Get the current media query
function getMediaQuery() {
	var level = parseInt($stateIndicator.css('z-index'));

	if(level > 0 && level <= 2)
		return "small";
	else if(level > 2 && level <= 4)
		return "medium";
	else
		return "large";
}

// Scroll to a section on a page in an optional amount of time
function scrollToPos(id, time) {
	if(time == undefined)
		time = 500;
	else
		time = time;

	$('html, body').animate({
		scrollTop: $(id).offset().top - 50
	}, time, 'swing', function() {
    window.location.hash = id;
  });
}

$('[data-section]').waypoint(function() {
  var id = $(this).attr('id');

  history.pushState(null, "Gusto is " + id, "#" + id);

  document.title = "Gusto is " + id.replace(/-/g, ' ').capitalize() + " | Build your idea with Gusto";
}, {
  offset: function() {
    if($(this).index() > 0)
      return 50;
    else
      return 0
  }
});

new WOW().init();

// Draw d3 paths
function d3Lines() {
  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "trail");

  $svg = $('#trail');

  var points = [];

  $('[data-stop]').each(function() {
    var $elem = $(this);
    var value = $elem.attr('data-stop');

    var positions = value.split(',');

    $.each(positions, function(index, value) {
      var hyphenPos = value.indexOf('-'),
        xAxis = value.substring(hyphenPos + 1),
        yAxis = value.substring(0, hyphenPos),
        offset = $elem.offset(),
        width = $elem.outerWidth(),
        height = $elem.outerHeight(),
        stop = [];

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

        function angleCoord(angle) {
          return [centerX + (radius * Math.sin(angle)), centerY + (radius * Math.cos(angle))];
        }

        if(value === "left-circle") {
          points.push(
            angleCoord(-90),
            angleCoord(-45),
            angleCoord(0),
            angleCoord(45),
            angleCoord(90),
            angleCoord(135),
            angleCoord(180),
            angleCoord(225),
            angleCoord(270)
          );
        }
        else if(value === "right-circle") {
          points.push(
            angleCoord(90),
            angleCoord(45),
            angleCoord(0),
            angleCoord(-45),
            angleCoord(-90),
            angleCoord(-135),
            angleCoord(-180),
            angleCoord(-225),
            angleCoord(-270)
          );
        }
      }
    });
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
  function drawLineNode() {
    var line = path2[0][0],
      pathLength = line.getTotalLength(),
      maxScrollTop = height - windowHeight,
      percentDone = scrollPos / maxScrollTop,
      length = percentDone * pathLength,
      difference = (scrollPos + (windowHeight / 2)) - line.getPointAtLength(length).y,
      multiplier = 0.75,
      newLength = length + (multiplier * difference);

    // Give a multiplier of 1 immediately catch up to the center of the page
    line.style.strokeDasharray = [newLength, pathLength].join(' ');

    var newPosition = line.getPointAtLength(newLength);

    // Give the node its proper placement
    node.attr("cx", newPosition.x).attr("cy", newPosition.y);
  }

  // Call it for the first time
  drawLineNode();

  $(window).scroll(_.throttle(function() {
    drawLineNode();
  }, 10)).resize(_.throttle(function() {
    svg.attr("width", windowWidth).attr("height", height);
  }, 10));
}
