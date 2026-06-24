/**
 * Graph_M — Hyderabad Metro graph with proper Dijkstra pathfinding.
 * Fixed from original: BFS replaced with real Dijkstra using a min-heap
 * via a simple priority queue, and speed corrected to 550 m/min (~33 km/h).
 */

class MinHeap {
  constructor() { this.heap = []; }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.heap.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].cost <= this.heap[i].cost) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].cost < this.heap[smallest].cost) smallest = l;
      if (r < n && this.heap[r].cost < this.heap[smallest].cost) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

class Graph {
  constructor() {
    this.vtces = {}; // { stationKey: { nbrs: { stationKey: distance } } }
  }

  addVertex(name) {
    this.vtces[name] = { nbrs: {} };
  }

  addEdge(v1, v2, weight) {
    if (!this.vtces[v1] || !this.vtces[v2]) return;
    this.vtces[v1].nbrs[v2] = weight;
    this.vtces[v2].nbrs[v1] = weight;
  }

  /**
   * Load graph from MongoDB edge/station documents.
   * @param {Array} edges  - Edge documents from DB
   * @param {Array} stations - Station documents from DB
   */
  loadFromData(stations, edges) {
    for (const s of stations) {
      this.addVertex(s.key);
    }
    for (const e of edges) {
      this.addEdge(e.from, e.to, e.distance);
    }
  }

  /**
   * Dijkstra shortest-path. Returns full path + distance.
   */
  dijkstra(srcKey, dstKey) {
    const dist = {};
    const prev = {};
    const visited = new Set();
    const pq = new MinHeap();

    for (const v of Object.keys(this.vtces)) {
      dist[v] = Infinity;
      prev[v] = null;
    }
    dist[srcKey] = 0;
    pq.push({ v: srcKey, cost: 0 });

    while (pq.size > 0) {
      const { v, cost } = pq.pop();
      if (visited.has(v)) continue;
      visited.add(v);
      if (v === dstKey) break;

      for (const [nbr, weight] of Object.entries(this.vtces[v].nbrs)) {
        if (visited.has(nbr)) continue;
        const newCost = cost + weight;
        if (newCost < dist[nbr]) {
          dist[nbr] = newCost;
          prev[nbr] = v;
          pq.push({ v: nbr, cost: newCost });
        }
      }
    }

    if (dist[dstKey] === Infinity) return null;

    // Reconstruct path
    const path = [];
    let cur = dstKey;
    while (cur !== null) {
      path.unshift(cur);
      cur = prev[cur];
    }

    return {
      path,
      distance: Math.round(dist[dstKey] * 10) / 10,
    };
  }

  /**
   * Count interchanges: a stop is an interchange if the line code changes
   * between consecutive stations.
   */
  countInterchanges(path) {
    let count = 0;
    const getLine = (key) => key.slice(key.indexOf("~") + 1);
    for (let i = 1; i < path.length - 1; i++) {
      const prev = getLine(path[i - 1]);
      const curr = getLine(path[i]);
      const next = getLine(path[i + 1]);
      if (curr.length === 2 && prev !== next) count++;
    }
    return count;
  }

  /**
   * Fare slab (matches Hyderabad Metro pricing).
   */
  static fare(distKm) {
    if (distKm < 2)  return 10;
    if (distKm < 4)  return 15;
    if (distKm < 6)  return 25;
    if (distKm < 8)  return 30;
    if (distKm < 10) return 35;
    if (distKm < 14) return 40;
    if (distKm < 18) return 45;
    if (distKm < 22) return 50;
    if (distKm < 26) return 55;
    return 60;
  }

  /**
   * Estimated travel time at ~33 km/h (550 m/min).
   * Returns a human-readable string.
   */
  static travelTime(distKm) {
    const totalMinutes = (distKm * 1000) / 550;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    if (hrs > 0) return `${hrs} Hr ${mins} Min`;
    return `${mins} Min`;
  }
}

export default Graph;
