/* eslint-disable no-undef, no-unused-vars */
import { Polygon } from "./Polygon.js";
import { Funnel } from "./Funnel.js"

/**
 * class to represent Zoolygon on canvas (i.e Polygon with cages)
 */
class Zoolygon extends Polygon {
  constructor(points) {
    super(points);
    this.cages = [];
    this.funnel = undefined
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

  drawFunnel() {
    this.funnel.draw();
  }

  reset() {
    this.cages = [];
  }
}

export { Zoolygon };
