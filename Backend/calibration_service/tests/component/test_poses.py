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


@pytest.mark.dependency()
def test_gps_poses_from_bag_creation(gps_poses):
    """Test the creation of the GPS pose by parsing a bag file"""
    assert len(gps_poses.timestamps) == \
        len(gps_poses.poses) == \
        len(gps_poses.covariances) != 0


@pytest.mark.dependency()
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


@pytest.mark.dependency(depends=["test_gps_poses_from_bag_creation", "test_lidar_poses_from_bag_creation"])
def test_interpolation_gps_lidar_poses_timestamp_sync(gps_poses_sync, lidar_poses_sync):
    """Test the interpolated timestamps between GPS and LiDAR poses"""
    assert len(lidar_poses_sync.timestamps) == len(gps_poses_sync.timestamps)
    assert np.allclose(lidar_poses_sync.timestamps, gps_poses_sync.timestamps)


@pytest.fixture
def gps_motion_covariance(gps_poses_sync):
    return gps_poses_sync.egomotion()


@pytest.fixture
def lidar_motion_covariance(lidar_poses_sync):
    return lidar_poses_sync.egomotion()


@pytest.mark.dependency(depends=["test_interpolation_gps_lidar_poses_timestamp_sync"])
def test_gps_egomotion_size(gps_motion_covariance):
    """Test that relative motion and covariances of GPS are one data point less than poses"""
    T, cov = gps_motion_covariance
    assert len(T) == len(cov) != 0


@pytest.mark.dependency(depends=["test_interpolation_gps_lidar_poses_timestamp_sync"])
def test_lidar_egomotion_size(lidar_motion_covariance):
    """Test that relative motion and covariances of LiDAR are one data point less than poses"""
    T, cov = lidar_motion_covariance
    assert len(T) == len(cov) != 0


@pytest.mark.dependency(depends=["test_gps_egomotion_size", "test_lidar_egomotion_size"])
def test_gps_lidar_egomotion_size(gps_motion_covariance, lidar_motion_covariance):
    """Test that relative motion and covariances of GPS and LiDAR are of the same size"""
    T_gps, _ = gps_motion_covariance
    T_lidar, _ = lidar_motion_covariance
    assert len(T_gps) == len(T_lidar)
