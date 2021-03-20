import numpy as np
from .lie_groups import adjoint
from .lie_groups import SE3


def compute_motion_covariance(T1: np.ndarray, T2: np.ndarray, cov1: np.ndarray, cov2: np.ndarray) -> np.ndarray:
    assert T1.shape == (4, 4)
    assert T2.shape == (4, 4)
    assert cov1.shape == (6, 6)
    assert cov2.shape == (6, 6)

    Adj_1 = adjoint(T1)
    Adj_2_inv = adjoint(SE3.inverse(T2))

    A = Adj_2_inv @ Adj_1

    return A @ cov1 @ A.T + cov2
