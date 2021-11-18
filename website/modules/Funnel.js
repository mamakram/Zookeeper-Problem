import { Point } from "./Point.js";
import {drawSegment} from "./Utils.js"

/**
 * Represent the shortest path between 2 points in a polygon 
 */
class Funnel {
    // IDEA: the next thing we have to do is to use the tree to find the list od segments crossed by
    // the path between this.s and this.t. We will be able to use the funnel right after
    constructor(poly) {
      this.originalPoly = poly;
      // points to test the shortest path
      this.s = new Point(44, 270);
      this.t = new Point(360, 370);
      this.treeSeg = this.createDualTree();
    }
    createDualTree() {
      // TODO: create a real tree and find the path between this.s and this.t
      let treeSeg = [];
      let dual = this.originalPoly.getDualGraph();
      
      console.log(dual)
      // For visual purpose only.
      for (let [key, value] of dual.adjList) {
        for (let i = 0; i < value.length; i++) {
          treeSeg.push([key, value[i]]);
        }
      }
  
      return treeSeg;
    }
  
    draw() {
      fill("red");
      ellipse(this.s.x, this.s.y, 4, 4);
      text("s", this.s.x, this.s.y);
      ellipse(this.t.x, this.t.y, 4, 4);
      text("t", this.t.x, this.t.y);
      for (let i = 0; i < this.treeSeg.length; i++)
        drawSegment(this.treeSeg[i][0], this.treeSeg[i][1], "red");
    }
}
export { Funnel };