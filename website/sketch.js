class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var points = [];
var Trdr = "";
var res = false;

function setup() {
  let screen;
  screen = createCanvas(windowWidth*45/100, 500);
  screen.parent("scriptContainer");
  screen.mousePressed(pushPointOnlyIfItIsOnScreen);


  // Put setup code here
  fill("black");
  textSize(40);
}

function draw() {
  // Put drawings here
  background(200);
  for (i in points) {
    ellipse(points[i].x, points[i].y, 4, 4);
  }
  text("Click 3 times", 30, 50);
  if (res) {
    text(Trdr, 30, 100);
  }
}

function pushPointOnlyIfItIsOnScreen() {
  points.push(new Point(mouseX, mouseY));
  if (points.length === 3) {
    var turn_direction = indicateTurnDirection(points[0], points[1], points[2]);
    Trdr = turn_direction;
    res = true;
    points = [];
  }
}

function indicateTurnDirection(a, b, c) {
  var pivot_l1c1 = a.x * (b.y - c.y);
  var pivot_l1c2 = -1 * a.y * (b.x - c.x);
  var pivot_l1c3 = b.x * c.y - b.y * c.x;
  var norme = pivot_l1c1 + pivot_l1c2 + pivot_l1c3;
  if (norme < 0) {
    // 0 is on top left
    return "Left Turn";
  } else if (norme === 0) {
    return "Aligned";
  } else {
    return "Right Turn";
  }
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
