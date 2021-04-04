import numpy as np
from dataclasses import dataclass
import json


@dataclass
class NodeInformation:
    type: str
    topic: str
    rosbag_path: str


@dataclass
class EdgeInformation:
    source_node_id: int
    target_node_id: int


class Graph:
    def __init__(self, message: str):
        self.nodes = dict()
        self.edges = dict()

        data = json.loads(message)
        message_nodes = data["nodes"]
        message_edges = data["edges"]

        if len(message_nodes) < 2 or len(message_edges) < 1:
            raise ValueError(
                "Must have two or more nodes and one or more edges")

        for message_node in message_nodes:
            if message_node["id"] in self.nodes:
                raise ValueError("Cannot have multiple nodes with the same id")

            self.nodes[message_node["id"]] = NodeInformation(message_node["type"],
                                                             message_node["topic"],
                                                             message_node["rosbagPath"])

            if self.nodes[message_node["id"]].type not in ["pose"]:
                raise ValueError("Must provide valid sensor type")

            if '/' not in self.nodes[message_node["id"]].topic:
                raise ValueError("Must provide sensor topic")

            if not self.nodes[message_node["id"]].rosbag_path:
                raise ValueError("Must provide valid sensor rosbag_path")

        encountered_nodes = set()

        for message_edge in message_edges:
            if message_edge["id"] in self.edges:
                raise ValueError("Cannot have multiple edges with the same id")

            if message_edge["sourceNodeID"] not in self.nodes:
                raise ValueError(
                    "Source node ID does not exist in the list of nodes")

            if message_edge["targetNodeID"] not in self.nodes:
                raise ValueError(
                    "Target node ID does not exist in the list of nodes")

            for edge in self.edges.values():
                if message_edge["sourceNodeID"] == edge.source_node_id and message_edge["targetNodeID"] == edge.target_node_id:
                    raise ValueError(
                        "Cannot have two or more edges pointing between the same source and target nodes")

            self.edges[message_edge["id"]] = EdgeInformation(message_edge["sourceNodeID"],
                                                             message_edge["targetNodeID"])

            encountered_nodes.add(message_edge["sourceNodeID"])
            encountered_nodes.add(message_edge["targetNodeID"])

        if len(encountered_nodes) != len(self.nodes):
            raise ValueError(
                "One or more nodes do not have any connected edge")
