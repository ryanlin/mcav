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
    source_node_key: int
    target_node_key: int


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
            if message_node["key"] in self.nodes:
                raise ValueError(
                    "Cannot have multiple nodes with the same key: " + str(message_node["key"]))

            self.nodes[message_node["key"]] = NodeInformation(message_node["type"],
                                                              message_node["topic"],
                                                              message_node["rosbagPath"])

            if self.nodes[message_node["key"]].type not in ["pose"]:
                raise ValueError(
                    "Must provide valid sensor type: " + str(message_node["key"]))

            if '/' not in self.nodes[message_node["key"]].topic:
                raise ValueError("Must provide sensor topic: " +
                                 str(message_node["key"]))

            if not self.nodes[message_node["key"]].rosbag_path:
                raise ValueError(
                    "Must provide valid sensor rosbag_path: " + str(message_node["key"]))

        encountered_nodes = set()

        for message_edge in message_edges:
            if message_edge["key"] in self.edges:
                raise ValueError(
                    "Cannot have multiple edges with the same key: " + str(message_edge["key"]))

            if message_edge["sourceNodeKey"] not in self.nodes:
                raise ValueError(
                    "Source node key does not exist in the list of nodes: " + str(message_edge["key"]))

            if message_edge["targetNodeKey"] not in self.nodes:
                raise ValueError(
                    "Target node key does not exist in the list of nodes: " + str(message_edge["key"]))

            for edge in self.edges.values():
                if message_edge["sourceNodeKey"] == edge.source_node_key and message_edge["targetNodeKey"] == edge.target_node_key:
                    raise ValueError(
                        "Cannot have two or more edges pointing between the same source and target nodes: " + str(message_edge["key"]))

            self.edges[message_edge["key"]] = EdgeInformation(message_edge["sourceNodeKey"],
                                                              message_edge["targetNodeKey"])

            encountered_nodes.add(message_edge["sourceNodeKey"])
            encountered_nodes.add(message_edge["targetNodeKey"])

        if len(encountered_nodes) != len(self.nodes):
            raise ValueError(
                "One or more nodes do not have any connected edge")
