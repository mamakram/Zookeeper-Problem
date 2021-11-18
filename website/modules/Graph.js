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
     * Find the only path in our Graph that connects a source point
     * to a destination point.
     * This will give us the relative path from where to start a funnel.
     * @param {Point} source 
     * @param {Point} destination 
     * 
     * @returns don't know yet, maybe a list of crossedSegments ? 
  
    findPath(sourceTriangle, destTriangle){
      this.DFS(sourceTriangle);
    }
    /**
    
    
    DFS(u){
      u.visited = true;
      let neighbors = this.adjList.get(u);
      for (let i=0; i< neighbors.length; i++){
        if (!neighbors[i].visited){
          this.DFS(neighbors[i])
        }
      }
    }
     */

    /**
     * Find the only path in the dual tree that goes between the two triangles
     * that have a special point in it 
     * @param {Triangle} start source triangle 
     * @param {Triangle} dest dest triangle
     * @returns List of triangles that are on the path
     */
    dfs_paths(start, dest){
      let stack = [[start, [start]]]

      while (!(stack.length===0)){
        let tmp = stack.pop();
        let tr_vertex = tmp[0];
        let path = tmp[1];
        if (!tr_vertex.visited){
          if (tr_vertex === dest){
            console.log("Path found : ", path)
            return path;
          }      
          tr_vertex.visited = true;

          let neighbors = this.adjList.get(tr_vertex);
          console.log("Neighbors : ", neighbors)
          for (let i=0; i< neighbors.length; i++){
            stack.push([neighbors[i], path.concat([neighbors[i]])])
          }
        }
      }   
    }
  }
export { Graph }; 