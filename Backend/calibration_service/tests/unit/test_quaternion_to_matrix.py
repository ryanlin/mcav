import pytest
import numpy as np
from poses import quaternion_to_matrix


def test_quaternion_to_matrix():
    # [qx, qy, qz, qw]
    quaternion = np.array([0.0, 0.0, 0.6427876, 0.7660445])
    target_3D_rotation = np.array([
        [0.1736482, -0.9848077, 0.0000000],
        [0.9848077,  0.1736482, 0.0000000],
        [0.0000000,  0.0000000, 1.0000000]
    ])

    assert np.allclose(quaternion_to_matrix(quaternion), target_3D_rotation)


def test_quaternion_to_matrix_identity():
    # [qx, qy, qz, qw]
    quaternion = np.array([0.0, 0.0, 0.0, 1.0])
    target_3D_rotation = np.eye(3)

    assert np.allclose(quaternion_to_matrix(quaternion), target_3D_rotation)
