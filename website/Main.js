/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./modules/Polygon.js";
import { Zoolygon } from "./modules/Zoolygon.js";
import {Point} from "./modules/Point.js"
import {Cage} from "./modules/Cage.js"
import {checkRayIntersection,squareDistance} from "./modules/Utils.js"

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

window.createCage= function() {
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

window.mousePressed = function() {
  let labelLst = ["A", "B"];
  let mousePoint = new Point(mouseX, mouseY);
  console.log(borderCount);
  if (borderCount < 2) {
    mousePoint.label = labelLst[borderCount];
    if (borderCount === 0) polyDaiza.addCage(new Cage(polyDaiza));
    let newPoint = findMinReflection(mousePoint);
    if (newPoint !== null) {
      newPoint.label = labelLst[borderCount];
      polyDaiza.getLastCage().polyChainPoints.push(newPoint);
      borderCount++;
    }
    if (borderCount === 2) {
      polyDaiza.getLastCage().createPolyChain(polyDaiza);
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

window.setup = function() {
  let screen = createCanvas((windowWidth * 45) / 50, (windowHeight * 45) / 50);
  screen.parent("scriptContainer");
  textSize(15);
  createPolyDaiza();
}

window.reset=function() {
  background(200);
  polyDaiza.reset();
  borderCount = 0;
}

//                             DRAW
// -------------------------------------------------------------------------
window.draw = function(){
  background(200);
  textSize(15);
  if (polyDaiza !== undefined) {
    polyDaiza.draw();
    polyDaiza.drawCages();
  }
  displayMessage();
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
