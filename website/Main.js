/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./modules/Polygon.js";
import { Zoolygon } from "./modules/Zoolygon.js";
import { Point } from "./modules/Point.js";
import { Cage } from "./modules/Cage.js";
import { Funnel } from "./modules/Funnel.js";
import { SupportingChain } from "./modules/SupportingChain.js";

const states = {
  CAGES: "CAGES",
  FUNNEL: "FUNNEL",
};
var state = states.CAGES;
var depth = 2;
const polyDaizaPoints = [
  [33, 245],
  [39, 305],
  [106, 306],
  [108, 251],
  [162, 379],
  [71, 382],
  [142, 465],
  [550, 464],
  [547, 385],
  [453, 382],
  [416, 421],
  [363, 341],
  [316, 414],
  [318, 286],
  [444, 238],
  [436, 326],
  [576, 319],
  [580, 190],
  [332, 152],
  [280, 176],
  [265, 283],
  [186, 280],
  [172, 175],
  [85, 187],
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
    state === states.CAGES
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

window.mousePressed = function () {
  error = false;
  let labelLst = ["A", "B"];
  let mousePoint = new Point(math.ceil(mouseX), math.ceil(mouseY)); //round point to int
  if (state === states.CAGES) {
    if (borderCount < 2) {
      mousePoint.label = labelLst[borderCount];
      let newPoint = polyDaiza.findMinReflection(mousePoint);
      if (newPoint !== null)
        if (!polyDaiza.isInsideCage(newPoint)) {
          //console.log(newPoint.x, newPoint.y);
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
  } else {
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

window.showSupportingChains = function () {
  polyDaiza.supporting_chains = [];
  polyDaiza.triangulateWithCagesAsObstacles();
  let cages = polyDaiza.getActiveCages();
  // start at -1, syntax to consider the chair as first point
  for (let i = -1; i < cages.length; i++) {
    polyDaiza.supporting_chains.push(new SupportingChain(i, polyDaiza));
  }
  polyDaiza.markUselessCages(); // end of point 2 ?

  cages = polyDaiza.getActiveCages();
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
};

window.TriWithCages = function () {
  polyDaiza.triangulateWithCagesAsObstacles();
};

//                            SETUP
// -------------------------------------------------------------------------

window.setup = function () {
  let screen = createCanvas((windowWidth * 45) / 50, (windowHeight * 45) / 50);
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
  resizeCanvas((windowWidth * 45) / 50, (windowHeight * 45) / 50);
};

//                             DRAW
// -------------------------------------------------------------------------
window.draw = function () {
  background(200);
  textSize(15);
  if (polyDaiza !== undefined) {
    polyDaiza.draw();
    polyDaiza.drawCages();

    if (polyDaiza.funnel !== null) polyDaiza.drawFunnel();
    if (polyDaiza.shapeWithCages !== null) polyDaiza.drawTWCresult();
  }
  displayMessage();
};

function displayMessage() {
  if (
    polyDaiza.cages.length === 0 ||
    !currentCage.inConstruction ||
    borderCount < 2
  ) {
    document.getElementById("Info").innerHTML =
      "Please select two points on the borders of the polygon";
  } else {
    document.getElementById("Info").innerHTML =
      "You can add points and create the cage when finished";
  }
  if (error) {
    document.getElementById("Error").innerHTML =
      "Invalid point, check that both points on the polygon form a convex chain and that the created cage would not intersect a segment or a Cage of the Polygon";
  } else document.getElementById("Error").innerHTML = " ";
}
