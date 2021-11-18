/**
 * Represent a minimalist graph object with an adacency list
 * The main purpose of this clss is to compute the dual graph of our polygon
 */
class Graph {
    constructor() {
      this.adjList = new Map();
    }

    /**
     * Connect two triangles in the graph if they share a common edge
     * @param {Point} point1 : center of triangle 1
     * @param {Point} point2 : center of Triangle 2
     */

    // TODO:
    //
    // ask opinion on this : passer des triangle plutôt, et que le triangle ait un attribut 
    // supplémentaire de "point spécial", càd un point dont il faut compute le plus court chemin
    //
    // -> on checkerai de nos triangles en paramètre s'ils ont un point spécial, auquel cas on garde le 
    // triangle en mémoire -> mais on connnecte quand même les centres des polygons 
    //
    // => la classe graph est forcément un arbre et on pourrait calculer le path entre les 2 triangles spéciaux 
    //directement ici  
    connect(point1, point2) { 
      if (this.adjList.get(point1) !== undefined) {
        this.adjList.get(point1).push(point2);
      } else {
        this.adjList.set(point1, [point2]);
      }
    }
  }
export { Graph }; 