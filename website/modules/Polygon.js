/* eslint-disable no-undef, no-unused-vars */
import { Point } from "./Point.js";
import {
  drawSegment,
  checkRayIntersection,
  isSegmentBefore,
  isRT,
  mod,
  reflectionOnLine,
  squareDistance,
} from "./Utils.js";

/**
 * class to represent Polygon on canvas
 */
class Polygon {
  constructor(points) {
    this.points = points;
    this.triangulations = [];
  }

  /**
   * Check if given point is one of the vertices of the Polygon
   * @param {Point} p given point
   * @returns boolean to indicate if the point is included
   */
  includes(p) {
    for (let i in this.points) if (this.points[i] === p) return true;
    return false;
  }

  /**
   * Check if a given point is inside the Polygon
   * @param {Point} p given point
   * @returns boolean to indicate if point is inside
   */
  isInside(p) {
    //check if point in Polygon, if true stores first intersection in point.intersection
    let isInside = false;
    let intersections = this.rayPolygon(p, new Point(p.x + 50, p.y));
    isInside = Number(intersections.length) % 2 === 1;
    return isInside;
  }

  /**
   * Recursive algorithm to triangulate the polygon
   */
  triangulate() {
    //recursively compute triangulations of a polygon p
    if (this.points.length === 3)
      return new Triangle(this.points[0], this.points[1], this.points[2]);
    else {
      let ear = this.findEar();
      let minusindex = mod(Number(ear) - 1, this.points.length);
      let plusindex = (Number(ear) + 1) % this.points.length;
      let triangle = new Triangle(
        this.points[ear],
        this.points[minusindex],
        this.points[plusindex]
      );
      this.triangulations.push(triangle);
      let newPoints = this.points.slice();
      newPoints.splice(ear, 1);
      let p = new Polygon(newPoints);
      p.triangulate(depth + 1);
      this.triangulations = this.triangulations.concat(p.triangulations);
    }
  }

  /**
   * Check if the point of the polygon at index i is a concave vertex
   * @param {int} i index
   * @returns boolean true if concave
   */
  isConcaveVertex(i) {
    //check if vertex i of polygon p is concave
    return isRT(
      this.points[mod(i - 1, this.points.length)],
      this.points[i],
      this.points[(i + 1) % this.points.length]
    );
  }

  /**
   * Find the first ear of the polygon by starting at index 0
   * @returns the point corresponding to the ear
   */
  findEar() {
    //find index of ear in polygon
    let i = 0;
    let earNotFound = true;
    while (earNotFound) {
      if (!this.isConcaveVertex(Number(i))) {
        earNotFound = false;
        let minusindex = mod(Number(i) - 1, this.points.length);
        let plusindex = (Number(i) + 1) % this.points.length;
        //check that no concave vertices inside triangle formed by the three points
        let triangle = new Triangle(
          this.points[i],
          this.points[minusindex],
          this.points[plusindex]
        );
        let j = 0;
        while (j < this.points.length && !earNotFound) {
          if (
            !triangle.includes(this.points[j]) &&
            triangle.isInside(this.points[j], triangle) &&
            this.isConcaveVertex(Number(j))
          )
            earNotFound = true;
          j++;
        }
      }
      if (earNotFound) i = (Number(i) + 1) % this.points.length;
    }
    return i;
  }

  /**
   * Compute array containing all intersections of ray ab with polygon p, first intersection is first in array
   * @param {*} a
   * @param {*} b
   * @returns the computed array
   */
  rayPolygon(a, b) {
    var intersections = [];
    for (let i = 0; i < this.points.length; i++) {
      if (
        checkRayIntersection(
          a,
          b,
          this.points[i],
          this.points[(i + 1) % this.points.length]
        )
      ) {
        let segment = [
          this.points[i],
          this.points[(i + 1) % this.points.length],
        ];
        if (
          intersections.length === 0 ||
          isSegmentBefore(
            a,
            segment[0],
            segment[1],
            intersections[0][0],
            intersections[0][1]
          )
        )
          intersections.unshift(segment);
        else intersections.push(segment);
      }
    }
    return intersections;
  }

  /**
   * Find reflection to the Polygon segment with the minimum distance to a given point
   * @param {*} p given point
   * @returns the minimum reflected point
   */
  findMinReflection(p) {
    let minPoint = null;
    let minDistance = 300; //minimum distance from point to avoid disasters
    for (let i = 0; i < this.points.length; i++) {
      let p1 = this.points[i];
      let p2 = this.points[(i + 1) % this.points.length];
      let current = reflectionOnLine(p1, p2, p);
      current.segmentOnPolygon = i;
      if (checkRayIntersection(p, current, p1, p2)) {
        if (squareDistance(p, current) < minDistance) {
          minDistance = squareDistance(p, current);
          minPoint = current;
        }
      }
    }
    return minPoint;
  }
  /**
   * Draw polygon on canvas
   */
  draw() {
    for (let i in this.triangulations) this.triangulations[i].draw();
    for (let i = 0; i < this.points.length; i++) {
      drawSegment(this.points[i], this.points[(i + 1) % this.points.length]);
      text(i, this.points[i].x, this.points[i].y);
    }
  }
}

class Triangle extends Polygon {
  constructor(a, b, c) {
    super([a, b, c]);
  }
  /**
   * Check if a given point is inside the Triangle
   * @param {Point} p given point
   * @returns boolean to indicate if point is inside
   */
  isInside(p) {
    let p1 = this.points[0];
    let p2 = this.points[1];
    let p3 = this.points[2];
    return (
      (isRT(p1, p2, p) && isRT(p2, p3, p) && isRT(p3, p1, p)) ||
      (isLT(p1, p2, p) && isLT(p2, p3, p) && isLT(p3, p1, p))
    );
  }
}

export { Polygon, Triangle };