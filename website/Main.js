/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./modules/Polygon.js";
import { Zoolygon } from "./modules/Zoolygon.js";
import { Point } from "./modules/Point.js";
import { Cage } from "./modules/Cage.js";
import { Funnel } from "./modules/Funnel.js";
import { SupportingChain } from "./modules/SupportingChain.js";
import { mod, isOnSegment } from "./modules/Utils.js";

const states = {
  CAGES: "CAGES",
  FUNNEL: "FUNNEL",
  ZOOKEEPER: "ZOOKEEPER",
};
var state = states.CAGES;
var depth = 2;
const polyDaizaPoints = [
  [33, 145],
  [39, 205],
  [106, 206],
  [108, 151],
  [162, 279],
  [71, 282],
  [142, 365],
  [550, 364],
  [547, 285],
  [453, 282],
  [416, 321],
  [363, 241],
  [316, 314],
  [318, 186],
  [444, 138],
  [436, 226],
  [576, 219],
  [580, 90],
  [332, 52],
  [280, 76],
  [265, 183],
  [186, 180],
  [172, 75],
  [85, 87],
];
var polyDaiza;
var borderCount = 0; //number of selected border points for cage creation
var currentCagePolygon;
var currentCage;
var error = false;

window.createCage = function () {
  if (
    polyDaiza.cages.length > 0 &&
    currentCage.inConstruction &&
    borderCount === 2 &&
    state === states.CAGES &&
    currentCage.polyChainPoints.length + currentCage.points.length > 2
  ) {
    currentCage.constructCage();
    borderCount = 0;
  }
};

/**
 * Create PolyDaiza based on the PolyDaizaPoints constant
 */
function createPolyDaiza() {
  let pointList = [];
  for (let i = 0; i < polyDaizaPoints.length; i++) {
    pointList.push(new Point(polyDaizaPoints[i][0], polyDaizaPoints[i][1], i));
  }
  polyDaiza = new Zoolygon(pointList);
}

function chooseCagePoint(p) {
  let labelLst = ["A", "B"];
  p.label = labelLst[borderCount];
  let newPoint = polyDaiza.findMinReflection(p);
  if (newPoint !== null)
    if (!polyDaiza.isInsideCage(newPoint)) {
      newPoint = new Point(
        math.ceil(newPoint.x),
        math.ceil(newPoint.y),
        labelLst[borderCount],
        newPoint.segmentOnPolygon
      );
      if (borderCount === 0) {
        let cage = new Cage(polyDaiza);
        cage.polyChainPoints.push(newPoint);
        polyDaiza.addCage(cage);
        currentCage = cage;
      } else currentCage.polyChainPoints.push(newPoint);
      borderCount++;
    } else error = true;
  if (borderCount === 2) {
    if (!currentCage.createPolyChain(polyDaiza)) {
      borderCount = 1; //reset borderCount if the second point is invalid
      error = true;
    } else {
      currentCagePolygon = new Polygon(currentCage.polyChainPoints);
    }
  }
}

window.mousePressed = function () {
  error = false;
  let mousePoint = new Point(math.ceil(mouseX), math.ceil(mouseY)); //round point to int
  if (state === states.CAGES) {
    if (borderCount < 2) {
      chooseCagePoint(mousePoint);
    } else {
      if (polyDaiza.isInside(mousePoint))
        if (
          !polyDaiza.isInsideCage(mousePoint) &&
          !currentCagePolygon.isInside(mousePoint) &&
          currentCage.isValid(mousePoint)
        ) {
          currentCage.points.push(mousePoint);
        } else {
          error = true;
        }
    }
  } else if (state === states.FUNNEL) {
    if (polyDaiza.isInside(mousePoint)) {
      if (borderCount === 0) {
        polyDaiza.funnel.reset();
        polyDaiza.funnel2.reset();
      }
      if (polyDaiza.isInsideCage(mousePoint)) {
        if (borderCount == 1) {
          let cage = polyDaiza.insideWhatCage(mousePoint);
          polyDaiza.funnel.addPoint(cage.getStartPoint());
          polyDaiza.funnel2.addPoint(polyDaiza.funnel.points[0]);
          polyDaiza.funnel2.addPoint(cage.getEndPoint());
          polyDaiza.funnel.funnel();
          polyDaiza.funnel2.funnel();
          borderCount = 0;
          state = states.CAGES;
        }
      } else {
        polyDaiza.funnel.addPoint(mousePoint);
        borderCount++;
      }
      if (borderCount === 2) {
        polyDaiza.funnel.funnel();
        borderCount = 0;
        state = states.CAGES;
      }
    }
  } else if (state === states.ZOOKEEPER) {
    let newPoint = polyDaiza.findMinReflection(mousePoint);
    if (newPoint !== null && !polyDaiza.isInsideCage(newPoint)) {
      newPoint.label = "p";
      polyDaiza.chair = newPoint;
      computeR0();
      state = states.CAGES;
    } else {
      error = true;
    }
  }
};

window.showFunnel = function () {
  polyDaiza.triangulateWithCagesAsObstacles();
  polyDaiza.funnel = new Funnel(polyDaiza.shapeWithCages, depth++);
  polyDaiza.funnel2 = new Funnel(polyDaiza.shapeWithCages, depth);
  state = states.FUNNEL;
};

