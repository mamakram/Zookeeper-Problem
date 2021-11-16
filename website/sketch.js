/* eslint-disable no-undef, no-unused-vars */

const polyDaizaPoints = [
  [33, 245],
  [39, 305],
  [106, 306],
  [108, 243],
  [162, 379],
  [71, 382],
  [142, 465],
  [550, 464],
  [547, 385],
  [453, 382],
  [416, 421],
  [363, 341],
  [316, 404],
  [318, 266],
  [444, 238],
  [436, 326],
  [576, 319],
  [576, 190],
  [280, 176],
  [265, 283],
  [186, 280],
  [172, 175],
  [85, 187]
];
var polyDaiza;
var borderCount = 0; //number of selected border points for cage creation
var tempPolygon;

//TODO: When placing A and B on polygon, compute reflection of point on polygon instead of current method

class Point {
  constructor(x, y, label = "") {
    this.x = x;
    this.y = y;
    this.label = label;
    this.segmentOnPolygon = null;
  }
}

class Polygon {
  constructor(points) {
    this.points = points;
  }

  isInside(p) {
    console.log("hello");
    //check if point in Polygon, if true stores first intersection in point.intersection
    let isInside = false;
    let intersections = this.rayPolygon(p, new Point(p.x + 50, p.y));
    isInside = Number(intersections.length) % 2 === 1;
    console.log(isInside);
    return isInside;
  }

  rayPolygon(a, b) {
    //return array containing all intersections of ray ab with polygon p, first intersection is first in array
    var intersections = [];
    for (let i = 0; i < this.points.length; i++) {
      if (
        checkRayIntersection(
          a,
          b,
          this.points[i],
          this.points[(i + 1) % this.points.length]
        )
      ) {
        let segment = [
          this.points[i],
          this.points[(i + 1) % this.points.length]
        ];
        if (
          intersections.length === 0 ||
          isSegmentBefore(
            a,
            segment[0],
            segment[1],
            intersections[0][0],
            intersections[0][1]
          )
        )
          intersections.unshift(segment);
        else intersections.push(segment);
      }
    }
    return intersections;
  }

  draw() {
    for (let i = 0; i < this.points.length; i++) {
      drawSegment(this.points[i], this.points[(i + 1) % this.points.length]);
    }
  }
}

class Zoolygon extends Polygon {
  constructor(points) {
    super(points);
    this.cages = [];
  }

  addCage(cage) {
    this.cages.push(cage);
  }
  getCage(index) {
    return this.cageList[index];
  }
  getLastCage() {
    return this.cages[this.cages.length - 1];
  }

  drawCages() {
    for (let i = 0; i < polyDaiza.cages.length; i++) polyDaiza.cages[i].draw();
  }

  reset() {
    this.cages = [];
  }
}

class Cage {
  constructor() {
    this.polyChainPoints = [];
    this.inConstruction = true;
    this.points = [];
  }

  createPolyChain() {
    let A = this.polyChainPoints[0];
    let B = this.polyChainPoints[1];
    // if A is on a segment after B in counterclockwise order -> swap A and B
    if (A.segmentOnPolygon === B.segmentOnPolygon) {
      if (
        squareDistance(A, polyDaiza.points[A.segmentOnPolygon]) >
        squareDistance(B, polyDaiza.points[A.segmentOnPolygon])
      )
        this.polyChainPoints = [B, A];
      return;
    }
    if (A.segmentOnPolygon > B.segmentOnPolygon) {
      this.polyChainPoints = [B, A];
    }

    let cand1 = this.computePolyChain(true);
    let cand2 = this.computePolyChain(false);
    if (cand1.length <= cand2.length) {
      this.polyChainPoints = cand1;
    } else {
      this.polyChainPoints = cand2.reverse();
    }
  }

  computePolyChain(counterClockwise) {
    let A = this.polyChainPoints[0];
    let B = this.polyChainPoints[1];

    let chain = [A];
    let i = A.segmentOnPolygon;
    if (counterClockwise)
      i = (A.segmentOnPolygon + 1) % polyDaiza.points.length;
    let stop = (B.segmentOnPolygon + 1) % polyDaiza.points.length;
    while (i !== stop) {
      console.log("is " + i);
      chain.push(polyDaiza.points[i]);
      if (counterClockwise) {
        i = (i + 1) % polyDaiza.points.length;
      } else {
        i = mod(i - 1, polyDaiza.points.length);
      }
    }
    if (!counterClockwise)
      chain.push(
        polyDaiza.points[(B.segmentOnPolygon + 1) % polyDaiza.points.length]
      );
    chain.push(B);

    return chain;
  }

  getPoints() {
    return this.points;
  }

  constructCage() {
    /*
    Based on Graham scan : conceptually, we will do a graham scan on all the points given by the user
    and then connect it to the polygonal chain we've found 
    */
    if (this.points.length > 0) {
      this.points = sortPointsRadially(
        this.points,
        this.polyChainPoints[this.polyChainPoints.length - 1]
      );

      let stack = [
        this.polyChainPoints[this.polyChainPoints.length - 1],
        this.points[0]
      ];
      this.points.push(this.polyChainPoints[0]);
      for (let i = 1; i < this.points.length; i++) {
        while (isRT(stack.slice(-2)[0], stack.slice(-1)[0], this.points[i]))
          stack.pop();
        stack.push(this.points[i]);
      }
      stack.shift();
      stack.pop();
      this.points = this.polyChainPoints.concat(stack);
    } else this.points = this.polyChainPoints;
    this.inConstruction = false;
  }

  getInitialPoint() {
    let minIndex = 0;
    for (let i = 1; i < this.points.length; i++)
      if (this.points[i].x < this.points[minIndex].x) minIndex = i;
    return minIndex;
  }

