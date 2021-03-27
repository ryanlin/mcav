import pytest
import numpy as np
from graph import Graph


def test_simple_graph():
    simple_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 1,
                "targetNodeID": 0
            }
        ]
    }
    '''
    Graph(simple_graph_data)


def test_not_enough_nodes_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 1,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_not_enough_edges_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 0,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
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
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_type_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 1,
                "type": "lidar",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_topic_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_bag_path_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_axes_alignment_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "North-East-Down",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_invalid_sensor_rotate_orientation_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": “North-Up-East”,
                "rotateOrientation": [0.0, 0.0, 0.7071068, 1.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_edge_same_id_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 2,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            },
            {
                "id": 0,
                "sourceNodeID": 1,
                "targetNodeID": 0
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_source_node_not_exist_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 2,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_target_node_not_exist_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 2
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)


def test_edges_same_nodes_exception():
    erroneous_graph_data = '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "East-North-Up",
                "rotateOrientation": [0.0, 0.0, 0.0, 1.0],
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 0,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
                "axesAlignment": "Up-East-North",
                "rotateOrientation": [0.0, 0.0, 0.7071068, 0.7071068],
                "possibleTopics": ["/gps_pose", "/odom"]
            }
        ],
        "edges": [
            {
                "id": 0,
                "sourceNodeID": 0,
                "targetNodeID": 1
            },
            {
                "id": 1,
                "sourceNodeID": 0,
                "targetNodeID": 1
            }
        ]
    }
    '''
    with pytest.raises(ValueError):
        Graph(erroneous_graph_data)
