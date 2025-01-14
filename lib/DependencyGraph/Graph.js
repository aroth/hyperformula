/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
var NodeVisitStatus;
(function (NodeVisitStatus) {
    NodeVisitStatus[NodeVisitStatus["ON_STACK"] = 0] = "ON_STACK";
    NodeVisitStatus[NodeVisitStatus["PROCESSED"] = 1] = "PROCESSED";
    NodeVisitStatus[NodeVisitStatus["POPPED"] = 2] = "POPPED";
})(NodeVisitStatus || (NodeVisitStatus = {}));
/**
 * Provides graph directed structure
 *
 * Invariants:
 * - this.edges(node) exists if and only if node is in the graph
 * - this.specialNodes* are always subset of this.nodes
 * - this.edges(node) is subset of this.nodes (i.e. it does not contain nodes not present in graph) -- this invariant DOES NOT HOLD right now
 */
export class Graph {
    constructor(dependencyQuery) {
        this.dependencyQuery = dependencyQuery;
        /** Set with nodes in graph. */
        this.nodes = new Set();
        this.specialNodes = new Set();
        this.specialNodesStructuralChanges = new Set();
        this.specialNodesRecentlyChanged = new Set();
        this.infiniteRanges = new Set();
        /** Nodes adjacency mapping. */
        this.edges = new Map();
    }
    /**
     * Adds node to a graph
     *
     * @param node - a node to be added
     */
    addNode(node) {
        this.nodes.add(node);
        if (!this.edges.has(node)) {
            this.edges.set(node, new Set());
        }
    }
    /**
     * Adds edge between nodes.
     *
     * The nodes had to be added to the graph before, or the error will be raised
     *
     * @param fromNode - node from which edge is outcoming
     * @param toNode - node to which edge is incoming
     */
    addEdge(fromNode, toNode) {
        if (!this.nodes.has(fromNode)) {
            throw new Error(`Unknown node ${fromNode}`);
        }
        if (!this.nodes.has(toNode)) {
            throw new Error(`Unknown node ${toNode}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.edges.get(fromNode).add(toNode);
    }
    removeEdge(fromNode, toNode) {
        if (this.existsEdge(fromNode, toNode)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.edges.get(fromNode).delete(toNode);
        }
        else {
            throw new Error('Edge does not exist');
        }
    }
    softRemoveEdge(fromNode, toNode) {
        var _a;
        (_a = this.edges.get(fromNode)) === null || _a === void 0 ? void 0 : _a.delete(toNode);
    }
    removeIncomingEdges(toNode) {
        this.edges.forEach((nodeEdges) => {
            nodeEdges.delete(toNode);
        });
    }
    /**
     * Returns nodes adjacent to given node
     *
     * @param node - node to which adjacent nodes we want to retrieve
     */
    adjacentNodes(node) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.edges.get(node);
    }
    adjacentNodesCount(node) {
        return this.adjacentNodes(node).size;
    }
    /**
     * Checks whether a node is present in graph
     *
     * @param node - node to check
     */
    hasNode(node) {
        return this.nodes.has(node);
    }
    /**
     * Returns number of nodes in graph
     */
    nodesCount() {
        return this.nodes.size;
    }
    /**
     * Returns number of edges in graph
     */
    edgesCount() {
        let result = 0;
        this.edges.forEach((edgesForNode) => (result += edgesForNode.size));
        return result;
    }
    removeNode(node) {
        for (const adjacentNode of this.adjacentNodes(node).values()) {
            this.markNodeAsSpecialRecentlyChanged(adjacentNode);
        }
        this.edges.delete(node);
        this.nodes.delete(node);
        this.specialNodes.delete(node);
        this.specialNodesRecentlyChanged.delete(node);
        this.specialNodesStructuralChanges.delete(node);
        this.infiniteRanges.delete(node);
        return this.removeDependencies(node);
    }
    markNodeAsSpecial(node) {
        this.specialNodes.add(node);
    }
    markNodeAsSpecialRecentlyChanged(node) {
        if (this.nodes.has(node)) {
            this.specialNodesRecentlyChanged.add(node);
        }
    }
    markNodeAsChangingWithStructure(node) {
        this.specialNodesStructuralChanges.add(node);
    }
    clearSpecialNodesRecentlyChanged() {
        this.specialNodesRecentlyChanged.clear();
    }
    markNodeAsInfiniteRange(node) {
        this.infiniteRanges.add(node);
    }
    /**
     * Checks whether exists edge between nodes
     *
     * @param fromNode - node from which edge is outcoming
     * @param toNode - node to which edge is incoming
     */
    existsEdge(fromNode, toNode) {
        var _a, _b;
        return (_b = (_a = this.edges.get(fromNode)) === null || _a === void 0 ? void 0 : _a.has(toNode)) !== null && _b !== void 0 ? _b : false;
    }
    /*
     * return a topological sort order, but separates vertices that exist in some cycle
     */
    topSortWithScc() {
        return this.getTopSortedWithSccSubgraphFrom(Array.from(this.nodes), () => true, () => {
        });
    }
    /**
     *
     * an iterative implementation of Tarjan's algorithm for finding strongly connected compontents
     * returns vertices in order of topological sort, but vertices that are on cycles are kept separate
     *
     * @param modifiedNodes - seed for computation. During engine init run, all of the vertices of grap. In recomputation run, changed vertices.
     * @param operatingFunction - recomputes value of a node, and returns whether a change occured
     * @param onCycle - action to be performed when node is on cycle
     */
    getTopSortedWithSccSubgraphFrom(modifiedNodes, operatingFunction, onCycle) {
        const entranceTime = new Map();
        const low = new Map();
        const parent = new Map();
        const inSCC = new Set();
        // node status life cycle:
        // undefined -> ON_STACK -> PROCESSED -> POPPED
        const nodeStatus = new Map();
        const order = [];
        let time = 0;
        const sccNonSingletons = new Set();
        modifiedNodes.reverse();
        modifiedNodes.forEach((v) => {
            if (nodeStatus.get(v) !== undefined) {
                return;
            }
            const DFSstack = [v];
            const SCCstack = [];
            nodeStatus.set(v, NodeVisitStatus.ON_STACK);
            while (DFSstack.length > 0) {
                const u = DFSstack[DFSstack.length - 1];
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                switch (nodeStatus.get(u)) {
                    case NodeVisitStatus.ON_STACK: {
                        entranceTime.set(u, time);
                        low.set(u, time);
                        SCCstack.push(u);
                        time++;
                        this.adjacentNodes(u).forEach((t) => {
                            if (entranceTime.get(t) === undefined) {
                                DFSstack.push(t);
                                parent.set(t, u);
                                nodeStatus.set(t, NodeVisitStatus.ON_STACK);
                            }
                        });
                        nodeStatus.set(u, NodeVisitStatus.PROCESSED);
                        break;
                    }
                    case NodeVisitStatus.PROCESSED: { // leaving this DFS subtree
                        let uLow;
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        uLow = entranceTime.get(u);
                        this.adjacentNodes(u).forEach((t) => {
                            if (!inSCC.has(t)) {
                                if (parent.get(t) === u) {
                                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                    uLow = Math.min(uLow, low.get(t));
                                }
                                else {
                                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                    uLow = Math.min(uLow, entranceTime.get(t));
                                }
                            }
                        });
                        low.set(u, uLow);
                        if (uLow === entranceTime.get(u)) {
                            const currentSCC = [];
                            do {
                                currentSCC.push(SCCstack[SCCstack.length - 1]);
                                SCCstack.pop();
                            } while (currentSCC[currentSCC.length - 1] !== u);
                            currentSCC.forEach((t) => {
                                inSCC.add(t);
                            });
                            order.push(...currentSCC);
                            if (currentSCC.length > 1) {
                                currentSCC.forEach((t) => {
                                    sccNonSingletons.add(t);
                                });
                            }
                        }
                        DFSstack.pop();
                        nodeStatus.set(u, NodeVisitStatus.POPPED);
                        break;
                    }
                    case NodeVisitStatus.POPPED: { // it's a 'shadow' copy, we already processed this vertex and can ignore it
                        DFSstack.pop();
                        break;
                    }
                }
            }
        });
        const shouldBeUpdatedMapping = new Set(modifiedNodes);
        const sorted = [];
        const cycled = [];
        order.reverse();
        order.forEach((t) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (sccNonSingletons.has(t) || this.adjacentNodes(t).has(t)) {
                cycled.push(t);
                onCycle(t);
                this.adjacentNodes(t).forEach((s) => shouldBeUpdatedMapping.add(s));
            }
            else {
                sorted.push(t);
                if (shouldBeUpdatedMapping.has(t) && operatingFunction(t)) {
                    this.adjacentNodes(t).forEach((s) => shouldBeUpdatedMapping.add(s));
                }
            }
        });
        return { sorted, cycled };
    }
    getDependencies(vertex) {
        const result = [];
        this.edges.forEach((adjacentNodes, sourceNode) => {
            if (adjacentNodes.has(vertex)) {
                result.push(sourceNode);
            }
        });
        return result;
    }
    removeDependencies(node) {
        const dependencies = this.dependencyQuery(node);
        for (const dependency of dependencies) {
            this.softRemoveEdge(dependency, node);
        }
        return dependencies;
    }
}
