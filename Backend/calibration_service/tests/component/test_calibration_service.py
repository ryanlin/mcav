import pytest
import numpy as np
from graph import Graph
from calibration_service import *


lidar_gps_graph_expected_result = ('''
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
''', {0: [0.0671, -0.0144,  0.9978, -1.5182,
          0.9979, -0.0013, -0.0671,  0.2457,
          0.0022,  0.9999,  0.0143, -1.2289,
          0.0000,  0.0000,  0.0000,  1.0000]})


multiple_graph_expected_result = ('''
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
        },
        {
            "id": 1,
            "sourceNodeID": 0,
            "targetNodeID": 0
        },
        {
            "id": 2,
            "sourceNodeID": 1,
            "targetNodeID": 1
        }
    ]
}
''', {0: [0.0671, -0.0144,  0.9978, -1.5182,
          0.9979, -0.0013, -0.0671,  0.2457,
          0.0022,  0.9999,  0.0143, -1.2289,
          0.0000,  0.0000,  0.0000,  1.0000],
      1: np.eye(4).flatten().tolist(),
      2: np.eye(4).flatten().tolist()})


@ pytest.fixture(params=[lidar_gps_graph_expected_result, multiple_graph_expected_result])
def graph_data(request):
    return request.param


def test_lidar_gps_calibration_service(graph_data):
    calibration_results = run_calibration_service(graph_data[0])

    # Ensure that there are outputs
    assert len(calibration_results) > 0

    encountered_edge_id = []
    for result in calibration_results:
        # Ensure one output per edge
        assert result["id"] not in encountered_edge_id
        encountered_edge_id.append(result["id"])

        # Ensure calibration succeeded
        assert result["calibrationSucceeded"]

        # Ensure calibration result is reasonable
        expected_transformation = np.array(graph_data[1][result["id"]])
        calibrated_transformation = np.array(result["matrix"])
        assert np.allclose(calibrated_transformation,
                           expected_transformation,
                           atol=1e-3)
