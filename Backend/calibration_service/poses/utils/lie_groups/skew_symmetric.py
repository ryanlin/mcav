import numpy as np


def skew_symmetric(omega: np.ndarray):
    """Returns skew symmetric matrix from vector."""
    assert omega.shape == (3,)
    return np.array([[0, -omega[2], omega[1]],
                     [omega[2], 0, -omega[0]],
                     [-omega[1], omega[0], 0]])
