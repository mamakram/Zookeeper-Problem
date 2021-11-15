/* eslint-disable no-undef, no-unused-vars */

//                      GLOBAL AND CLASSES
// -------------------------------------------------------------------------

// TODO: don't mess with point 0
// TODO: bug with the polygonal chain near point A -> 0 -> B
// TODO: handle tricky cases (segment crossing)
// TODO: grahamScan sometimes just don't work correctly

var points = [];
var polyDaiza;
var startPtNr = 0;

var cageBorderMemory = [];

class Point {
  constructor(x, y, label = "", insidePoly = false) {
    this.x = x;
    this.y = y;
    this.label = label;
    this.insidePoly = insidePoly;
  }
}

class Segment {
  constructor(p1, p2, color = "black") {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
  }
}

class Zoolygon {
  constructor(segments = []) {
    this.segments = segments;
    this.cageList = [];
    this.nrOfCages = 0;
  }
  addCage(cage) {
    this.nrOfCages++;
    this.cageList.push(cage);
  }
  getCage(index) {
    return this.cageList[index];
  }
  getLastCage() {
    return this.cageList[this.nrOfCages - 1];
  }
  reset() {
    this.nrOfCages = 0;
    this.cageList = [];
  }
}

class Cage {
  constructor() {
    this.polyChainPoints = [];
    this.cloudOfDot = [];
    this.inConstruction = true;
    this.segments = [];
    this.INIT_POINT = null;
  }
  getPolyChain() {
    return this.polyChainPoints;
  }
  setPolyChain(polyChainPoints) {
    /*
    Points given in clock wise order within the polygonal chain, except for 0
    and 1 which are special because they are the points chosen by the user
    */
    // if the two points on polyDaiza are given in clockWiseOrder -> swap them
    let firstFound = false;
    for (let i = 0; i < polyDaiza.segments.length; i++) {
      let seg = polyDaiza.segments[i];

      if (isOnSegment(seg.p1, seg.p2, polyChainPoints[0])) {
        firstFound = true;
      }
      if (isOnSegment(seg.p1, seg.p2, polyChainPoints[1])) {
        if (firstFound) {
          let tmp = polyChainPoints[0];
          polyChainPoints[0] = polyChainPoints[1];
          polyChainPoints[1] = tmp;
        } else {
          break;
        }
      }
    }

    this.polyChainPoints = this.polyChainPoints.concat(polyChainPoints);
    this.cloudOfDot.push(this.polyChainPoints[0]);
    this.cloudOfDot.push(this.polyChainPoints[1]);
  }

  addPoint(p) {
    this.cloudOfDot.push(p);
  }
  addBorder(border) {
    this.segments.push(border);
  }
  getBorders() {
    return this.segments;
  }
  constructCage() {
    /*
    Based on Graham scan : conceptually, we will do a graham scan on all the points given by the user
    and then connect it to the polygonal chain we've found 
    */

    this.radialSortCloudOfDot();

    var stack = [];
    stack.push(this.cloudOfDot[0], this.cloudOfDot[1], this.cloudOfDot[2]);
    let lastIndex = 2;

    for (let i = 3; i < this.cloudOfDot.length; i++) {
      while (isRT(stack[lastIndex], stack[lastIndex - 1], this.cloudOfDot[i])) {
        stack.pop();
        lastIndex -= 1;
      }
      stack.push(this.cloudOfDot[i]);
      lastIndex += 1;
    }

    for (let i = 0; i < lastIndex; i++) {
      this.addBorder(new Segment(stack[i], stack[i + 1], "blue"));
    }
    console.log(this.polyChainPoints);

    //if (this.polyChainPoints === []) {
    //  this.addBorder(new Segment(stack[0], stack[lastIndex], "blue"));
    //} else {
    for (let i = 1; i < this.polyChainPoints.length; i++) {
      this.addBorder(
        new Segment(
          this.polyChainPoints[i],
          this.polyChainPoints[(i + 1) % this.polyChainPoints.length],
          "blue"
        )
      );
    }

    this.inConstruction = false;
  }

