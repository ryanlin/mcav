import numpy as np
from dataclasses import dataclass
import json


# Store sensor information
@dataclass
class NodeInformation:
    type: str
    topic: str
    rosbag_path: str


# Store edge information
@dataclass
class EdgeInformation:
    source_node_key: int
    target_node_key: int


class Graph:
    """Store directed graph information constructed on front-end"""

    def __init__(self, message: str):
        self.nodes = dict()
        self.edges = dict()

        # Read nodes and edges from json message passed from front-end
        data = json.loads(message)
        message_nodes = data["nodes"]
        message_edges = data["edges"]

        # Ensure that there are at least two nodes and one edge
        if len(message_nodes) < 2 or len(message_edges) < 1:
            raise ValueError(
                "Must have two or more nodes and one or more edges")

        for message_node in message_nodes:
            # Each node must have a unique key
            if message_node["key"] in self.nodes:
                raise ValueError(
                    "Cannot have multiple nodes with the same key: " + str(message_node["key"]))

            # Store node information
            self.nodes[message_node["key"]] = NodeInformation(message_node["type"],
                                                              message_node["topic"],
                                                              message_node["rosbagPath"])

            # Can only handle sensor data of type pose right now
            if self.nodes[message_node["key"]].type not in ["pose"]:
                raise ValueError(
                    "Must provide valid sensor type: " + str(message_node["key"]))

            # Rostopic string must contain '/' as the first character
            if '/' not in self.nodes[message_node["key"]].topic:
                raise ValueError("Must provide sensor topic: " +
                                 str(message_node["key"]))

            # Ensure that ROS bag path is provided
            if not self.nodes[message_node["key"]].rosbag_path:
                raise ValueError(
                    "Must provide valid sensor rosbag_path: " + str(message_node["key"]))

        # Keep track of nodes that have at least one connected edge
        encountered_nodes = set()

        for message_edge in message_edges:
            # Ensure that each edge has a unique key
            if message_edge["key"] in self.edges:
                raise ValueError(
                    "Cannot have multiple edges with the same key: " + str(message_edge["key"]))

            # Ensure that the source node required by an edge exists
            if message_edge["sourceNodeKey"] not in self.nodes:
                raise ValueError(
                    "Source node key does not exist in the list of nodes: " + str(message_edge["key"]))

            # Ensure that the target node required by an edge exists
            if message_edge["targetNodeKey"] not in self.nodes:
                raise ValueError(
                    "Target node key does not exist in the list of nodes: " + str(message_edge["key"]))

            # Ensure that there are no edges with duplicate data
            for edge in self.edges.values():
                if message_edge["sourceNodeKey"] == edge.source_node_key and message_edge["targetNodeKey"] == edge.target_node_key:
                    raise ValueError(
                        "Cannot have two or more edges pointing between the same source and target nodes: " + str(message_edge["key"]))

            # Store edge information
            self.edges[message_edge["key"]] = EdgeInformation(message_edge["sourceNodeKey"],
                                                              message_edge["targetNodeKey"])

            encountered_nodes.add(message_edge["sourceNodeKey"])
            encountered_nodes.add(message_edge["targetNodeKey"])

        # All nodes must have at least one connected edge
        if len(encountered_nodes) != len(self.nodes):
            raise ValueError(
                "One or more nodes do not have any connected edge")
