import numpy as np
from .lie_groups import SE3


def compute_motion(T1: np.ndarray, T2: np.ndarray):
    return SE3.inverse(T1) @ T2