  getInitialPoint() {
    let candidate = this.cloudOfDot[0];
    let candidate_index = 0;
    let smallest_x = this.cloudOfDot[0].x;
    let tmp_x = 0;

    for (let i = 1; i < this.cloudOfDot.length; i++) {
      tmp_x = this.cloudOfDot[i].x;
      if (tmp_x === smallest_x) {
        if (this.cloudOfDot[i].y < candidate.y) {
          candidate = this.cloudOfDot[i];
          candidate_index = i;
        }
      }

      if (tmp_x < smallest_x) {
        candidate = this.cloudOfDot[i];
        candidate_index = i;
        smallest_x = tmp_x;
      }
    }
    this.INIT_POINT = candidate;

    return candidate_index;
  }

  radialSortCloudOfDot() {
    let initIndex = this.getInitialPoint();
    console.log(initIndex);
    this.cloudOfDot.splice(initIndex, 1); // remove p0 not to sort it

    let WillSmith = this.INIT_POINT;
    this.cloudOfDot.sort(function comparator(A, B) {
      if (isRT(WillSmith, A, B)) {
        return -1;
      }

      if (isLT(WillSmith, A, B)) {
        return 1;
      }

      return 0;
    });

    this.cloudOfDot.unshift(this.INIT_POINT); // put p0 back in the list

    for (i in this.cloudOfDot) {
      this.cloudOfDot[i].label = i;
    }
  }
}

//                            SETUP
// -------------------------------------------------------------------------

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  textSize(15);
  frameRate(3);

  clearBtn = createButton("Clear");
  clearBtn.position(30, 30);
  clearBtn.mousePressed(reset);

  makeCageBtn = createButton("Create a cage using my points");
  makeCageBtn.position(30, 60);
  makeCageBtn.mousePressed(createCage);

  createPolyDaiza();
}

//                             DRAW
// -------------------------------------------------------------------------
function draw() {
  background(200);
  textSize(15);

  for (i in points) {
    fill(0);
    ellipse(points[i].x, points[i].y, 4, 4);
    text(points[i].label, points[i].x, points[i].y);
  }
  drawPolygon();
  drawCages();
  displayMessage();
}

function drawPolygon() {
  if (typeof polyDaiza !== "undefined") {
    for (let i = 0; i < polyDaiza.segments.length; i++) {
      drawSegment(polyDaiza.segments[i]);
    }
  }
}

function drawSegment(seg) {
  //fill(0);
  //ellipse(seg.p1.x, seg.p1.y, 4, 4);
  //text(seg.p1.label, seg.p1.x, seg.p1.y);
  fill(seg.color);
  stroke(seg.color);
  line(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y);
  fill("black");
  stroke("black");
}

function drawCages() {
  for (let i = 0; i < polyDaiza.nrOfCages; i++) {
    // draw the points on the cage for debug
    //for (let j = 0; j < polyDaiza.getCage(i).getPolyChain().length; j++) {
    //  let tmp = polyDaiza.getCage(i).getPolyChain()[j];
    //  fill(0);
    //  ellipse(tmp.x, tmp.y, 4, 4);
    //  text(tmp.label, tmp.x, tmp.y);
    //}
    if (polyDaiza.getCage(i).inConstruction) {
      for (j = 0; j < polyDaiza.getCage(i).cloudOfDot.length; j++) {
        let tmp = polyDaiza.getCage(i).cloudOfDot[j];
        fill(0);
        ellipse(tmp.x, tmp.y, 4, 4);
        text(tmp.label, tmp.x, tmp.y);
      }
    }

    // real draw of the cages
    let borders = polyDaiza.getCage(i).getBorders();
    for (let j = 0; j < borders.length; j++) {
      drawSegment(borders[j]);
    }
  }
}

function displayMessage() {
  if (startPtNr < 2) {
    text("Please select two points on the borders of the polygon", 400, 100);
  } else if (startPtNr >= 2) {
    text("You can add points and create the cage when finished", 400, 100);
  }
}

//                            CODE
// -------------------------------------------------------------------------

function mousePressed() {
  let safePlace = mouseY > 120; // lazy patch : points were drawn under the clear button
  let labelLst = ["A", "B"];

  if (safePlace) {
    let tmp;

    if (startPtNr < 2) {
      tmp = new Point(mouseX, mouseY, labelLst[startPtNr]);
      for (let i = 0; i < polyDaiza.segments.length; i++) {
        currSeg = polyDaiza.segments[i];
        if (isOnSegment(currSeg.p1, currSeg.p2, tmp)) {
          points.push(tmp);
          startPtNr++;
          cageBorderMemory.push(currSeg);
        }
      }
      if (startPtNr === 2) {
        FindBorderPolygonalChain();
      }
    } else if (startPtNr >= 2) {
      if (polyDaiza.getCage(polyDaiza.nrOfCages - 1).inConstruction) {
        polyDaiza
          .getCage(polyDaiza.nrOfCages - 1)
          .cloudOfDot.push(new Point(mouseX, mouseY));
      }
    }
  }
}

