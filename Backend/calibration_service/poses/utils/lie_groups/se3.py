import numpy as np
from.skew_symmetric import skew_symmetric


def exp(omega_u: np.ndarray):
    """Returns SE(3) as a matrix on a manifold"""
    assert omega_u.shape == (6,)

    omega = omega_u[0:3]
    u = omega_u[3:6]

    theta = np.sqrt(omega.T @ omega)

    if theta < 0.001:
        A = 1.0 - (theta**2.0) / 6.0 + (theta**4.0) / 120.0
        B = 0.5 - (theta**2.0) / 24.0 + (theta**4.0) / 720.0
        C = 1.0 / 6.0 - theta**2.0 / 120.0 + (theta**4.0) / 5040.0
    else:
        A = np.sin(theta) / theta
        B = (1.0 - np.cos(theta)) / theta ** 2.0
        C = (1 - A) / theta**2.0

    omega_x = skew_symmetric(omega)

    R = np.eye(3) + A * omega_x + B * omega_x @ omega_x
    V = np.eye(3) + B * omega_x + C * omega_x @ omega_x

    return np.block([[R, V @ np.expand_dims(u, axis=1)],
                     [np.zeros(3), 1.0]])
