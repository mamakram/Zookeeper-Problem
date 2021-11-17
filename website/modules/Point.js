/* eslint-disable no-undef, no-unused-vars */
class Point {
    constructor(x, y, label = "") {
      this.x = x;
      this.y = y;
      this.label = label;
      this.segmentOnPolygon = null;
    }
  }
  
  export { Point };
  