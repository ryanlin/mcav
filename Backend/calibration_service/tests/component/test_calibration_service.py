import pytest
import numpy as np
from graph import Graph
from calibration_service import *


lidar_gps_graph_expected_result = ('''
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
''', {0: [6.60356445e-02, - 1.43634488e-02,  9.97691136e-01, - 1.52978875e+00,
          9.97792073e-01, - 1.29353312e-03, - 6.60609615e-02,  2.46103209e-01,
          2.23983526e-03,  9.99896555e-01,  1.42464058e-02, - 1.22915233e+00,
          0.00000000e+00,  0.00000000e+00,  0.00000000e+00,  1.00000000e+00]})


lidar_lidar_graph_expected_result = ('''
{
    "nodes": [
        {
            "key": 0,
            "type": "pose",
            "topic": "/odom",
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
''', {0: np.eye(4).flatten().tolist()})


gps_gps_graph_expected_result = ('''
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
''', {0: np.eye(4).flatten().tolist()})


multiple_graph_expected_result = ('''
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
        },
        {
            "key": 1,
            "sourceNodeKey": 0,
            "targetNodeKey": 0
        },
        {
            "key": 2,
            "sourceNodeKey": 1,
            "targetNodeKey": 1
        }
    ]
}
''', {0: [6.60356445e-02, - 1.43634488e-02,  9.97691136e-01, - 1.52978875e+00,
          9.97792073e-01, - 1.29353312e-03, - 6.60609615e-02,  2.46103209e-01,
          2.23983526e-03,  9.99896555e-01,  1.42464058e-02, - 1.22915233e+00,
          0.00000000e+00,  0.00000000e+00,  0.00000000e+00,  1.00000000e+00],
      1: np.eye(4).flatten().tolist(),
      2: np.eye(4).flatten().tolist()})


disconnected_same_graph_expected_result = ('''
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
            "topic": "/gps_pose",
            "rosbagPath": "input_data/lidar_odom.bag"
        },
        {
            "key": 2,
            "type": "pose",
            "topic": "/odom",
            "rosbagPath": "input_data/lidar_odom.bag"
        },
        {
            "key": 3,
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
            "sourceNodeKey": 2,
            "targetNodeKey": 3
        }
    ]
}
''', {0: np.eye(4).flatten().tolist(),
      1: np.eye(4).flatten().tolist()})


disconnected_graph_expected_result = ('''
{
    "nodes": [
        {
            "key": 0,
            "type": "pose",
            "topic": "/odom",
            "rosbagPath": "input_data/lidar_odom.bag"
        },
        {
            "key": 1,
            "type": "pose",
            "topic": "/gps_pose",
            "rosbagPath": "input_data/lidar_odom.bag"
        },
        {
            "key": 2,
            "type": "pose",
            "topic": "/odom",
            "rosbagPath": "input_data/lidar_odom.bag"
        },
        {
            "key": 3,
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
        },
        {
            "key": 1,
            "sourceNodeKey": 2,
            "targetNodeKey": 3
        }
    ]
}
''', {0: [6.60356445e-02, - 1.43634488e-02,  9.97691136e-01, - 1.52978875e+00,
          9.97792073e-01, - 1.29353312e-03, - 6.60609615e-02,  2.46103209e-01,
          2.23983526e-03,  9.99896555e-01,  1.42464058e-02, - 1.22915233e+00,
          0.00000000e+00,  0.00000000e+00,  0.00000000e+00,  1.00000000e+00],
      1: [6.60356445e-02, - 1.43634488e-02,  9.97691136e-01, - 1.52978875e+00,
          9.97792073e-01, - 1.29353312e-03, - 6.60609615e-02,  2.46103209e-01,
          2.23983526e-03,  9.99896555e-01,  1.42464058e-02, - 1.22915233e+00,
          0.00000000e+00,  0.00000000e+00,  0.00000000e+00,  1.00000000e+00]})


@pytest.fixture(params=[lidar_gps_graph_expected_result,
                        gps_gps_graph_expected_result,
                        lidar_lidar_graph_expected_result,
                        disconnected_same_graph_expected_result,
                        disconnected_graph_expected_result,
                        multiple_graph_expected_result])
def graph_data(request):
    return request.param


def test_lidar_gps_calibration_service(graph_data):
    calibration_results = run_calibration_service(graph_data[0])

    # Ensure that there are outputs
    assert len(calibration_results) > 0

    encountered_edge_id = []
    for result in calibration_results:
        # Ensure one output per edge
        assert result["key"] not in encountered_edge_id
        encountered_edge_id.append(result["key"])

        # Ensure calibration succeeded
        assert result["calibrationSucceeded"]

        # Ensure calibration result is reasonable
        expected_transformation = np.array(graph_data[1][result["key"]])
        calibrated_transformation = np.array(result["matrix"])

        assert np.allclose(calibrated_transformation,
                           expected_transformation,
                           atol=1e-3)
