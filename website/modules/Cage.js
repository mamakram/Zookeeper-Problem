/* eslint-disable no-undef, no-unused-vars */
import {
  squareDistance,
  mod,
  sortPointsRadially,
  isRT,
  drawSegment,
  checkSegmentIntersection,
  isAligned,
  computeOrientation,
} from "./Utils.js";

import { Polygon } from "./Polygon.js";

/**
 * Class to represent Cage on canvas
 */
class Cage {
  /**
   * Constructor
   * @param {Zoolygon} Zoolygon Zoolygon that contains the cage
   */
  constructor(Zoolygon) {
    this.Zoolygon = Zoolygon;
    this.polyChainPoints = [];
    this.inConstruction = true;
    this.points = [];
  }

  isInside(p) {
    if (!this.inConstruction) {
      for (let i = 0; i < this.points.length; i++) {
        if (
          isRT(this.points[i], this.points[(i + 1) % this.points.length], p, 10)
        )
          return false;
      }
      return true;
    }
    return false;
  }

  isValid(p) {
    let currentPoints = this.polyChainPoints.concat(this.points);
    for (let j = 0; j < currentPoints.length; j++)
      for (let i = 0; i < this.Zoolygon.points.length; i++) {
        let containsSegment = i === currentPoints[j].segmentOnPolygon;
        if (this.Zoolygon.includes(currentPoints[j])) {
          //vertex of Zoolygon
          let index = this.Zoolygon.points.indexOf(currentPoints[j]);
          containsSegment =
            i === index || i === mod(index - 1, this.Zoolygon.points.length);
        }
        if (
          !containsSegment &&
          checkSegmentIntersection(
            currentPoints[j],
            p,
            this.Zoolygon.points[i],
            this.Zoolygon.points[(i + 1) % this.Zoolygon.points.length]
          )
        ) {
          return false;
        }
      }
    return true;
  }

  /**
   * Create the chain of vertices of the Zoolygon connecting points A and B
   * @returns true if the chain is convex and AB doesnt intersect any segment of the Zoolygon
   */
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
      return true;
    }
    if (A.segmentOnPolygon > B.segmentOnPolygon) {
      this.polyChainPoints = [B, A];
    }

    let cand1 = this.computePolyChain(true);
    let cand2 = this.computePolyChain(false);

    //choose the shortest chain between cw and anti-cw
    if (cand1.length <= cand2.length) {
      this.polyChainPoints = cand1;
    } else {
      this.polyChainPoints = cand2.reverse();
    }
    let startIndex = this.Zoolygon.points.indexOf(this.polyChainPoints[1]);
    //check if all the vertices contained in the chain are convex
    for (let i = 0; i < this.polyChainPoints.length - 2; i++) {
      if (
        this.Zoolygon.isConcaveVertex(
          (Number(startIndex) + i) % this.Zoolygon.points.length
        )
      ) {
        this.polyChainPoints = [A];
        return false;
      }
    }
    //check if the segment connecting A to B doesn't intersect the Zoolygon
    for (let i = 0; i < this.Zoolygon.points.length; i++) {
      if (
        i != A.segmentOnPolygon &&
        i != B.segmentOnPolygon &&
        checkSegmentIntersection(
          A,
          B,
          this.Zoolygon.points[i],
          this.Zoolygon.points[(i + 1) % this.Zoolygon.points.length]
        )
      ) {
        this.polyChainPoints = [A];
        return false;
      }
    }
    return true;
  }

  /**
   * Compute the chain of vertices of the Zoolygon connecting points A and B
   */
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

  /**
   * Construct the cage with the polygonal chain and the points drawn on the canvas to form a convex Hull
   * Based on Graham scan : conceptually, we will do a graham scan on all the points given by the user
   * and then connect it to the polygonal chain we've found
   */
  constructCage() {
    if (this.points.length > 0) {
      this.points = sortPointsRadially(
        this.points,
        this.polyChainPoints[this.polyChainPoints.length - 1]
      );

      let stack = [
        this.polyChainPoints[this.polyChainPoints.length - 1],
        this.points[0],
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

  /**
   * Draw the cage on the canvas
   */
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

  getStartPoint() {
    return this.polyChainPoints[0];
  }

  getEndPoint() {
    return this.polyChainPoints[this.polyChainPoints.length-1];
  }
}

export { Cage };
