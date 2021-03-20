import numpy as np


def quaternion_to_matrix(quaternion: np.ndarray) -> np.ndarray:
    """
    quaternion (an array of 4 elements)
    in this order: [qx, qy, qz, qw]
    """
    assert len(quaternion.shape) == 1
    qx = quaternion[0]
    qy = quaternion[1]
    qz = quaternion[2]
    qw = quaternion[3]
    return np.array([
        [1.0 - 2.0 * qy**2.0 - 2.0 * qz**2.0,
         2 * qx * qy - 2 * qz * qw,
         2 * qx * qz + 2 * qy * qw],
        [2 * qx * qy + 2 * qz * qw,
         1.0 - 2.0 * qx**2.0 - 2.0 * qz**2.0,
         2 * qy * qz - 2 * qx * qw],
        [2 * qx * qz - 2 * qy * qw,
         2 * qy * qz + 2 * qx * qw,
         1.0 - 2.0 * qx**2.0 - 2.0 * qy**2.0]
    ])
