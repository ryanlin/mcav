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


@pytest.fixture
def simple_graph(simple_graph_data):
    return Graph(simple_graph_data)


@pytest.fixture
def ids_poses(simple_graph):
    return get_ids_poses(simple_graph.nodes)


@pytest.mark.dependency()
def test_get_ids_poses_length(ids_poses, simple_graph):
    assert len(ids_poses) == len(simple_graph.nodes) >= 2


@pytest.mark.dependency(depends=["test_get_ids_poses_length"])
def test_get_ids_poses_data_from_bag(ids_poses):
    for poses in ids_poses.values():
        assert len(poses.timestamps) == \
            len(poses.poses) == \
            len(poses.covariances) != 0


@pytest.fixture
def synced_source_target_poses(ids_poses):
    return sync_poses(ids_poses[1], ids_poses[0])


@pytest.mark.dependency(depends=["test_get_ids_poses_data_from_bag"])
def test_sync_poses(synced_source_target_poses, ids_poses):
    lidar_poses, gps_poses = synced_source_target_poses
    assert len(lidar_poses) > len(ids_poses[1])
    assert len(gps_poses) == len(lidar_poses) != 0
    assert np.allclose(gps_poses.timestamps, lidar_poses.timestamps)


@pytest.fixture
def calibration_result(synced_source_target_poses):
    source_poses_synced, target_poses_synced = synced_source_target_poses
    return calibrate_synced_poses(source_poses_synced, target_poses_synced)


@pytest.mark.dependency(depends=["test_sync_poses"])
def test_calibrate_synced_poses_output_structure(calibration_result):
    assert isinstance(calibration_result[0], np.ndarray)
    assert isinstance(calibration_result[1], np.ndarray)
    assert isinstance(calibration_result[2], bool)
    assert isinstance(calibration_result[3], float)


@pytest.mark.dependency(depends=["test_calibrate_synced_poses_output_structure"])
def test_calibrate_synced_poses_status(calibration_result):
    statusSuccess = calibration_result[2]
    assert statusSuccess


@pytest.mark.dependency(depends=["test_calibrate_synced_poses_status"])
def test_calibrate_duality_gap(calibration_result):
    duality_gap = calibration_result[3]
    assert duality_gap < 1e-4
    print("Duality gap: " + str(duality_gap))


@pytest.mark.dependency(depends=["test_calibrate_synced_poses_status"])
def test_calibration_rotation(calibration_result):
    calibration_rotation = calibration_result[0]
    truth_rotation = np.array([
        [0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0]
    ])
    rotation_error = np.linalg.norm(
        truth_rotation - calibration_rotation, "fro")
    assert rotation_error < 0.11
    print("Rotation error: " + str(rotation_error))


@pytest.mark.dependency(depends=["test_calibrate_synced_poses_status"])
def test_calibration_translation(calibration_result):
    calibration_translation = calibration_result[1]
    truth_translation = np.array([[-1.65], [0.0], [-1.1]])
    translation_error = np.linalg.norm(
        truth_translation - calibration_translation)
    assert translation_error < 0.31
    print("Translation error: " + str(translation_error))
