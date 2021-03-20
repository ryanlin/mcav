import pytest
import numpy as np
from poses import Poses
from calibration import calibrate


@pytest.fixture
def gps_poses():
    gps_poses = Poses.from_pose_bag(
        "/gps_pose", "input_data/lidar_odom.bag")
    return gps_poses


@pytest.fixture
def lidar_poses():
    lidar_poses = Poses.from_pose_bag(
        "/odom", "input_data/lidar_odom.bag")

    rotation_trajectory = np.array(
        [[0.0, 0.0, 1.0, 0.0],
         [1.0, 0.0, 0.0, 0.0],
         [0.0, 1.0, 0.0, 0.0],
         [0.0, 0.0, 0.0, 1.0]])
    lidar_poses.transform_pose_(rotation_trajectory)

    rotation_orientation = np.array(
        [[0.1736482, -0.9848077, 0.0000000],
         [0.9848077,  0.1736482, 0.0000000],
         [0.0000000,  0.0000000, 1.0000000]])
    lidar_poses.rotate_orientation_(rotation_orientation)

    return lidar_poses


def test_gps_poses_from_bag_creation(gps_poses):
    """Test the creation of the GPS pose by parsing a bag file"""
    assert len(gps_poses.timestamps) == \
        len(gps_poses.poses) == \
        len(gps_poses.covariances) != 0


def test_lidar_poses_from_bag_creation(lidar_poses):
    """Test the creation of the LiDAR pose by parsing a bag file"""
    assert len(lidar_poses.timestamps) == \
        len(lidar_poses.poses) == \
        len(lidar_poses.covariances) != 0


@pytest.fixture
def lidar_poses_sync(lidar_poses, gps_poses):
    lidar_poses.sync_(gps_poses.timestamps)
    return lidar_poses


@pytest.fixture
def gps_poses_sync(gps_poses, lidar_poses_sync):
    gps_poses.sync_(lidar_poses_sync.timestamps)
    return gps_poses


def test_interpolation_gps_lidar_poses_timestamp_sync(gps_poses_sync, lidar_poses_sync):
    """Test the interpolated timestamps between GPS and LiDAR poses"""
    assert len(lidar_poses_sync.timestamps) == len(gps_poses_sync.timestamps)
    assert np.allclose(lidar_poses_sync.timestamps, gps_poses_sync.timestamps)


def test_gps_egomotion_size(gps_poses_sync):
    """Test that relative motion and covariances of GPS are one data point less than poses"""
    T, cov = gps_poses_sync.egomotion()
    assert len(T) == len(cov) != 0
    assert len(T) == len(gps_poses_sync.timestamps) - 1


def test_lidar_egomotion_size(lidar_poses_sync):
    """Test that relative motion and covariances of LiDAR are one data point less than poses"""
    T, cov = lidar_poses_sync.egomotion()
    assert len(T) == len(cov) != 0
    assert len(T) == len(lidar_poses_sync.timestamps) - 1


@pytest.fixture
def calibration_result(gps_poses_sync, lidar_poses_sync):
    T1, cov1 = gps_poses_sync.egomotion()
    T2, cov2 = lidar_poses_sync.egomotion()
    return calibrate(T1, T2, cov1, cov2)


def test_gps_lidar_calibration_output_data_type(calibration_result):
    """Test that the output of calibration are of correct types and sizes"""
    # Rotation
    assert isinstance(calibration_result[0], np.ndarray)
    assert calibration_result[0].shape == (3, 3)
    # Translation
    assert isinstance(calibration_result[1], np.ndarray)
    assert calibration_result[1].shape == (3, 1)
    # Calibration status
    assert isinstance(calibration_result[2], bool)


def test_gps_lidar_calibration_status(calibration_result):
    """Test that the calibration between LiDAR and GPS is successful"""
    statusSuccess = calibration_result[2]
    assert statusSuccess


def test_gps_lidar_calibration_rotation(calibration_result):
    """Test that the calibration rotation error between LiDAR and GPS is small"""
    calibration_rotation = calibration_result[0]
    truth_rotation = np.eye(3)
    rotation_error = np.linalg.norm(
        truth_rotation - calibration_rotation, "fro")
    assert rotation_error < 0.5


def test_gps_lidar_calibration_translation(calibration_result):
    """Test that the calibration translation error between LiDAR and GPS is small"""
    calibration_translation = calibration_result[1]
    truth_translation = np.array([[0.0, 2.0, 0.75]])
    translation_error = np.linalg.norm(np.squeeze(
        truth_translation - calibration_translation))
    assert translation_error < 7.8
