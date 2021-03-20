import numpy as np


def inverse(T: np.ndarray):
    assert T.shape == (4, 4)

    R = T[0:3, 0:3].copy()
    t = T[0:3, 3].copy()
    return np.block([[R.T, np.atleast_2d(-R.T @ t).T], [0.0, 0.0, 0.0, 1.0]])


def log(T: np.ndarray):
    """Returns se(3) as a vector of six elements (angular, linear) on a tangent space"""
    assert T.shape == (4, 4)

    R = T[0:3, 0:3].copy()
    t = T[0:3, 3].copy()

    theta = np.arccos(np.clip((np.trace(R) - 1.0) / 2.0, -1.0, 1.0))

    if theta < 0.001:
        A = 1.0 - (theta**2.0) / 6.0 + (theta**4.0) / 120.0
        B = 0.5 - (theta**2.0) / 24.0 + (theta**4.0) / 720.0
    else:
        A = np.sin(theta) / theta
        B = (1 - np.cos(theta)) / theta**2.0

    omega_x = A * (R - R.T)
    omega = np.array([omega_x[2, 1], -omega_x[2, 0], omega_x[1, 0]])

    V_inv = np.eye(3) - 0.5 * omega_x + 1.0 / theta**2 * \
        (1.0 - A / (2.0 * B)) * omega_x @ omega_x
    u = V_inv @ t

    return np.block([omega, u])
