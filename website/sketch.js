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
  [570, 190],
  [280, 176],
  [265, 283],
  [186, 280],
  [172, 175],
  [85, 187]
];
var polyDaiza;
var borderCount = 0; //number of selected border points for cage creation
var currentCage;

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
    this.triangulations = [];
  }

  includes(p) {
    for (let i in this.points) if (this.points[i] === p) return true;
    return false;
  }

  isInside(p) {
    //check if point in Polygon, if true stores first intersection in point.intersection
    let isInside = false;
    let intersections = this.rayPolygon(p, new Point(p.x + 50, p.y));
    isInside = Number(intersections.length) % 2 === 1;
    return isInside;
  }

  triangulate(depth = 0) {
    //recursively compute triangulations of a polygon p
    if (this.points.length === 3)
      return new Triangle(this.points[0], this.points[1], this.points[2]);
    else {
      let ear = this.findEar();
      let minusindex = mod(Number(ear) - 1, this.points.length);
      let plusindex = (Number(ear) + 1) % this.points.length;
      let triangle = new Triangle(
        this.points[ear],
        this.points[minusindex],
        this.points[plusindex]
      );
      this.triangulations.push(triangle);
      let newPoints = this.points.slice();
      newPoints.splice(ear, 1);
      let p = new Polygon(newPoints);
      p.triangulate(depth + 1);
      this.triangulations = this.triangulations.concat(p.triangulations);
    }
  }

  isConcaveVertex(i) {
    //check if vertex i of polygon p is concave
    return isRT(
      this.points[mod(i - 1, this.points.length)],
      this.points[i],
      this.points[(i + 1) % this.points.length]
    );
  }

  findEar() {
    //find index of ear in polygon
    let i = 0;
    let earNotFound = true;
    while (earNotFound) {
      if (!this.isConcaveVertex(Number(i))) {
        earNotFound = false;
        let minusindex = mod(Number(i) - 1, this.points.length);
        let plusindex = (Number(i) + 1) % this.points.length;
        //check that no concave vertices inside triangle formed by the three points
        let triangle = new Triangle(
          this.points[i],
          this.points[minusindex],
          this.points[plusindex]
        );
        let j = 0;
        while (j < this.points.length && !earNotFound) {
          if (
            !triangle.includes(this.points[j]) &&
            triangle.isInside(this.points[j], triangle) &&
            this.isConcaveVertex(Number(j))
          )
            earNotFound = true;
          j++;
        }
      }
      if (earNotFound) i = (Number(i) + 1) % this.points.length;
    }
    return i;
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
    for (let i in this.triangulations) this.triangulations[i].draw();
    for (let i = 0; i < this.points.length; i++) {
      drawSegment(this.points[i], this.points[(i + 1) % this.points.length]);
    }
  }
}

class Triangle extends Polygon {
  constructor(a, b, c) {
    super([a, b, c]);
  }
  isInside(p) {
    let p1 = this.points[0];
    let p2 = this.points[1];
    let p3 = this.points[2];
    return (
      (isRT(p1, p2, p) && isRT(p2, p3, p) && isRT(p3, p1, p)) ||
      (isLT(p1, p2, p) && isLT(p2, p3, p) && isLT(p3, p1, p))
    );
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
    console.log(edgeIntersection(polyDaiza, this));
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

function indicateTurnDirection(a, b, c) {
  let norme = computeOrientation(a, b, c);
  if (norme < 0) {
    return 1;
  } else if (norme === 0) {
    return 0;
  } else {
    return -1;
  }
}

function linesIntersect(a, b, c, d) {
  return (
    indicateTurnDirection(a, b, c) * indicateTurnDirection(a, b, d) +
      indicateTurnDirection(c, d, a) * indicateTurnDirection(c, d, b) ===
    -2
  );
}

function edgeIntersection(a_zoolygon, a_cage) {
  let zolyPoints = a_zoolygon.points;
  let cagePoints = a_cage.points;
  for (let i = 0; i < zolyPoints.length; i++) {
    let a = zolyPoints[i];
    let b = zolyPoints[mod(i + 1, zolyPoints.length)];
    for (let j = 0; j < cagePoints.length; j++) {
      let c = cagePoints[j];
      let d = cagePoints[mod(j + 1, cagePoints.length)];
      if (linesIntersect(a, b, c, d)) {
        return true;
      }
    }
  }
  return false;
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
  if (polyDaiza.getLastCage().inConstruction && borderCount === 2) {
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

function solve2eq2unk(a, b, c, d, e, f) {
  let det = a * d - b * c;
  if (det !== 0) {
    let x = (e * d - b * f) / det;
    let y = (a * f - e * c) / det;
    return [x, y];
  } else {
    console.log("ERROR");
  }
}

function reflectionOnLine(a, b, c) {
  let m = (b.y - a.y) / (b.x - a.x);
  let h = b.y - m * b.x;
  let mp = -1 / m;
  let hp = c.y - mp * c.x;
  let res = solve2eq2unk(-1 * m, 1, -1 * mp, 1, h, hp);
  return new Point(res[0], res[1]);
}

function squareDistance(p1, p2) {
  return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
}

function findMinReflection(p) {
  let minPoint = null;
  let minDistance = 300; //minimum distance from point to avoid disasters
  for (let i = 0; i < polyDaiza.points.length; i++) {
    let p1 = polyDaiza.points[i];
    let p2 = polyDaiza.points[(i + 1) % polyDaiza.points.length];
    let current = reflectionOnLine(p1, p2, p);
    current.segmentOnPolygon = i;
    if (checkRayIntersection(p, current, p1, p2)) {
      if (squareDistance(p, current) < minDistance) {
        minDistance = squareDistance(p, current);
        minPoint = current;
      }
    }
  }
  return minPoint;
}

function mousePressed() {
  let labelLst = ["A", "B"];
  let mousePoint = new Point(mouseX, mouseY);
  if (borderCount < 2) {
    mousePoint.label = labelLst[borderCount];
    if (borderCount === 0) polyDaiza.addCage(new Cage());
    let newPoint = findMinReflection(mousePoint);
    if (newPoint !== null) {
      newPoint.label = labelLst[borderCount];
      polyDaiza.getLastCage().polyChainPoints.push(newPoint);
      borderCount++;
    }
    if (borderCount === 2) {
      polyDaiza.getLastCage().createPolyChain();
      currentCage = new Polygon(polyDaiza.getLastCage().polyChainPoints);
    }
  } else {
    if (polyDaiza.isInside(mousePoint))
      if (!currentCage.isInside(mousePoint))
        polyDaiza.getLastCage().points.push(mousePoint);
  }
}

//                            SETUP
// -------------------------------------------------------------------------

function setup() {
  let screen = createCanvas((windowWidth * 45) / 50, (windowHeight * 45) / 50);
  screen.parent("scriptContainer");
  textSize(15);
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
    document.getElementById("Info").innerHTML =
      "Please select two points on the borders of the polygon";
  } else {
    document.getElementById("Info").innerHTML =
      "You can add points and create the cage when finished";
  }
}
// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas((windowWidth * 45) / 50, (windowHeight * 45) / 50);
};
