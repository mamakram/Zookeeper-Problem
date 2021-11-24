/* eslint-disable no-undef, no-unused-vars */

/**
 * Class to represent point on canvas
 */
class Point {
  constructor(x, y, label = "", segmentOnPolygon = null) {
    this.x = x;
    this.y = y;
    this.label = label;
    this.segmentOnPolygon = segmentOnPolygon;
  }
}

export { Point };
