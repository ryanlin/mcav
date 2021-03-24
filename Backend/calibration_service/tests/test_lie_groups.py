import pytest
import numpy as np
import math
import poses.utils.lie_groups.SO3 as SO3
import poses.utils.lie_groups.so3 as so3
import poses.utils.lie_groups.SE3 as SE3
import poses.utils.lie_groups.se3 as se3


def random_rot_matrix(d: int) -> np.ndarray:
    a = np.random.rand(d)
    a = a / np.linalg.norm(a)
    t = np.random.rand() * 2 * math.pi
    c = math.cos(t)
    s = math.sin(t)
    C = 1 - c
    x, y, z = a

    return np.array([[x * x * C + c, x * y * C - z * s, x * z * C + y * s],
                     [y * x * C + z * s, y * y * C + c, y * z * C - x * s],
                     [z * x * C - y * s, z * y * C + x * s, z * z * C + c]])


@pytest.fixture
def random_SO3_matrix():
    return random_rot_matrix(3)


@pytest.fixture
def random_SE3_matrix(random_SO3_matrix):
    R = random_SO3_matrix
    t = np.random.rand(3, 1)
    return np.block([[R, t], [0, 0, 0, 1]])


def test_SO3_inverse(random_SO3_matrix):
    assert np.allclose(SO3.inverse(random_SO3_matrix) @ random_SO3_matrix,
                       np.eye(3))
    assert np.allclose(SO3.inverse(random_SO3_matrix) @ random_SO3_matrix,
                       random_SO3_matrix @ SO3.inverse(random_SO3_matrix))


def test_SE3_inverse(random_SE3_matrix):
    assert np.allclose(SE3.inverse(random_SE3_matrix) @ random_SE3_matrix,
                       np.eye(4))
    assert np.allclose(SE3.inverse(random_SE3_matrix) @ random_SE3_matrix,
                       random_SE3_matrix @ SE3.inverse(random_SE3_matrix))


@pytest.fixture
def SE3_matrix():
    return SE3.inverse(np.array([
        [0.0, -1.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ]))


@pytest.fixture
def se3_matrix():
    return np.array([0.0, 0.0, -1.57079633, -1.57079633, 0.0, 0.0])


def test_SE3_log(SE3_matrix, se3_matrix):
    assert np.allclose(SE3.log(SE3_matrix), se3_matrix)


def test_se3_exp(SE3_matrix, se3_matrix):
    assert np.allclose(se3.exp(se3_matrix), SE3_matrix)
