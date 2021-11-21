import { Point } from "./Point.js";
import {drawSegment, isRT, isLT, mod} from "./Utils.js"

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
      let tmp = this.shortestPath(this.pathTriangle, this.segmentCrossedByApproxPath)
      this.right = tmp[0] // debug
      this.left = tmp[1] // debug
      console.log("Right : ", this.right)
      console.log("Left : ", this.left)
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

      let pathTriangleCp = pathTriangle.slice() // obliged to do copy
      let segCrossedCp = segCrossed.slice()     // obliged to do copy

      let rightElem = null
      let leftElem = null

      let depth = 0
      //while(segCrossedCp.length !== 0){
      while (depth < 4){
        depth++
        let consideredSeg = segCrossedCp.shift()
        let consideredTriangle = pathTriangleCp.shift()[0]
        
        // case where consideredSeg[0] is to the right and consideredSeg[1] is to the left
        if (isLT(consideredTriangle.center, consideredSeg[0], consideredSeg[1])){
          rightElem = consideredSeg[0]
          leftElem = consideredSeg[1]
        }else{ // swap
          rightElem = consideredSeg[1]
          leftElem = consideredSeg[0]
        }

        // - - - - - end of setup - - - - - -

        if (left.length === 0 || right.length === 0){
          if (left.length === 0) left.push(leftElem)
          if (right.length === 0) right.push(rightElem)
        }
        else{
          // Considering right bounds
          console.log("consider right : ", right)
          let Jacopo = right.length > 1 ? right[right.length-2] : tail[tail.length-1]
          if (rightElem === right[right.length-1]) {}
          else if (isLT(Jacopo, right[right.length-1], rightElem)){
            right[right.length-1] = rightElem;
          }
          else { // case where we cross a border of the polygon : right doesn't change 
            console.log("Crossing past left border")
            let newNextBorderPoint = this.getNext(left[left.length-1], true)  
            left.push(newNextBorderPoint)    
            if (left[0] === right[0]){
              console.log("COMMMMMMON")
              let common = shift(left)
              shift(right)
              tail.push(common)
            }    
          }
          
          // Considering left bounds
          console.log("consider left : ", left)
          
          Jacopo = left.length > 1 ? left[left.length-2] : tail[tail.length-1] 
          console.log(Jacopo, left[left.length-1], leftElem)

          if (leftElem === left[left.length-1]) {}
          else if (isRT(Jacopo, right[right.length-1], leftElem)) { // case where we cross a border of the polygon : left doesn't change 
            console.log("Crossing past left border")
            let newNextBorderPoint = this.getNext(right[right.length-1], false)  
            right.push(newNextBorderPoint)     
            if (left[0] === right[0]){
              console.log("COMMMMMMON")
              let common = shift(left)
              shift(right)
              tail.push(common)
            }   
          }
          else if (isRT(Jacopo, left[left.length-1], leftElem)){
            left[left.length-1] = leftElem;
          }
          
          
        }
        
      }
      return [tail.concat(right), tail.concat(left)] // temporarily for debug
    }

    //TODO: should be a function of zoolygon ? 
    /** 
     * Get the point that follows the input point, considering either clockwise or counterclockwise order
     * @param {*} point : the point we are looking for the next 
     * @param {*} reverseOrder : boolean value
     */
    getNext(point, reverseOrder){
    
      let poly = this.originalPoly.points
      let index = poly.indexOf(point)
      console.log(index)
      if (reverseOrder) return poly[mod(index-1, poly.length)]
      else return poly[mod(index+1, poly.length)]
    }
  
    draw() {
      fill("red");
      ellipse(this.s.x, this.s.y, 4, 4);
      text("s", this.s.x, this.s.y);
      ellipse(this.t.x, this.t.y, 4, 4);
      text("t", this.t.x, this.t.y);

      // approximate path
      for (let i = 0; i < this.pathTriangle.length; i++){
        drawSegment(this.pathTriangle[i][0].center, this.pathTriangle[i][1].center, "red");
      
      }

      // segment crossed
      let seg = this.segmentCrossedByApproxPath
      for (let i = 0; i < seg.length; i++){
        drawSegment(seg[i][0], seg[i][1], "green");
      }

      // left and right bounds 
      for (let i = 0; i < this.left.length -1 ; i++){
        drawSegment(this.left[i], this.left[i+1], "blue")
      }
      for (let i = 0; i < this.right.length -1 ; i++){
        drawSegment(this.right[i], this.right[i+1], "orange")
      }
        
    }
}
export { Funnel };