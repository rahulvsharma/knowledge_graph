"""
Knowledge Graph Module
Manages the construction, updating, and querying of the knowledge graph using NetworkX
"""

import networkx as nx
from typing import List, Dict, Tuple, Set, Any
import json


class KnowledgeGraph:
    """Class to manage knowledge graph operations"""

    def __init__(self):
        """Initialize an empty directed graph"""
        self.graph = nx.DiGraph()
        self.relationship_count = {}

    def add_relationship(self, entity1: str, relationship: str, entity2: str) -> Dict[str, Any]:
        """
        Add a relationship between two entities
        
        Args:
            entity1: Source entity
            relationship: Type of relationship
            entity2: Target entity
            
        Returns:
            Dictionary with status and message
        """
        try:
            # Normalize strings
            entity1 = entity1.strip()
            entity2 = entity2.strip()
            relationship = relationship.strip()

            if not entity1 or not entity2 or not relationship:
                return {
                    "status": "error",
                    "message": "All fields (Entity 1, Relationship, Entity 2) are required"
                }

            # Add edge with relationship type
            self.graph.add_edge(entity1, entity2, relationship=relationship)

            # Track relationship count for statistics
            if relationship not in self.relationship_count:
                self.relationship_count[relationship] = 0
            self.relationship_count[relationship] += 1

            return {
                "status": "success",
                "message": f"Relationship added: {entity1} --[{relationship}]--> {entity2}",
                "graph_stats": self.get_graph_stats()
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error adding relationship: {str(e)}"
            }

    def add_relationships_batch(self, relationships: List[Tuple[str, str, str]]) -> Dict[str, Any]:
        """
        Add multiple relationships at once
        
        Args:
            relationships: List of tuples (entity1, relationship, entity2)
            
        Returns:
            Dictionary with status, count, and any errors
        """
        added_count = 0
        errors = []

        for idx, (entity1, relationship, entity2) in enumerate(relationships):
            result = self.add_relationship(entity1, relationship, entity2)
            if result["status"] == "success":
                added_count += 1
            else:
                errors.append({
                    "row": idx + 1,
                    "error": result["message"]
                })

        return {
            "status": "success" if added_count > 0 else "error",
            "added_count": added_count,
            "total_count": len(relationships),
            "errors": errors,
            "graph_stats": self.get_graph_stats()
        }

    def query_neighbors(self, entity: str, direction: str = "both") -> Dict[str, Any]:
        """
        Query neighbors of an entity
        
        Args:
            entity: The entity to query
            direction: 'in', 'out', or 'both'
            
        Returns:
            Dictionary with neighbors and relationships
        """
        entity = entity.strip()

        # Case-insensitive lookup: find the actual node name if present
        def _find_node_ci(name: str):
            name_l = name.lower()
            for n in self.graph.nodes():
                if n.lower() == name_l:
                    return n
            return None

        actual_entity = _find_node_ci(entity)
        if actual_entity is None:
            return {
                "status": "error",
                "message": f"Entity '{entity}' not found in graph"
            }

        result = {
            "status": "success",
            "entity": entity,
            "neighbors": {}
        }

        if direction in ["out", "both"]:
            result["neighbors"]["outgoing"] = []
            for neighbor, attrs in self.graph[actual_entity].items():
                result["neighbors"]["outgoing"].append({
                    "target": neighbor,
                    "relationship": attrs.get("relationship", "unknown")
                })

        if direction in ["in", "both"]:
            result["neighbors"]["incoming"] = []
            for neighbor in self.graph.predecessors(actual_entity):
                relationship = self.graph[neighbor][actual_entity].get("relationship", "unknown")
                result["neighbors"]["incoming"].append({
                    "source": neighbor,
                    "relationship": relationship
                })

        return result

    def find_paths(self, source: str, target: str) -> Dict[str, Any]:
        """
        Find all simple paths between two entities
        
        Args:
            source: Source entity
            target: Target entity
            
        Returns:
            Dictionary with paths found
        """
        source = source.strip()
        target = target.strip()

        # Case-insensitive lookup for source/target
        def _find_node_ci(name: str):
            name_l = name.lower()
            for n in self.graph.nodes():
                if n.lower() == name_l:
                    return n
            return None

        actual_source = _find_node_ci(source)
        actual_target = _find_node_ci(target)

        if actual_source is None or actual_target is None:
            return {
                "status": "error",
                "message": "Source or target entity not found"
            }

        try:
            paths = list(nx.all_simple_paths(self.graph, actual_source, actual_target, cutoff=5))
            
            # Format paths with relationships
            formatted_paths = []
            for path in paths:
                formatted_path = []
                for i in range(len(path) - 1):
                    relationship = self.graph[path[i]][path[i + 1]].get("relationship", "unknown")
                    formatted_path.append({
                        "entity": path[i],
                        "relationship": relationship
                    })
                formatted_path.append({"entity": path[-1]})
                formatted_paths.append(formatted_path)

            return {
                "status": "success",
                "source": source,
                "target": target,
                "paths_found": len(formatted_paths),
                "paths": formatted_paths[:10]  # Limit to first 10 paths
            }
        except nx.NetworkXNoPath:
            return {
                "status": "success",
                "source": source,
                "target": target,
                "paths_found": 0,
                "paths": [],
                "message": f"No path found between {source} and {target}"
            }

    def search_by_relationship(self, relationship: str) -> Dict[str, Any]:
        """
        Search for all relationships of a specific type
        
        Args:
            relationship: Relationship type to search for
            
        Returns:
            Dictionary with matching relationships
        """
        matching_relationships = []

        for source, target, attrs in self.graph.edges(data=True):
            if attrs.get("relationship", "").lower() == relationship.lower():
                matching_relationships.append({
                    "source": source,
                    "target": target,
                    "relationship": attrs.get("relationship")
                })

        return {
            "status": "success",
            "relationship": relationship,
            "count": len(matching_relationships),
            "results": matching_relationships
        }

    def get_graph_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the graph
        
        Returns:
            Dictionary with graph statistics
        """
        return {
            "total_entities": self.graph.number_of_nodes(),
            "total_relationships": self.graph.number_of_edges(),
            "relationship_types": self.relationship_count
        }

    def get_graph_data(self) -> Dict[str, Any]:
        """
        Get graph data in format suitable for visualization
        
        Returns:
            Dictionary with nodes and links for D3.js/Cytoscape visualization
        """
        nodes = []
        links = []
        node_indices = {}

        # Add all nodes
        for idx, node in enumerate(self.graph.nodes()):
            node_indices[node] = idx
            nodes.append({
                "id": idx,
                "label": node,
                "size": self.graph.in_degree(node) + self.graph.out_degree(node) + 10
            })

        # Add all edges
        for source, target, attrs in self.graph.edges(data=True):
            links.append({
                "source": node_indices[source],
                "target": node_indices[target],
                "relationship": attrs.get("relationship", "related")
            })

        return {
            "nodes": nodes,
            "links": links
        }

    def export_json(self) -> str:
        """
        Export graph as JSON
        
        Returns:
            JSON string representation of the graph
        """
        data = {
            "nodes": list(self.graph.nodes()),
            "edges": [
                {
                    "source": source,
                    "target": target,
                    "relationship": attrs.get("relationship")
                }
                for source, target, attrs in self.graph.edges(data=True)
            ],
            "stats": self.get_graph_stats()
        }
        return json.dumps(data, indent=2)

    def clear(self):
        """Clear the graph"""
        self.graph.clear()
        self.relationship_count.clear()

    def remove_relationship(self, entity1: str, entity2: str) -> Dict[str, Any]:
        """
        Remove a relationship between two entities
        
        Args:
            entity1: Source entity
            entity2: Target entity
            
        Returns:
            Dictionary with status
        """
        try:
            if self.graph.has_edge(entity1, entity2):
                relationship = self.graph[entity1][entity2].get("relationship", "unknown")
                self.graph.remove_edge(entity1, entity2)
                
                # Update count
                if relationship in self.relationship_count:
                    self.relationship_count[relationship] -= 1
                    if self.relationship_count[relationship] == 0:
                        del self.relationship_count[relationship]
                
                return {
                    "status": "success",
                    "message": f"Relationship removed: {entity1} --[{relationship}]--> {entity2}",
                    "graph_stats": self.get_graph_stats()
                }
            else:
                return {
                    "status": "error",
                    "message": f"No relationship found between {entity1} and {entity2}"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error removing relationship: {str(e)}"
            }
