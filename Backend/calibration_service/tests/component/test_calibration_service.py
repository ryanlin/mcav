import pytest
import numpy as np
from graph import Graph
from calibration_service import *


@pytest.fixture()
def simple_graph_data():
    return '''
    {
        "numberOfNodes": 2,
        "numberOfEdges": 1,
        "nodes": [
            {
                "id": 0,
                "type": "pose",
                "topic": "/gps_pose",
                "rosbagPath": "input_data/lidar_odom.bag",
                "possibleTopics": ["/gps_pose", "/odom"]
            },
            {
                "id": 1,
                "type": "pose",
                "topic": "/odom",
                "rosbagPath": "input_data/lidar_odom.bag",
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


def test_run_calibration_service(simple_graph_data):
    calibration_results = run_calibration_service(simple_graph_data)
    assert len(calibration_results) > 0

    encountered_edge_id = []
    for result in calibration_results:
        assert result["id"] not in encountered_edge_id

        encountered_edge_id.append(result["id"])

        assert result["calibrationSucceeded"]
