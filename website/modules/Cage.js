/* eslint-disable no-undef, no-unused-vars */
import { squareDistance,mod,sortPointsRadially,isRT,drawSegment } from "./Utils.js";

class Cage {
  constructor(Zoolygon) {
    this.Zoolygon = Zoolygon;
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
        squareDistance(A, this.Zoolygon.points[A.segmentOnPolygon]) >
        squareDistance(B, this.Zoolygon.points[A.segmentOnPolygon])
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
      i = (A.segmentOnPolygon + 1) % this.Zoolygon.points.length;
    let stop = (B.segmentOnPolygon + 1) % this.Zoolygon.points.length;
    while (i !== stop) {
      chain.push(this.Zoolygon.points[i]);
      if (counterClockwise) {
        i = (i + 1) % this.Zoolygon.points.length;
      } else {
        i = mod(i - 1, this.Zoolygon.points.length);
      }
    }
    if (!counterClockwise)
      chain.push(
        this.Zoolygon.points[
          (B.segmentOnPolygon + 1) % this.Zoolygon.points.length
        ]
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
    //console.log(edgeIntersection(this.Zoolygon, this));
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

export { Cage };
