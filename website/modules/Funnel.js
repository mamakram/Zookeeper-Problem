import { drawSegment, isRT, isLT } from "./Utils.js";

/**
 * Represent the shortest path between 2 points in a polygon
 */
class Funnel {
  constructor(poly) {
    this.originalPoly = poly;
    this.points = [];
    this.labellst = ["s", "t"];
    this.special_triangle1 = undefined;
    this.special_triangle2 = undefined;
    this.funneled = false;
    this.path = [];
    this.segmentCrossedByApproxPath = [];
    this.pathTriangle = [];
    this.dual = this.originalPoly.getDualGraph();
  }

  addPoint(p) {
    p.label = this.labellst[this.points.length];
    this.points.push(p);
  }

  reset() {
    this.points = [];
    this.special_triangle1 = undefined;
    this.special_triangle2 = undefined;
    this.funneled = false;
    this.path = [];
    this.segmentCrossedByApproxPath = [];
    this.pathTriangle = [];
  }

  funnel() {
    this.funneled = true;
    // variable for which we can remove the "this." when we don't need to draw them anymore
    this.pathTriangle = this.getRopePath();
    this.segmentCrossedByApproxPath = this.getSegmentCrossed(this.pathTriangle);
    this.path = this.shortestPath(
      this.pathTriangle,
      this.segmentCrossedByApproxPath
    );
  }

  /**
   * Get a path that is inside the zoolygon and is approximately the shortest
   * (computes the dual graph of the polygon which is a tree and keep the path
   * between the triangles that contains the 2 points this.s and this.t )
   */
  getRopePath() {
    let pathTriangle = [];

    // find the 2 triangles polygons containing s and t
    for (let i = 0; i < this.originalPoly.triangulations.length; i++) {
      if (this.originalPoly.triangulations[i].isInside(this.points[0]))
        this.special_triangle1 = this.originalPoly.triangulations[i];
      if (this.originalPoly.triangulations[i].isInside(this.points[1]))
        this.special_triangle2 = this.originalPoly.triangulations[i];
    }
    let path = this.dual.dfs_paths(
      this.special_triangle1,
      this.special_triangle2
    );
    for (let i = 0; i < path.length - 1; i++) {
      pathTriangle.push([path[i], path[i + 1]]);
    }
    return pathTriangle;
  }

  /**
   * return the segments crossed by the relative path from s to t
   * @param {Array(Triangle)} path
   */
  getSegmentCrossed(path) {
    let segCrossed = [];
    for (let i = 0; i < path.length - 1; i++) {
      let edge = path[i][0].getCommonEdge(path[i + 1][0]);
      if (edge.length === 2) {
        segCrossed.push(edge);
      }
    }
    if (path.length > 0) {
      let last = path[path.length - 1][0].getCommonEdge(
        path[path.length - 1][1]
      );
      segCrossed.push(last);
    }
    return segCrossed;
  }

  // WIP
  shortestPath(pathTriangle, segCrossed) {
    let tail = [this.points[0]];
    let left = [];
    let right = [];
    if (pathTriangle.length === 0) {
      tail.push(this.points[1]);
      return tail;
    }

    let pathTriangleCp = pathTriangle.slice(); // obliged to do copy
    let segCrossedCp = segCrossed.slice(); // obliged to do copy

    let rightElem = null;
    let leftElem = null;

    //while (segCrossedCp.length !== 0) { (depth < 8){
    let depth = 0;
    while (segCrossedCp.length !== 0) {
      depth++;
      let consideredSeg = segCrossedCp.shift();
      let consideredTriangle = pathTriangleCp.shift()[0];

      // case where consideredSeg[0] is to the right and consideredSeg[1] is to the left
      if (isLT(consideredTriangle.center, consideredSeg[0], consideredSeg[1])) {
        rightElem = consideredSeg[0];
        leftElem = consideredSeg[1];
      } else {
        // swap
        rightElem = consideredSeg[1];
        leftElem = consideredSeg[0];
      }

      // - - - - - end of setup - - - - - -
      if (left.length === 0 || right.length === 0) {
        if (left.length === 0) left.push(leftElem);
        if (right.length === 0) right.push(rightElem);
      } else {
        // Considering right bounds
        let apex = tail[tail.length - 1];

        if (rightElem !== right[right.length - 1]) {
          let problem = -1;
          for (let i = 0; i < left.length; i++) {
            //check if there is an intersection between new added point to left and the right funnel
            if (isLT(apex, left[i], rightElem)) {
              problem = i;
            }
          }

          if (problem !== -1) {
            // case where we cross a border of the polygon : right doesn't change
            right = left.slice(0, problem + 1);
            right.push(rightElem);
          } else if (
            isLT(apex, right[right.length - 1], rightElem) &&
            !this.originalPoly.intersects(apex, rightElem)
          ) {
            right[right.length - 1] = rightElem;
          } else {
            right.push(rightElem);
          }
        }

        // Considering left bounds

        if (leftElem !== left[left.length - 1]) {
          let problem = -1;
          //console.log("last point of right " right[right.length - 1],right.length);
          for (let i = 0; i < right.length; i++) {
            //check if there is an intersection between new added point to left and the right funnel
            if (isRT(apex, right[i], leftElem)) {
              problem = i;
            }
          }
          if (problem !== -1) {
            // case where we cross a border of the polygon : left doesn't change
            left = right.slice(0, problem + 1);
            left.push(leftElem);
          } else if (
            isRT(apex, left[left.length - 1], leftElem) &&
            !this.originalPoly.intersects(apex, leftElem)
          ) {
            left[left.length - 1] = leftElem;
          } else {
            left.push(leftElem);
          }
        }

        while (left[0] === right[0]) {
          let common = left.shift();
          right.shift();
          tail.push(common);
        }
      }
    }
    this.finishPath(left, right, tail);

    return tail; // temporarily for debug
  }

  finishPath(left, right, tail) {
    console.log(tail, right[right.length - 1], left[left.length - 1]);
    //while the path from apex(tail end) to point is not between the funnels, add the path of the funnel it intersects
    let done = false;
    while (
      left.length !== 0 &&
      !isLT(tail[tail.length - 1], this.points[1], left[0])
    ) {
      tail.push(left.shift());
      done = true; //so as not to try right after left
    }

    while (
      !done &&
      right.length !== 0 &&
      !isRT(tail[tail.length - 1], this.points[1], right[0])
    ) {
      tail.push(right.shift());
    }
    tail.push(this.points[1]);
  }

  draw() {
    for (let i in this.points) {
      fill("red");
      ellipse(this.points[i].x, this.points[i].y, 4, 4);
      text(this.points[i].label, this.points[i].x, this.points[i].y);
    }
    if (this.funneled) {
      for (let i = 0; i < this.path.length - 1; i++) {
        drawSegment(this.path[i], this.path[i + 1], "purple");
      }
    }
  }
}
export { Funnel };
