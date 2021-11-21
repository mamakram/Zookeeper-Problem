/* eslint-disable no-undef, no-unused-vars */
import { Point } from "./Point.js";

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
  return computeOrientation(A, B, Q) === 0;
}

function computeOrientation(A, B, Q) {
  let M = [
    [A.x, -A.y, 1],
    [B.x, -B.y, 1],
    [Q.x, -Q.y, 1],
  ];

  return math.det(M);
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

function checkSegmentIntersection(a, b, c, d) {
  //For 4 points, check for intersection between Segments ab and cd
  var det1 = isLT(a, b, c);
  var det2 = isLT(a, b, d);
  if (det1 !== det2) {
    var det3 = isLT(c, d, a);
    var det4 = isLT(c, d, b);
    return (det1 && !det2 && !det3 && det4) || (!det1 && det2 && det3 && !det4);
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

/**
 * Solve degree 2 equation
 * @param {Point} a
 * @param {Point} b
 * @param {Point} c
 * @param {Point} d
 * @param {Point} e
 * @param {Point} f
 * @returns x,y solution to equation
 */
function solve2eq2unk(a, b, c, d, e, f) {
  let det = a * d - b * c;
  if (det !== 0) {
    let x = (e * d - b * f) / det;
    let y = (a * f - e * c) / det;
    return [x, y];
  } else console.log("ERROR");
}

/**
 * Compute reflection of point c on line ab
 * @param {Point} a
 * @param {Point} b
 * @param {Point} c point to reflect
 * @returns reflected point on line
 */
function reflectionOnLine(a, b, c) {
  let m = (b.y - a.y) / (b.x - a.x);
  let h = b.y - m * b.x;
  let mp = -1 / m;
  let hp = c.y - mp * c.x;
  let res = solve2eq2unk(-1 * m, 1, -1 * mp, 1, h, hp);
  return new Point(res[0], res[1]);
}

function isRT(A, B, Q, error = 0) {
  return computeOrientation(A, B, Q) + error < 0;
}

function isLT(A, B, Q) {
  return computeOrientation(A, B, Q) > 0;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function squareDistance(p1, p2) {
  return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
}

function drawSegment(p1, p2, color = "black") {
  fill(color);
  stroke(color);
  line(p1.x, p1.y, p2.x, p2.y);
  fill("black");
  stroke("black");
}

export {
  edgeIntersection,
  drawSegment,
  checkRayIntersection,
  checkSegmentIntersection,
  isSegmentBefore,
  isOnSegment,
  squareDistance,
  mod,
  isLT,
  isRT,
  isAligned,
  sortPointsRadially,
  reflectionOnLine,
  computeOrientation,
};
