import pytest
import numpy as np
from graph import Graph


def test_simple_graph():
    simple_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 1,
                "targetNodeKey": 0
            }
        ]
    }
    '''
    Graph(simple_graph_data)


def test_not_enough_nodes_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_not_enough_edges_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": []
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_node_same_id_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_type_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 1,
                "type": "lidar",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_topic_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_bag_path_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "",
            },
            {
                "key": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_edge_same_id_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            },
            {
                "key": 0,
                "sourceNodeKey": 1,
                "targetNodeKey": 0
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_source_node_not_exist_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 2,
                "targetNodeKey": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_target_node_not_exist_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 2
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_edges_same_nodes_exception():
    erroneous_graph_data = '''
    {
        "nodes": [
            {
                "key": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag"
            },
            {
                "key": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag"
            }
        ],
        "edges": [
            {
                "key": 0,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            },
            {
                "key": 1,
                "sourceNodeKey": 0,
                "targetNodeKey": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)
