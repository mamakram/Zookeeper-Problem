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
      this.special_triangle1 = undefined
      this.special_triangle2 = undefined

      this.pathSeg = this.getRopePath();
    }

    /**
     * Get a path that is inside the zoolygon and is approximately the shortest
     * (computes the dual graph of the polygon which is a tree and keep the path
     * between the triangles that contains the 2 points this.s and this.t )
     */
    getRopePath() {
      let pathSeg = [];
      let dual = this.originalPoly.getDualGraph();

      // find the 2 triangles polygons containing s and t 
      for( let i = 0; i<this.originalPoly.triangulations.length; i++){
        if (this.originalPoly.triangulations[i].isInside(this.s)) 
          this.special_triangle1 =  this.originalPoly.triangulations[i];
        if (this.originalPoly.triangulations[i].isInside(this.t)) 
          this.special_triangle2 =  this.originalPoly.triangulations[i];
      }
      
      let path = dual.dfs_paths(this.special_triangle1, this.special_triangle2)
      console.log("Path : ", path)
      // For visual purpose only. -> filter this
      for (let i = 0; i < path.length-1; i++) {
          pathSeg.push([path[i].center, path[i+1].center]);
        
      }
      console.log("Path seg = ", pathSeg)
  
      return pathSeg;
    }
  
    draw() {
      fill("red");
      ellipse(this.s.x, this.s.y, 4, 4);
      text("s", this.s.x, this.s.y);
      ellipse(this.t.x, this.t.y, 4, 4);
      text("t", this.t.x, this.t.y);
      for (let i = 0; i < this.pathSeg.length; i++)
        drawSegment(this.pathSeg[i][0], this.pathSeg[i][1], "red");
    }
}
export { Funnel };