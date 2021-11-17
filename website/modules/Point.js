/* eslint-disable no-undef, no-unused-vars */

/**
 * Class to represent point on canvas
 */
class Point {
  constructor(x, y, label = "") {
    this.x = x;
    this.y = y;
    this.label = label;
    this.segmentOnPolygon = null;
  }
}

export { Point };
