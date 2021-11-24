/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./Polygon.js";
import { mod, drawSegment } from "./Utils.js";

/**
 * class to represent Zoolygon on canvas (i.e Polygon with cages)
 */
class Zoolygon extends Polygon {
  constructor(points) {
    super(points);
    this.cages = [];
    this.funnel = null;
    this.funnel2 = null;
    this.shapeWithCages = null;
  }

  isInsideCage(p) {
    for (let i = 0; i < this.cages.length; i++) {
      if (this.cages[i].isInside(p)) return true;
    }
  }

  insideWhatCage(p) {
    for (let i = 0; i < this.cages.length; i++) {
      if (this.cages[i].isInside(p)) return this.cages[i];
    }
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
    for (let i = 0; i < this.cages.length; i++) this.cages[i].draw();
  }

  drawFunnel() {
    this.funnel2.draw();
    this.funnel.draw();
  }

  triangulateWithCagesAsObstacles() {
    let mixPoints = this.points;
    let rm = [];
    for (let i = 0; i < this.cages.length; i++) {
      let tmp = this.cages[i].getPoints();
      tmp = tmp.slice(tmp.indexOf(this.cages[i].getEndPoint()));
      tmp.push(this.cages[i].getStartPoint());
      tmp.reverse();
      console.log(tmp);
      let A = tmp[0];
      let insertPoint = this.points[A.segmentOnPolygon];

      let cagePoints = this.cages[i].getPoints();
      for (let j = 0; j < cagePoints.length; j++) {
        if (mixPoints.includes(cagePoints[j])) {
          rm.push(cagePoints[j]);
        }
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
      let temp = mixPoints.slice(0, a).concat(mixPoints.slice(a + 1));
      mixPoints = temp;
    }
    this.shapeWithCages = new Polygon(mixPoints);
    this.shapeWithCages.triangulate();
  }

  drawTWCresult() {
    /** 
    for (let i = 0; i < this.shapeWithCages.points.length; i++) {
      drawSegment(
        this.shapeWithCages.points[i],
        this.shapeWithCages.points[(i + 1) % this.shapeWithCages.points.length],
        (color = "green")
      );
      text(i, this.shapeWithCages.points[i].x, this.shapeWithCages.points[i].y);
    }*/
    //this.shapeWithCages.draw();
  }

  reset() {
    this.triangulations = [];
    this.funnel = null;
    this.dual = null;
    this.cages = [];
    this.shapeWithCages = null;
  }
}

export { Zoolygon };
