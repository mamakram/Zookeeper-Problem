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
   * @param {Triangle} triangle1
   * @param {triangle} triangle2
   */

  connect(triangle1, triangle2) {
    if (this.adjList.get(triangle1) !== undefined) {
      this.adjList.get(triangle1).push(triangle2);
    } else {
      this.adjList.set(triangle1, [triangle2]);
    }
  }

  /**
   * Find the only path in the dual tree that goes between the two triangles
   * that have a special point in it
   * @param {Triangle} start source triangle
   * @param {Triangle} dest dest triangle
   * @returns List of triangles that are on the path
   */
  dfs_paths(start, dest) {
    let stack = [[start, [start]]];

    while (!(stack.length === 0)) {
      let tmp = stack.pop();
      let tr_vertex = tmp[0];
      let path = tmp[1];
      if (!tr_vertex.visited) {
        if (tr_vertex === dest) {
          for (const key of this.adjList.keys()) {
            //reset visited
            key.visited = false;
          }
          console.log("In dfs : ", path)
          return path;
        }
        tr_vertex.visited = true;

        let neighbors = this.adjList.get(tr_vertex);
        for (let i = 0; i < neighbors.length; i++) {
          stack.push([neighbors[i], path.concat([neighbors[i]])]);
        }
      }
    }
  }
}
export { Graph };
