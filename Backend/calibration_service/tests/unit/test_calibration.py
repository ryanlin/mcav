import pytest
import numpy as np
import math
from calibration import calibrate
from poses.utils.lie_groups.skew_symmetric import skew_symmetric
import poses.utils.lie_groups.SE3 as SE3


def random_rotation_matrix() -> np.ndarray:
    a = np.random.rand(3)
    a = a / np.linalg.norm(a)
    t = np.random.rand() * 2 * math.pi
    c = math.cos(t)
    s = math.sin(t)
    C = 1 - c
    x, y, z = a

    return np.array([[x * x * C + c, x * y * C - z * s, x * z * C + y * s],
                     [y * x * C + z * s, y * y * C + c, y * z * C - x * s],
                     [z * x * C - y * s, z * y * C + x * s, z * z * C + c]])


def axis_angle(a: np.ndarray, t: float) -> np.ndarray:
    d = max(a.shape)
    return math.cos(t) * np.eye(d) + math.sin(t) * skew_symmetric(np.squeeze(a)) + (1 - math.cos(t)) * (a @ a.T)


def get_rotation_noise(sigma: float) -> np.ndarray:
    a = np.random.rand(3, 1) * 2 - 1
    a = a / np.linalg.norm(a)

    return axis_angle(a, np.random.rand() * sigma)


@pytest.fixture
def truth_calibration():
    R = random_rotation_matrix()
    t = np.random.rand(3, 1)
    return np.block([[R, t], [0, 0, 0, 1]])


@pytest.fixture
def config():
    return {
        "n_points": 10,
    }


@pytest.fixture
def T1(config):
    return np.array([
        np.block([[random_rotation_matrix(), np.random.rand(3, 1)], [0, 0, 0, 1]])
        for i in range(config["n_points"])
    ])


@pytest.fixture
def cov1(config):
    return np.array([np.eye(6) for i in range(config["n_points"])])


@pytest.fixture
def T2(T1, truth_calibration):
    return np.array([
        truth_calibration @ T1_i @ SE3.inverse(truth_calibration)
        for T1_i in T1
    ])


@pytest.fixture
def cov2(config):
    return np.array([np.eye(6) for i in range(config["n_points"])])


@pytest.fixture
def simple_calibration_result(T1, T2, cov1, cov2):
    return calibrate(T1, T2, cov1, cov2)


@pytest.mark.dependency()
def test_simple_calibration_result_format(simple_calibration_result):
    R_star, t_star, statusSuccess = simple_calibration_result
    # Rotation
    assert isinstance(R_star, np.ndarray)
    assert R_star.shape == (3, 3)
    # Translation
    assert isinstance(t_star, np.ndarray)
    assert t_star.shape == (3, 1)
    # Calibration status
    assert isinstance(statusSuccess, bool)


@pytest.mark.dependency(depends=["test_simple_calibration_result_format"])
def test_simple_calibration_status(simple_calibration_result):
    statusSuccess = simple_calibration_result[2]
    assert statusSuccess


def add_noise_transform(T, noise_rotation, noise_translation):
    return np.array([
        np.block([[get_rotation_noise(noise_rotation) @ T_i[0:3, 0:3],
                   T_i[0:3, 3:] + np.random.rand(3, 1) * noise_translation],
                  [0, 0, 0, 1]])
        for T_i in T
    ])


def add_noise_covariance(cov, noise):
    return np.array([
        cov_i + np.eye(6) * noise for cov_i in cov
    ])


testNoises = np.arange(0.0, 0.05, 0.01)


@pytest.mark.dependency(depends=["test_simple_calibration_status"])
@pytest.mark.parametrize("noise", testNoises)
def test_forward_calibration(T1, T2, cov1, cov2, noise, truth_calibration):
    Ta = add_noise_transform(T1, noise, noise)
    Tb = add_noise_transform(T2, noise, noise)
    cov_a = add_noise_covariance(cov1, noise)
    cov_b = add_noise_covariance(cov2, noise)

    R_star, t_star, statusSuccess = calibrate(Ta, Tb, cov_a, cov_b)
    assert statusSuccess

    rotation_error = np.linalg.norm(
        R_star - truth_calibration[0:3, 0:3], "fro")
    assert rotation_error < 0.02

    translation_error = np.linalg.norm(t_star - truth_calibration[0:3, 3:])
    assert translation_error < 0.03


@pytest.mark.dependency(depends=["test_simple_calibration_status"])
@pytest.mark.parametrize("noise", testNoises)
def test_backward_calibration(T1, T2, cov1, cov2, noise, truth_calibration):
    Ta = add_noise_transform(T1, noise, noise)
    Tb = add_noise_transform(T2, noise, noise)
    cov_a = add_noise_covariance(cov1, noise)
    cov_b = add_noise_covariance(cov2, noise)

    R_star, t_star, statusSuccess = calibrate(Tb, Ta, cov_b, cov_a)
    assert statusSuccess

    truth_calibration_inverse = SE3.inverse(truth_calibration)

    rotation_error = np.linalg.norm(
        R_star - truth_calibration_inverse[0:3, 0:3], "fro")
    assert rotation_error < 0.02

    translation_error = np.linalg.norm(
        t_star - truth_calibration_inverse[0:3, 3:])
    assert translation_error < 0.03
