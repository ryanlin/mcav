import numpy as np
from.skew_symmetric import skew_symmetric


def exp(omega: np.ndarray):
    """Returns SO(3) as a rotation matrix on a manifold"""
    assert omega.shape == (3,)

    theta = np.sqrt(omega.T @ omega)

    if theta < 0.001:
        A = 1.0 - (theta ** 2.0) / 6.0 + (theta ** 4.0) / 120.0
        B = 0.5 - (theta ** 2.0) / 24.0 + (theta ** 4.0) / 720.0
    else:
        A = np.sin(theta) / theta
        B = (1.0 - np.cos(theta)) / theta ** 2.0

    omega_x = skew_symmetric(omega)

    return np.eye(3) + A * omega_x + B * omega_x @ omega_x