  draw() {
    if (!this.inConstruction)
      for (let i = 0; i < this.points.length; i++) {
        drawSegment(
          this.points[i],
          this.points[(i + 1) % this.points.length],
          "blue"
        );
        text(i, this.points[i].x, this.points[i].y);
      }
    else {
      for (let i = 0; i < this.polyChainPoints.length; i++) {
        fill(0);
        ellipse(this.polyChainPoints[i].x, this.polyChainPoints[i].y, 4, 4);
        text(
          this.polyChainPoints[i].label,
          this.polyChainPoints[i].x,
          this.polyChainPoints[i].y
        );
      }
      for (let i = 0; i < this.points.length; i++) {
        fill(0);
        ellipse(this.points[i].x, this.points[i].y, 4, 4);
        text(i, this.points[i].x, this.points[i].y);
      }
    }
  }
}

function checkRayIntersection(a, b, c, d) {
  //For 4 points, check for intersection between ray ab and segment cd
  var det1 = isLT(a, b, c);
  var det2 = isLT(a, b, d);

  if (det1 !== det2) {
    var det3 = isLT(c, d, a);
    return (det1 && !det2 && !det3) || (!det1 && det2 && det3);
  }
  return false;
}

function isSegmentBefore(a, c, d, e, f) {
  //return true if segment cd is before ef compared from point a
  if (c.y > d.y) [c, d] = [d, c];
  var det1 = isLT(e, f, a);
  var det2 = isLT(e, f, c);
  var det3 = isLT(e, f, d);
  if (det1 && det2 && det3) return true;
  else if (!det1 && !det2 && !det3) return true;
  else return false;
}

function sortPointsRadially(points, startPoint) {
  //sort radially by comparing to startpoint
  return points.sort(function comparator(A, B) {
    if (isRT(startPoint, A, B)) {
      return 1;
    }

    if (isLT(startPoint, A, B)) {
      return -1;
    }

    return 0;
  });
}

function isOnSegment(A, B, point) {
  let biggerMin = min(A.x, B.x) <= point.x;
  let lowerMax = point.x <= max(A.x, B.x);
  let validX = biggerMin && lowerMax;

  return isAligned(A, B, point) && validX;
}

function isAligned(A, B, Q) {
  let tmp = computeOrientation(A, B, Q);

  if (tmp < 200 && tmp > -200) {
    // approximation //TODO : trouver une meilleure solution
    return true;
  }
  //return computeOrientation(A, B, Q) === 0;
}

function computeOrientation(A, B, Q) {
  let M = [
    [A.x, -A.y, 1],
    [B.x, -B.y, 1],
    [Q.x, -Q.y, 1]
  ];

  return math.det(M);
}

function isRT(A, B, Q) {
  return computeOrientation(A, B, Q) < 0;
}

function isLT(A, B, Q) {
  return computeOrientation(A, B, Q) > 0;
}

function createCage() {
  if (polyDaiza.getLastCage().inConstruction) {
    polyDaiza.getLastCage().constructCage();
    borderCount = 0;
  }
}

function createPolyDaiza() {
  let pointList = [];
  for (let i = 0; i < polyDaizaPoints.length; i++) {
    pointList.push(new Point(polyDaizaPoints[i][0], polyDaizaPoints[i][1], i));
  }
  polyDaiza = new Zoolygon(pointList);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function squareDistance(p1, p2) {
  return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
}

function mousePressed() {
  let labelLst = ["A", "B"];
  let mousePoint = new Point(mouseX, mouseY);
  if (borderCount < 2) {
    mousePoint.label = labelLst[borderCount];
    if (borderCount === 0) polyDaiza.addCage(new Cage());
    for (let i = 0; i < polyDaiza.points.length; i++) {
      let p1 = polyDaiza.points[i];
      let p2 = polyDaiza.points[(i + 1) % polyDaiza.points.length];
      if (isOnSegment(p1, p2, mousePoint)) {
        mousePoint.segmentOnPolygon = i;
        polyDaiza.getLastCage().polyChainPoints.push(mousePoint);
        borderCount++;
      }
    }
    if (borderCount === 2) {
      polyDaiza.getLastCage().createPolyChain();
      tempPolygon = new Polygon(polyDaiza.getLastCage().polyChainPoints);
    }
  } else {
    if (polyDaiza.isInside(mousePoint))
      if (!tempPolygon.isInside(mousePoint))
        polyDaiza.getLastCage().points.push(mousePoint);
  }
}

//                            SETUP
// -------------------------------------------------------------------------

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  //canvas.parent("scriptContainer");
  textSize(15);

  clearBtn = createButton("Clear");
  clearBtn.position(30, 30);
  clearBtn.mousePressed(reset);

  makeCageBtn = createButton("Create a cage using my points");
  makeCageBtn.position(30, 60);
  makeCageBtn.mousePressed(createCage);

  createPolyDaiza();
}

function reset() {
  background(200);
  polyDaiza.reset();
  borderCount = 0;
}

//                             DRAW
// -------------------------------------------------------------------------
function draw() {
  background(200);
  textSize(15);
  if (polyDaiza !== undefined) {
    polyDaiza.draw();
    polyDaiza.drawCages();
  }
  displayMessage();
}

function drawSegment(p1, p2, color = "black") {
  fill(color);
  stroke(color);
  line(p1.x, p1.y, p2.x, p2.y);
  fill("black");
  stroke("black");
}

function displayMessage() {
  if (
    polyDaiza.cages.length === 0 ||
    !polyDaiza.getLastCage().inConstruction ||
    borderCount < 2
  ) {
    text("Please select two points on the borders of the polygon", 400, 100);
  } else {
    text("You can add points and create the cage when finished", 400, 100);
  }
}
// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
