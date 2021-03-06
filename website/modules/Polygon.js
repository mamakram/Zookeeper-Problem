/* eslint-disable no-undef, no-unused-vars */
import { Point } from "./Point.js";
import { Graph } from "./Graph.js";
import {
  drawSegment,
  checkRayIntersection,
  checkSegmentIntersection,
  isSegmentBefore,
  isRT,
  isLT,
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
    this.dual = null;
  }

  /**
   * Check if given point is one of the vertices of the Polygon
   * @param {Point} p given point
   * @returns boolean to indicate if the point is included
   */
  includes(p) {
    for (let i in this.points)
      if (this.points[i].x === p.x && this.points[i].y === p.y) return true;
    return false;
  }

  /**
   * Check if a given point is inside the Polygon
   * @param {Point} p given point
   * @returns boolean to indicate if point is inside
   */
  isInside(p) {
    //check if point in Polygon, if true stores first intersection in point.intersection
    if (this.includes(p)) return true;
    let isInside = false;
    let intersections = this.rayPolygon(p, new Point(p.x + 50, p.y));
    isInside = Number(intersections.length) % 2 === 1;
    return isInside;
  }

  /**
   * Recursive algorithm to triangulate the polygon
   */
  triangulate() {
    let point_list = [];
    for (let i in this.points) {
      point_list.push(this.points[i].x, this.points[i].y);
    }
    let tri_list = earcut(point_list);

    for (let i = 0; i < tri_list.length; i += 3) {
      this.triangulations.push(
        new Triangle(
          this.points[tri_list[i]],
          this.points[tri_list[i + 1]],
          this.points[tri_list[i + 2]]
        )
      );
    }
  }

  /**
   * Check if the point of the polygon at index i is a concave vertex
   * @param {int} i index
   * @returns boolean true if concave
   */
  isConcaveVertex(i) {
    //check if vertex i of polygon p is concave
    return !isLT(
      this.points[mod(i - 1, this.points.length)],
      this.points[i],
      this.points[(i + 1) % this.points.length]
    );
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

  intersects(a, b) {
    for (let i = 0; i < this.points.length; i++) {
      let segment = [this.points[i], this.points[(i + 1) % this.points.length]];
      if (
        !segment.includes(a) &&
        !segment.includes(b) &&
        checkSegmentIntersection(a, b, segment[0], segment[1])
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Compute the dual graph of the polygon if it is needed,
   * this action proceeds to a polygon triangulation.
   *
   * @returns the dual graph of the polygon
   */
  getDualGraph() {
    if (this.dual !== null) {
      return this.dual;
    } else {
      //this.triangulate();
      this.dual = new Graph();

      // TODO: it's in O(n**2), but preproccessing so idk if it matters
      for (let i = 0; i < this.triangulations.length; i++) {
        let triangle1 = this.triangulations[i];
        for (let j = i; j < this.triangulations.length; j++) {
          let triangle2 = this.triangulations[j];
          if (triangle1.hasCommonEdge(triangle2)) {
            this.dual.connect(triangle1, triangle2);
            this.dual.connect(triangle2, triangle1);
          }
        }
      }
      return this.dual;
    }
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
      //check that the ray formed by the point and its reflection intersects the line
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
    }
  }
}

class Triangle extends Polygon {
  constructor(a, b, c) {
    super([a, b, c]);
    this.center = this.findCenter();
    this.specialPoint = undefined; // point from/to which compute a shortest path
    this.visited = false; // triangles are used as nodes for graph in dual graph of polygon
  }
  /**
   * Check if a given point is inside the Triangle
   * @param {Point} p given point
   * @returns boolean to indicate if point is inside
   */
  isInside(p) {
    if (this.includes(p)) return true;
    let p1 = this.points[0];
    let p2 = this.points[1];
    let p3 = this.points[2];
    return (
      (!isRT(p1, p2, p, 200) &&
        !isRT(p2, p3, p, 200) &&
        !isRT(p3, p1, p, 200)) ||
      (!isLT(p1, p2, p, 200) && !isLT(p2, p3, p, 200) && !isLT(p3, p1, p, 200))
    );
  }

  /**
   * Compute the ceter point of a triangle.
   * Mainly used for building the dual tree of the polygon.
   *
   * @returns the point in the center of the triangle
   */
  findCenter() {
    let centerX = (this.points[0].x + this.points[1].x + this.points[2].x) / 3;
    let centerY = (this.points[0].y + this.points[1].y + this.points[2].y) / 3;
    return new Point(centerX, centerY);
  }

  /**
   * Check if the triangle has a common edge with an other triangle
   * @param {Triangle} other : the triangle in comparison
   * @returns true if the triangle other has a common edge with this
   */
  hasCommonEdge(other) {
    let edge = this.getCommonEdge(other);
    if (edge.length === 2) {
      return true;
    }
    return false;
  }

  /**
   * Compute the common edge with an other triangle
   * @param {Triangle} other : the triangle in comparison
   * @returns edge : the coordinates of the edge in common
   */
  getCommonEdge(other) {
    let edge = [];
    for (let i = 0; i < other.points.length; i++) {
      let p = other.points[i];
      if (
        p === this.points[0] ||
        p === this.points[1] ||
        p === this.points[2]
      ) {
        edge.push(p);
      }
    }
    return edge;
  }
}

export { Polygon, Triangle };