function FindBorderPolygonalChain() {
  // case where the border of the cage is one a single segment of the zoo

  newCage = new Cage();
  polyDaiza.addCage(newCage);

  if (cageBorderMemory[0] === cageBorderMemory[1]) {
    cageBorderMemory = [];
    newCage.setPolyChain(points);
    return;
  }
  cand1 = tryClockWise(true);
  cand2 = tryClockWise(false);

  if (cand1.length <= cand2.length) {
    newCage.setPolyChain(points.concat(cand1));
  } else {
    newCage.setPolyChain(points.concat(cand2));
  }
  cageBorderMemory = []; // AAAAAH global variables, how dirty
}

function tryClockWise(counterClockWise) {
  // ---------------Set up --------------------//
  let start = 0;
  var checker = function (i) {
    return i < polyDaiza.segments.length;
  };
  var parser = function (i) {
    return i + 1;
  };

  if (!counterClockWise) {
    start = polyDaiza.segments.length - 1;
    checker = function (i) {
      return i > 0;
    };
    parser = function (i) {
      return i - 1;
    };
  }
  // ----------------------------------------//

  let candidate = [];
  firstFound = false;
  lastFound = false;
  for (let i = start; checker(i); i = parser(i)) {
    if (firstFound || lastFound) {
      candidate.push(polyDaiza.segments[i].p1);
    }
    if (polyDaiza.segments[i] === cageBorderMemory[0]) {
      firstFound = true;
      if (polyDaiza.segments[i] === cageBorderMemory[1]) {
        //case where both points given are on the same segment
        candidate.push(points[0], points[1]);
      }
    }
    if (polyDaiza.segments[i] === cageBorderMemory[1]) {
      lastFound = true;
      if (polyDaiza.segments[i] === cageBorderMemory[0]) {
        //case where both points given are on the same segment
        candidate.push(points[0], points[1]);
      }
    }

    if (
      (polyDaiza.segments[i] === cageBorderMemory[1] && firstFound) ||
      (polyDaiza.segments[i] === cageBorderMemory[0] && lastFound)
    ) {
      return candidate; // last point of polygonal chain found, there is no reason to search more
    }
  }
}

function isOnSegment(A, B, point) {
  let biggerMin = min(A.x, B.x) <= point.x;
  let lowerMax = point.x <= max(A.x, B.x);
  let validX = biggerMin && lowerMax;

  return isAligned(A, B, point) && validX;
}

function createPolyDaiza() {
  let positions = readTextFile("polyDaizaPoints.txt");
  positions = positions.trim().split("\n");

  for (let i = 0; i < positions.length; i++) {
    positions[i] = positions[i].split(" ");
  }

  polyDaiza = new Zoolygon();
  for (let i = 0; i < positions.length - 1; i++) {
    polyDaiza.segments.push(
      new Segment(
        new Point(positions[i][0], positions[i][1], i),
        new Point(positions[i + 1][0], positions[i + 1][1], i + 1)
      )
    );
  }

  polyDaiza.segments.push(
    new Segment(
      new Point(
        positions[positions.length - 1][0],
        positions[positions.length - 1][1]
      ),
      new Point(positions[0][0], positions[0][1])
    )
  );
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

function isAligned(A, B, Q) {
  let tmp = computeOrientation(A, B, Q);

  if (tmp < 200 && tmp > -200) {
    // approximation //TODO : trouver une meilleure solution
    return true;
  }
  //return computeOrientation(A, B, Q) === 0;
}

function reset() {
  startPtNr = 0;
  points = [];
  background(200);
  cageBorderMemory = [];
  polyDaiza.reset();
}

function readTextFile(file) {
  var rawFile = new XMLHttpRequest();
  var allText;
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status === 0) {
        allText = rawFile.responseText;
      }
    }
  };
  rawFile.send(null);
  return allText;
}

function createCage() {
  if (polyDaiza.getLastCage().inConstruction) {
    polyDaiza.getLastCage().constructCage();
    startPtNr = 0;
    points = [];
  }
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
