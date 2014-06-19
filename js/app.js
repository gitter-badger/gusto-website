var $footer = $('#footer'),
  $stateIndicator = $('.state-indicator'),
  $svg = $('#trail'),
  $timeline = $('#timeline')
  width = $(document).width(),
  height = $footer.offset().top + $footer.outerHeight(true) + 8,
  aspect = width / height,
  scrollPos = $(window).scrollTop(),
  windowWidth = $(window).width(),
  windowHeight = $(window).height();

$(document).foundation();

$(document).ready(function() {
  if(getMediaQuery() != "small")
    d3NodePaths();

  if(location.hash.length > 1)
    scrollToPos(location.hash);

  companyTimeline();
  companyTimelineHeight();

  $('[data-section]').waypoint(function() {
    var id = $(this).attr('id');

    history.pushState(null, "", "#" + id);

    if(id !== "gusto")
      document.title = "Gusto is " + id.replace(/-/g, ' ').capitalize() + " | Build your idea with Gusto";
    else
      document.title = "We are " + id.replace(/-/g, ' ').capitalize() + " | Build your idea with Gusto";
  }, {
    offset: function() {
      if($(this).index() > 0)
        return 50;
      else
        return 0
    }
  });

  $('.animated').waypoint(function(direction) {
    var enterClass = $(this).attr('data-enter');
    var exitClass = $(this).attr('data-exit');

    if(!$(this).hasClass('company')) {
      if(direction === "down")
        $(this).removeClass(exitClass).addClass(enterClass);
      else
        $(this).removeClass(enterClass).addClass(exitClass);
    }
    else
      $(this).removeClass(exitClass).addClass(enterClass);
  }, { offset: '100%' }).waypoint(function(direction) {
    var enterClass = $(this).attr('data-enter');
    var exitClass = $(this).attr('data-exit');

    if(!$(this).hasClass('company')) {
      if(direction == "down")
        $(this).removeClass(enterClass).addClass(exitClass);
      else
        $(this).removeClass(exitClass).addClass(enterClass);
    }
    else
      $(this).removeClass(exitClass).addClass(enterClass);
  });
});

$(window).scroll(function() {
  scrollPos = $(window).scrollTop();
});

$(window).resize(function() {
  width = $(document).width();
  height = $footer.offset().top + $footer.outerHeight(true);
  aspect = width / height;
  scrollPos = $(window).scrollTop();
  windowWidth = $(window).width();
  windowHeight = $(window).height();

  $svg = $('#trail');

  if(getMediaQuery() != "small" && $svg.length != 1)
    d3NodePaths();
  else if(getMediaQuery() == "small")
    $svg.remove();

  companyTimelineHeight(height);
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

function companyTimeline() {
  $('[data-company]').each(function(index) {
    var info = $(this).attr('data-company'),
      comma = info.indexOf(','),
      colorClass = info.substring(0, comma),
      date = info.substring(comma + 1);

    $timeline.append($('<div>')
      .addClass("company animated " + colorClass)
      .attr("data-enter", "fadeInLeft")
      .attr("data-exit", "fadeOutLeft")
      .append($('<p>')
        .addClass("date")
        .html(date)
        .css("left", index * -10)
      )
    );
  });
}

function companyTimelineHeight() {
  $timeline.css("height", height);

  $('[data-company]').each(function() {
    var info = $(this).attr('data-company'),
      company = info.substring(0, info.indexOf(','))

    $timeline.find('.' + company).css("margin-top", $(this).offset().top).css("height", height - $(this).offset().top);
  });
}

// Draw d3 paths
function d3NodePaths() {
  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "trail");

  $svg = $('#trail');

  var points = [];

  function setPoints() {
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
  }

  setPoints();

  var line = d3.svg.line()
    .interpolate("basis");

  var group = svg.append("g")
    .attr("id", "trail-hold");

  var path1 = group.append("path")
    .datum(points)
    .attr("id", "gray-path")
    .attr("class", "line animated fadeIn")
    .attr("d", line);

  var path2 = group.append("path")
    .datum(points)
    .attr("id", "red-path")
    .attr("class", "line")
    .attr("d", line);

  var node = group.append("circle")
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
  }, 10)).resize(_.debounce(function() {
    points = [];
    setPoints();

    path1.datum(points).attr("d", line);
    path2.datum(points).attr("d", line);

    drawLineNode();
  }, 100));
}
