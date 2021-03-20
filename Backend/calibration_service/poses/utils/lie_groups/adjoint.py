from .skew_symmetric import skew_symmetric
import numpy as np


def adjoint(T: np.ndarray) -> np.ndarray:
    assert T.shape == (4, 4)

    R = T[0:3, 0:3].copy()
    t = T[0:3, 3].copy()

    return np.block([[R, np.zeros((3, 3))], [skew_symmetric(t) @ R, R]])
