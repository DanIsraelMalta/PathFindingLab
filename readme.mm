# PathFindingLab

**PathFindingLab** is an interactive web-based visualization and testing suite designed to explore, benchmark, and visualize pathfinding and maze generation algorithms in real time. Built with React, TypeScript, and Tailwind CSS, the application offers step-by-step pathfinding visual animations, customizable grid sizes, movement models (4-way vs 8-way), heuristic choices, obstacle placement, and dynamic metric tracking. You can try the live interactive application online at [https://danisraelmalta.github.io/PathFindingLab/](https://danisraelmalta.github.io/PathFindingLab/).

## Pathfinding Algorithms

| Algorithm | Category | Optimal Path? | Description |
| :--- | :--- | :---: | :--- |
| **A\* (A-Star)** | Graph-Based | Yes | Uses distance from start $g(n)$ plus estimated heuristic cost $h(n)$ to target to efficiently find the shortest path. |
| **Dijkstra's Algorithm** | Graph-Based | Yes | Uninformed search algorithm that explores nodes in increasing order of cumulative path distance. |
| **Greedy Best-First Search** | Graph-Based | No | Uses only the heuristic estimate $h(n)$ to aggressively steer search directly toward the target. |
| **Breadth-First Search (BFS)** | Graph-Based | Yes (Unweighted) | Explores nodes level by level, guaranteeing the shortest path in unweighted uniform grids. |
| **Depth-First Search (DFS)** | Graph-Based | No | Traverses deep down branches before backtracking; useful for maze exploration but does not guarantee shortest path. |
| **Jump Point Search (JPS)** | Graph-Based | Yes | Accelerated variation of A* for uniform grids that skips redundant intermediate nodes via directional jumps. |
| **Bidirectional A\*** | Graph-Based | Yes | Runs two simultaneous A* searches from start and target until their frontiers meet, reducing search space. |
| **Theta\*** | Graph-Based | Yes (Any-Angle) | Any-angle pathfinding algorithm extending A* by allowing line-of-sight checks to parent nodes for smoother paths. |
| **D\* Lite** | Graph-Based | Yes | Incremental heuristic search algorithm that efficiently recalculates paths when grid obstacles change dynamically. |
| **RRT** | Sample-Based | No | Rapidly-exploring Random Tree that builds a space-filling tree by sampling random points across the map. |
| **RRT\*** | Sample-Based | Asymptotically | Extends RRT by rewiring nearby tree nodes to continually optimize path length toward optimal quality. |
| **Informed RRT\*** | Sample-Based | Asymptotically | Focuses random sampling within an elliptical region defined by the current best solution cost to speed up convergence. |
| **PRM** | Sample-Based | Asymptotically | Probabilistic Roadmap method that pre-samples free configuration space and connects sample points to form a search graph. |
| **Artificial Potential Field (APF)** | Reactive & Physics | No | Guides the agent using attractive virtual forces toward the target combined with repulsive forces away from obstacle walls. |
| **Bug 1 Algorithm** | Reactive & Physics | No | Simple sensor-based agent that navigates straight toward the target and fully circles obstacles upon impact before proceeding. |
| **Bug 2 Algorithm** | Reactive & Physics | No | Sensor-based agent that travels along a direct start-to-target line ("m-line") and follows obstacle boundaries until crossing it again. |

## Maze Generation Algorithms

| Maze Algorithm | Strategy | Characteristics & Visual Style |
| :--- | :--- | :--- |
| **30% Random Grid** | Stochastic Noise | Places random obstacle walls across 30% of the canvas grid cells. |
| **Recursive Division** | Divide & Conquer | Repeatedly subdivides the grid into smaller sub-chambers with random wall segments containing passage gaps. |
| **Randomized Prim's** | Minimum Spanning Tree | Grows a maze organically outward from a single starting cell by randomly carving walls into adjacent cells. |
| **DFS Backtracker** | Depth-First Search Stack | Carves long, winding passages with deep dead-ends and low branching factor via recursive stack backtracking. |
| **Randomized Kruskal's** | Disjoint Sets | Merges random disconnected passages across distinct sets to create a uniform, highly randomized spanning tree maze. |
| **Eller's Algorithm** | Row-by-Row Generation | Generates infinite-length mazes row by row with $O(1)$ memory overhead using set-based passage connectivity. |
| **Wilson's Algorithm** | Loop-Erased Random Walk | Generates unbiased uniform spanning trees by running loop-erased random walks until every cell is incorporated. |
| **Sidewinder** | Horizontal Run & Vertical Carve | Builds passage runs horizontally across each row and carves a single random passage northward per run. |
| **Spiral Pattern** | Geometric Construction | Constructs a continuous inwards spiral corridor toward the center of the grid canvas. |

***

DevOps and deployment were done using Google Gemini and it felt great.
