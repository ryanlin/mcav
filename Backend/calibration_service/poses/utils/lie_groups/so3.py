import numpy as np


def inverse(R: np.ndarray):
    assert R.shape == (3, 3)
    return R.T.copy()


def log(R: np.ndarray):
    """Returns so(3) as a vector of three elements on a tangent space"""
    assert R.shape == (3, 3)

    theta = np.arccos(np.clip((np.trace(R) - 1.0) / 2.0, -1.0, 1.0))

    if theta < 0.001:
        A = 0.5 + (theta ** 2.0) / 12.0 + (7.0 * theta ** 4.0) / 720.0
    else:
        A = theta / (2.0 * np.sin(theta))

    omega_x = A * (R - R.T)
    return np.array([omega_x[2, 1], -omega_x[2, 0], omega_x[1, 0]])