window.swap = function () {
  polyDaiza.Jacopo = !polyDaiza.Jacopo;
};

window.zookeeper = function () {
  if (borderCount === 0) {
    state = states.ZOOKEEPER;
  }
};

/**
 * Find index of the last cage before the chair starting from point 0 of the Zoolygon
 * @returns index
 */
function findCageIndex() {
  let cages = polyDaiza.cages;
  let i = 0;
  while (
    i < cages.length &&
    cages[i].getEndPoint().segmentOnPolygon <=
      polyDaiza.chair.segmentOnPolygon &&
    !isOnSegment(
      polyDaiza.points[cages[i].getStartPoint().segmentOnPolygon],
      cages[i].getStartPoint(),
      polyDaiza.chair
    ) //case where point is between vertex and cage start point
  ) {
    if (
      cages[i].getEndPoint().segmentOnPolygon ===
      polyDaiza.chair.segmentOnPolygon
    )
      if (
        i < cages.length - 1 &&
        cages[i + 1].getStartPoint().segmentOnPolygon ===
          polyDaiza.chair.segmentOnPolygon
      ) {
        if (
          isOnSegment(
            cages[i].getEndPoint(),
            cages[i + 1].getStartPoint(),
            polyDaiza.chair
          ) // case where point is between 2 cages
        )
          return i + 1;
      }

    i++;
  }
  return mod(i, polyDaiza.points.length); //case where point is between cage end point and polygon vertex
}

function computeR0() {
  polyDaiza.supporting_chains = [];
  polyDaiza.triangulateWithCagesAsObstacles();
  let cages = polyDaiza.cages;
  let index = findCageIndex();
  cages = polyDaiza.cages.slice(index).concat(polyDaiza.cages.slice(0, index));
  // start at -1, syntax to consider the chair as first point
  for (let i = -1; i < cages.length; i++) {
    polyDaiza.supporting_chains.push(new SupportingChain(i, polyDaiza, cages));
  }
  polyDaiza.markUselessCages();

  cages = polyDaiza.getActiveCages(index);
  for (let i = 0; i < cages.length; i++) {
    if ((i + 1) % 2 === 0) {
      cages[i].markedEdge = cages[i].points.indexOf(cages[i].B);
    } else {
      cages[i].markedEdge = cages[i].points.indexOf(cages[i].A) - 1;
    }
    let v1 = cages[i].points[cages[i].markedEdge];
    let v2 = cages[i].points[cages[i].markedEdge + 1];
    if (cages[i].A === cages[i].B) cages[i].markedEdgeCenter = cages[i].A;
    else
      cages[i].markedEdgeCenter = new Point(
        (v1.x + v2.x) / 2,
        (v1.y + v2.y) / 2
      );
  }

  let path = [];
  for (let i = -1; i < cages.length; i++) {
    let before = i === -1 ? polyDaiza.chair : cages[i].markedEdgeCenter;
    let after =
      i === cages.length - 1 ? polyDaiza.chair : cages[i + 1].markedEdgeCenter;
    let funnel = new Funnel(polyDaiza.shapeWithCages);
    funnel.addPoint(before);
    funnel.addPoint(after);
    funnel.funnel();
    path = path.concat(funnel.path);
  }
  polyDaiza.R0 = path;
}

window.TriWithCages = function () {
  polyDaiza.triangulateWithCagesAsObstacles();
};

//                            SETUP
// -------------------------------------------------------------------------

window.setup = function () {
  let screen = createCanvas((windowWidth * 25) / 50, (windowHeight * 30) / 50);
  screen.parent("scriptContainer");
  textSize(15);
  createPolyDaiza();
};

window.reset = function () {
  polyDaiza.reset();
  state = states.CAGES;
  borderCount = 0;
};

window.windowResized = function () {
  resizeCanvas((windowWidth * 25) / 50, (windowHeight * 30) / 50);
};

//                             DRAW
// -------------------------------------------------------------------------
window.draw = function () {
  background(200, 200, 200);
  textSize(15);
  if (polyDaiza !== undefined) {
    polyDaiza.drawCages();
    polyDaiza.draw();

    if (polyDaiza.funnel !== null) polyDaiza.drawFunnel();
  }
  displayMessage();
};

function displayMessage() {
  if (state === states.CAGES) {
    if (
      polyDaiza.cages.length === 0 ||
      !currentCage.inConstruction ||
      borderCount < 2
    ) {
      document.getElementById("Info").innerHTML =
        "Please select two points on the borders of the Polygon";
    } else {
      document.getElementById("Info").innerHTML =
        "You can add points and create the cage when finished";
    }
  } else if (state === states.FUNNEL) {
    document.getElementById("Info").innerHTML =
      "Choose 2 points inside the Polygon";
  } else {
    document.getElementById("Info").innerHTML =
      "Place the Zookeeper on a boundary of the Polygon (not in a cage)";
  }
  if (error) {
    if (state === states.CAGES)
      document.getElementById("Error").innerHTML =
        "Invalid point, check that both points on the polygon form a convex chain and that the created cage would not intersect a segment or a Cage of the Polygon";
    else if (state === states.ZOOKEEPER)
      document.getElementById("Error").innerHTML = "";
  } else document.getElementById("Error").innerHTML = " ";
}
