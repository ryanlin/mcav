import pytest
import numpy as np
import poses.utils.lie_groups.SE3 as SE3
from poses.utils.interpolate_timestamps_poses_covariances import __interpolate_pose
from poses.utils.interpolate_timestamps_poses_covariances import __interpolate_covariance


@pytest.fixture
def t():
    return 0.66


@pytest.fixture
def start_pose():
    return np.eye(4)


@pytest.fixture
def start_cov():
    return np.eye(6) * 0.1


@pytest.fixture
def end_pose():
    return SE3.inverse(np.array([
        [0.0, -1.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ]))


@pytest.fixture
def end_cov():
    return np.eye(6) * 0.4


@pytest.fixture
def interpolated_pose():
    return np.array([
        [0.50904142, 0.86074203, 0.0, -0.86074203],
        [-0.86074203, 0.50904142, 0.0, 0.49095858],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ])


@pytest.fixture
def interpolated_covariance():
    return np.eye(6) * 0.24966611


def test_interpolate_pose(start_pose, end_pose, t, interpolated_pose):
    assert np.allclose(__interpolate_pose(start_pose, end_pose, t),
                       interpolated_pose)


def test_interpolate_covariance(start_cov, end_cov, t, interpolated_covariance):
    assert np.allclose(__interpolate_covariance(start_cov, end_cov, t),
                       interpolated_covariance)
