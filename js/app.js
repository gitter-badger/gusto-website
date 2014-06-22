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
  $('a').on('click', function(event) {
    var link = $(this).attr('href');

    if(link.indexOf('#') != -1) {
      event.preventDefault();

      scrollToPos(link);
    }
  });

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

  new WOW({
    mobile: false
  }).init();

  $('.headturn').on('mousemove', function(event) {
    var width = $(this).width(),
      degrees = width / 5,
      relX = event.pageX - $(this).offset().left;

    if(relX >= 0 && relX < degrees)
      $(this).css('background-position', "0px 0px");
    else if(relX >= degrees * 1 && relX < degrees * 2)
      $(this).css('background-position', (width * -1) + "px 0px");
    else if(relX >= degrees * 2 && relX < degrees * 3)
      $(this).css('background-position', (width * -2) + "px 0px");
    else if(relX >= degrees * 3 && relX < degrees * 4)
      $(this).css('background-position', (width * -3) + "px 0px");
    else
      $(this).css('background-position', (width * -4) + "px 0px");
  }).on('mouseleave', function() {
    var width = $(this).width();

    $(this).css('background-position', (width * -2) + "px 0px");
  });

  d3StatGraphs();

  d3PongGame();

  $('#contact-form').on('submit', function(event) {
    event.preventDefault();

    var $name = $(this).find('[name=name]'),
      $email = $(this).find('[name=email]'),
      $message = $(this).find('[name=message]'),
      $submit = $(this).find('[name=submit]');

      $.ajax({
        type: "POST",
        url: "https://mandrillapp.com/api/1.0/messages/send.json",
        data: {
          "key": "ZeY-CdysVOD7M47CJYPkSQ",
          "message": {
            "from_email": $email.val(),
            "from_name": $name.val(),
            'headers': {
              'Reply-To': $email.val()
            },
            "to": [
                {
                  "email": "contact@gusto.is",
                  "name": "Gusto",
                  "type": "to"
                }
              ],
            "autotext": "true",
            "subject": "Talk with Gusto",
            "text": $message.val()
          }
        }
      }).done(function(response) {
        $name.val('');
        $email.val('');
        $message.val('');
     });
  });
});

$(window).load(function() {
  if(getMediaQuery() != "small")
    d3NodePaths();

  $(window).trigger('resize');
}).scroll(function() {
  scrollPos = $(window).scrollTop();
}).resize(function() {
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

  companyTimelineHeight();
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
      .addClass("company wow fadeInLeft " + colorClass)
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

function d3StatGraphs() {
  $('.stat-graphs').each(function() {
    $(this).children('li').each(function(index) {
      var $elem = $(this),
        width = $elem.width(),
        height = width,
        radius = Math.min(width, height) / 2;

      $elem.css("height", height + 100);

      var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

      var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.val; });

      var theValue = +$elem.attr('data-value'),
        remainder = 100 - theValue,
        data = [{ val: theValue }, { val: remainder }];

      var svg = d3.select(this).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "graph-" + (index + 1))
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

      g.append("path")
        .attr("d", arc);

      $elem.append($('<p>').html($elem.attr('data-label')));

      $(window).resize(_.throttle(function() {
        width = $elem.width();
        height = width;

        $elem.css("height", height + 100);
        $elem.find('svg').attr("width", width).attr("height", height);
      }, 10));
    });
  });
}

