/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./Polygon.js";

class Zoolygon extends Polygon {
  constructor(points) {
    super(points);
    this.cages = [];
  }

  addCage(cage) {
    this.cages.push(cage);
  }
  getCage(index) {
    return this.cageList[index];
  }
  getLastCage() {
    return this.cages[this.cages.length - 1];
  }

  drawCages() {
    for (let i = 0; i < this.cages.length; i++) this.cages[i].draw();
  }

  reset() {
    this.cages = [];
  }
}

export { Zoolygon };
