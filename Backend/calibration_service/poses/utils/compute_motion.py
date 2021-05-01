import numpy as np
from .lie_groups import SE3


def compute_motion(T1: np.ndarray, T2: np.ndarray):
    """Compute relative motion from one pose to another pose"""
    return SE3.inverse(T1) @ T2
