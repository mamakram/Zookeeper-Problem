/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./Polygon.js";
import { mod, drawSegment, squareDistance } from "./Utils.js";

/**
 * class to represent Zoolygon on canvas (i.e Polygon with cages)
 */
class Zoolygon extends Polygon {
  constructor(points) {
    super(points);
    this.cages = [];
    this.funnel = null;
    this.funnel2 = null;
    this.supporting_chains = [];
    this.shapeWithCages = null;
    this.chair = null; //{ ...this.points[0] }; // copy
    //this.chair.label = "p";
    this.R0 = null;
    this.Jacopo = false;
  }

  isInsideCage(p) {
    for (let i = 0; i < this.cages.length; i++) {
      if (this.cages[i].isInside(p)) return true;
    }
    return false;
  }

  insideWhatCage(p) {
    for (let i = 0; i < this.cages.length; i++) {
      if (this.cages[i].isInside(p)) return this.cages[i];
    }
  }
  addCage(cage) {
    let p = cage.getStartPoint();
    let polyPoint = this.points[p.segmentOnPolygon];
    let i = 0;

    // maintain cages sorted
    while (
      i < this.cages.length &&
      (p.segmentOnPolygon > this.cages[i].getStartPoint().segmentOnPolygon ||
        (p.segmentOnPolygon ===
          this.cages[i].getStartPoint().segmentOnPolygon &&
          squareDistance(polyPoint, p) >
            squareDistance(polyPoint, this.cages[i].getStartPoint())))
    )
      i++;
    this.cages = this.cages
      .slice(0, i)
      .concat([cage])
      .concat(this.cages.slice(i));
    // this.cages.push(cage);
  }
  getCage(index) {
    return this.cageList[index];
  }
  getLastCage() {
    return this.cages[this.cages.length - 1];
  }

  markUselessCages() {
    for (let i in this.cages) {
      if (this.cages[i].isAbeforeB()) this.cages[i].active = false;
    }
  }

  getActiveCages(startIndex = 0) {
    let activeCages = [];

    let cages = this.cages
      .slice(startIndex)
      .concat(this.cages.slice(0, startIndex));
    for (let i in cages) {
      if (cages[i].active) activeCages.push(cages[i]);
    }
    return activeCages;
  }

  triangulateWithCagesAsObstacles() {
    let mixPoints = this.points;
    let rm = [];
    for (let i = 0; i < this.cages.length; i++) {
      let tmp = this.cages[i].points.slice(
        0,
        this.cages[i].points.indexOf(this.cages[i].getEndPoint()) + 1
      );
      let A = tmp[0];

      let insertPoint = this.points[A.segmentOnPolygon];

      let cagePoints = this.cages[i].polyChainPoints;
      for (let j = 1; j < cagePoints.length - 1; j++) {
        rm.push(cagePoints[j]);
      }
      let cutIndex = mod(mixPoints.indexOf(insertPoint) + 1, mixPoints.length);
      while (!this.includes(mixPoints[cutIndex])) cutIndex++;

      mixPoints = mixPoints
        .slice(0, cutIndex)
        .concat(tmp)
        .concat(mixPoints.slice(cutIndex));
    }
    for (let k = 0; k < rm.length; k++) {
      let a = mixPoints.indexOf(rm[k]);
      mixPoints.splice(a, 1);
    }

    this.shapeWithCages = new Polygon(mixPoints);
    this.shapeWithCages.triangulate();
  }

  drawCages() {
    for (let i = 0; i < this.cages.length; i++) this.cages[i].draw();
  }

  drawFunnel() {
    this.funnel2.draw();
    this.funnel.draw();
  }

  draw() {
    super.draw();
    if (this.chair !== null) {
      fill("purple");
      ellipse(this.chair.x, this.chair.y, 4, 4);
      text(this.chair.label, this.chair.x, this.chair.y);
    }
    if (!this.Jacopo)
      for (let i = 0; i < this.supporting_chains.length; i++) {
        this.supporting_chains[i].draw();
      }
    else if (this.R0 !== null) {
      for (let i = 0; i < this.R0.length; i++) {
        drawSegment(this.R0[i], this.R0[(i + 1) % this.R0.length], "cyan");
      }
    }
  }

  reset() {
    this.triangulations = [];
    this.funnel = null;
    this.funnel2;
    this.dual = null;
    this.chair = null;
    this.cages = [];
    this.shapeWithCages = null;
    this.supporting_chains = [];
    this.R0 = null;
  }
}

export { Zoolygon };
