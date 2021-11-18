import { Point } from "./Point.js";
import {drawSegment, isRT, isLT} from "./Utils.js"

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
      
      // variable for which we can remove the "this." when we don't need to draw them anymore
      this.pathTriangle = this.getRopePath();
      this.segmentCrossedByApproxPath = this.getSegmentCrossed(this.pathTriangle);
      //this.shortestPath(this.pathTriangle, this.segmentCrossedByApproxPath)
    }

    /**
     * Get a path that is inside the zoolygon and is approximately the shortest
     * (computes the dual graph of the polygon which is a tree and keep the path
     * between the triangles that contains the 2 points this.s and this.t )
     */
    getRopePath() {
      let pathTriangle = [];
      let dual = this.originalPoly.getDualGraph();

      // find the 2 triangles polygons containing s and t 
      for( let i = 0; i<this.originalPoly.triangulations.length; i++){
        if (this.originalPoly.triangulations[i].isInside(this.s)) 
          this.special_triangle1 =  this.originalPoly.triangulations[i];
        if (this.originalPoly.triangulations[i].isInside(this.t)) 
          this.special_triangle2 =  this.originalPoly.triangulations[i];
      }
      
      let path = dual.dfs_paths(this.special_triangle1, this.special_triangle2)
   
      for (let i = 0; i < path.length-1; i++) {
          pathTriangle.push([path[i], path[i+1]]);
        
      }
      return pathTriangle;
    }
    
    /**
     * return the segments crossed by the relative path from s to t 
     * @param {Array(Triangle)} path 
     */
    getSegmentCrossed(path){
      let segCrossed = []
      
      for (let i = 0; i < path.length-1; i++){
        let edge = path[i][0].getCommonEdge(path[i+1][0]);
        if (edge.length === 2){
          segCrossed.push(edge)
        }
      }
      let last = path[path.length-1][0].getCommonEdge(path[path.length-1][1]);
      segCrossed.push(last)
      
      return segCrossed
    }

    // WIP
    shortestPath(pathTriangle, segCrossed){
      let tail = []
      let left = []
      let right = []
      tail.push(this.special_triangle1.center)

      let pathTriangleCp = pathTriangle.slice()
      let segCrossedCp = segCrossed.slice()

      let rightElem = null
      let leftElem = null

      while(segCrossedCp.length !== 0){
        let consideredSeg = segCrossedCp.shift()
        let consideredTriangle = pathTriangleCp.shift()[0]
        
        // case where consideredSeg[0] is to the right and consideredSeg[1] is to the left
        if (isLT(consideredTriangle.center, consideredSeg[0], consideredSeg[1])){
          rightElem = consideredSeg[0]
          leftElem = consideredSeg[1]
        }else{
          rightElem = consideredSeg[1]
          leftElem = consideredSeg[0]
        }
        if (left.length === 0 ||right.length === 0){
          if (left.length === 0) left.push(leftElem)
          if (right.length === 0) right.push(rightElem)
        }
        else{
          if (rightElem === right[right.length-1]) {}
          else if (isLT(consideredTriangle.center, right[right.length-1], rightElem)){
            right[right.length-1] = rightElem;
          }
          
          
          if (leftElem === left[left.length-1]) {}
          else if (isRT(consideredTriangle.center, left[left.length-1], leftElem)){
            left[left.length-1] = leftElem;
          }
        }
      }
    }
  
    draw() {
      fill("red");
      ellipse(this.s.x, this.s.y, 4, 4);
      text("s", this.s.x, this.s.y);
      ellipse(this.t.x, this.t.y, 4, 4);
      text("t", this.t.x, this.t.y);
      for (let i = 0; i < this.pathTriangle.length; i++){
        drawSegment(this.pathTriangle[i][0].center, this.pathTriangle[i][1].center, "red");
      
      }
      let seg = this.segmentCrossedByApproxPath
      for (let i = 0; i < seg.length; i++){
        drawSegment(seg[i][0], seg[i][1], "green");
  
      }
        
    }
}
export { Funnel };