/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./modules/Polygon.js";
import { Zoolygon } from "./modules/Zoolygon.js";
import { Point } from "./modules/Point.js";
import { Cage } from "./modules/Cage.js";
import { checkRayIntersection, squareDistance } from "./modules/Utils.js";

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
  [85, 187],
];
var polyDaiza;
var borderCount = 0; //number of selected border points for cage creation
var currentCage;
var error = false;

window.createCage = function () {
  if (polyDaiza.getLastCage().inConstruction && borderCount === 2) {
    polyDaiza.getLastCage().constructCage();
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
  let mousePoint = new Point(mouseX, mouseY);
  if (borderCount < 2) {
    mousePoint.label = labelLst[borderCount];
    if (borderCount === 0) polyDaiza.addCage(new Cage(polyDaiza));
    let newPoint = polyDaiza.findMinReflection(mousePoint);
    if (newPoint !== null) {
      newPoint.label = labelLst[borderCount];
      polyDaiza.getLastCage().polyChainPoints.push(newPoint);
      borderCount++;
    }
    if (borderCount === 2) {
      if (!polyDaiza.getLastCage().createPolyChain(polyDaiza)) {
        borderCount = 1; //reset borderCount if the second point is invalid
        error = true;
      } else {
        currentCage = new Polygon(polyDaiza.getLastCage().polyChainPoints);
      }
    }
  } else {
    if (polyDaiza.isInside(mousePoint))
      if (!currentCage.isInside(mousePoint))
        polyDaiza.getLastCage().points.push(mousePoint);
  }
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
  background(200);
  polyDaiza.reset();
  borderCount = 0;
};

//                             DRAW
// -------------------------------------------------------------------------
window.draw = function () {
  background(200);
  textSize(15);
  if (polyDaiza !== undefined) {
    polyDaiza.draw();
    polyDaiza.drawCages();
  }
  displayMessage();
};

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
  if (error) {
    document.getElementById("Error").innerHTML =
      "Invalid point, check that both points on the polygon form a convex chain and that the created cage would not intersect a line of the Polygon";
  } else document.getElementById("Error").innerHTML = "";
}