function d3PongGame() {
  var width = $(window).width() * 0.9,
    height = 500;

  var svg = d3.select('#pong').append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMidYMid");

  var $pong = $('#pong svg'),
    selected = false,
    paddleSpeed = 5,
    iterations = 0,
    radius = 12,
    actualRadius = radius + 4,
    score = { user: 0, gusto: 0 };

  var rectWidth = 10,
    rectHeight = 60,
    rectDistance = 10;

  var rect = svg.append("rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("rx", 5)
    .attr("ry", 5);

  var myRect = svg.append("rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("rx", 5)
    .attr("ry", 5);

  var instructionsText = svg.append("text")
    .attr("x", 40)
    .attr("y", height - 20)
    .attr("class", "instructions")
    .text("W = Up / S = Down");

  var scoreText = svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 60)
    .attr("class", "score")
    .attr("text-anchor", "middle");

  var rulesText = svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 20)
    .attr("class", "rules")
    .attr("text-anchor", "middle")
    .text("First to 3 games");

  var ball = svg.append("circle")
    .attr("r", radius);

  $pong.parent().append($('<div>')
    .addClass('modal')
  ).append($('<p>')
    .addClass('button radius secondary')
    .text('Let\'s play some pong!')
  );

  function resetPositions() {
    rect.attr("x", width - rectDistance)
      .attr("y", (height / 2) - (rectHeight / 2));

    myRect.attr("x", rectDistance)
      .attr("y", (height / 2) - (rectHeight / 2));

    ball.attr("cx", (width / 2))
      .attr("cy", (height / 2));
  }

  function setScore(account) {
    if(account == "user" && score.user + 1 <= 3)
      score.user++;
    else if(account == "gusto" && score.gusto + 1 <= 3)
      score.gusto++;

    scoreText.text(score.user + " - " + score.gusto);

    resetPositions();
    iterations = 0;

    if(score.user == 3 || score.gusto == 3) {
      killGame();

      if(score.user == 3)
        $pong.parent().next().find('h4').text('Very good, Young Pongawan!');
      else if(score.gusto == 3)
        $pong.parent().next().find('h4').text('Did you find the keyboard?');

      $pong.fadeOut(500, function() {
        $(this).parent().next().addClass('winner');

        $(window).trigger('resize');
      })
    }
  }

  function changeDirection(x, y) {
    ball.attr("dx", x).attr("dy", y);
  }

  function checkCollisions() {
    var x = parseInt(ball.attr("cx")),
      y = parseInt(ball.attr("cy")),
      myRectX = parseInt(myRect.attr("x")),
      myRectY = parseInt(myRect.attr("y")),
      rectX = parseInt(rect.attr("x")),
      rectY = parseInt(rect.attr("y")),
      dx = parseInt(ball.attr("dx")),
      dy = parseInt(ball.attr("dy"));

    // Paddles
    if((x <= myRectX + rectWidth + actualRadius && (y >= myRectY - actualRadius && y <= myRectY + rectHeight + actualRadius)) ||
      (x >= rectX - actualRadius && (y >= rectY - actualRadius && y <= rectY + rectHeight + actualRadius)))
      changeDirection(-1 * dx, dy);

    // Top and bottom borders
    if(y <= actualRadius || y >= height - actualRadius)
      changeDirection(dx, -1 * dy);

    // Score!
    if(x <= actualRadius)
      setScore("gusto");
    else if(x >= width - actualRadius)
      setScore("user");
  }

  function moveBall() {
    ball.attr("cx", parseInt(ball.attr("dx")) + parseInt(ball.attr("cx")))
      .attr("cy", parseInt(ball.attr("dy")) + parseInt(ball.attr("cy")));
  }

  // Because it's pretty dumb
  function artificialStupidity() {
    iterations++;

    if(iterations % 3 == 0) {
      var ballX = parseInt(ball.attr("cx")),
        ballY = parseInt(ball.attr("cy")),
        currentPos = parseInt(rect.attr("y")),
        newY;

      if(ballY - actualRadius >= currentPos)
        newY = currentPos + paddleSpeed;
      else
        newY = currentPos - paddleSpeed;

      if(newY >= 0 && newY + rectHeight <= height)
        rect.attr("y", newY);
    }
  }

  function loop() {
    if(ready) {
      moveBall();
      checkCollisions();
      artificialStupidity();
    }
  }

  function killGame() {
    clearInterval(game);
    game = 0;
  }

  var ready = false,
    game = setInterval(loop, 5);

  resetPositions();
  setScore();
  changeDirection(-2, -2);

  $pong.parent().find('.button').on('click', function() {
    $pong.parent().find('.modal, .button').fadeOut(500, function() {
      ready = true;
    });
  });

  $pong.on("mouseenter", function() {
    selected = true;
  }).on("mouseleave", function() {
    selected = false;
  });

  d3.select("body").on("keydown", function() {
    if(selected) {

      var myPaddleSpeed = paddleSpeed * 2;

      if(d3.event.keyCode == 87) {
        var currentY = parseInt(myRect.attr("y"));

        if(currentY - myPaddleSpeed >= 0)
          myRect.attr("y", currentY - myPaddleSpeed);
      }
      else if(d3.event.keyCode == 83) {
        var currentY = parseInt(myRect.attr("y"));

        if(currentY + rectHeight + myPaddleSpeed <= height)
          myRect.attr("y", currentY + myPaddleSpeed);
      }
    }
  });
}
