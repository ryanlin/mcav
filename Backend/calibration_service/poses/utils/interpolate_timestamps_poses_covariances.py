from .lie_groups import SE3
from .lie_groups import se3
import numpy as np
from typing import Optional, Tuple


def interpolate_timestamps_poses_covariances(timestamp_target: np.ndarray,
                                             timestamp_interp: np.ndarray,
                                             poses: np.ndarray,
                                             covariances: Optional[np.ndarray] = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Interpolate pose transforms and convariances by comparing timestamps.

    Returns interpolated timestamp, poses, and convariances
    """
    interp_transforms = []
    interp_covariances = []
    interp_timestamp = []

    h = 0  # tracking target timestamp
    i = 0  # tracking begin of timestamp to be interpolated
    j = 1  # tracking end of timestamp to be interpolated
    while j < len(timestamp_interp) and h < len(timestamp_target):
        # If target timestamp is behind, move to next target timestamp
        if timestamp_target[h] < timestamp_interp[i]:
            h += 1

        # If interpolating timestamps are behind, move to next pair of timestamps
        elif timestamp_target[h] > timestamp_interp[j]:
            i += 1
            j += 1

        # Interpolate pair of timestamps to the target timestamp
        else:
            timeLength = timestamp_interp[j] - timestamp_interp[i]

            # If there are duplicating timestamps, move to next pair of timestamps
            if timeLength == 0.0:
                i += 1
                j += 1
                continue

            # Compute t between two timestamps
            timeInterval = timestamp_target[h] - timestamp_interp[i]
            t = float(timeInterval) / float(timeLength)

            # Get consecutive transforms
            interp_i_SE3 = poses[i]
            interp_j_SE3 = poses[j]

            # Interpolate transforms
            interp_transforms.append(
                __interpolate_pose(interp_i_SE3, interp_j_SE3, t))

            # Interpolate covariances
            if covariances is not None:
                assert len(covariances.shape) == 1 \
                    or len(covariances.shape) == 3

                # Get consecutive covariances
                interp_i_cov = covariances[i]
                interp_j_cov = covariances[j]

                interp_covariances.append(
                    __interpolate_covariance(interp_i_cov, interp_j_cov, t))

            interp_timestamp.append(timestamp_target[h])
            h += 1

    # Organize lists into numpy arrays
    interp_timestamp = np.array(interp_timestamp)
    interp_transforms = np.stack(interp_transforms)

    if not interp_covariances:
        # No covariance provided
        interp_covariances = None
    else:
        # Covariance calculated
        interp_covariances = np.array(interp_covariances)

    return interp_timestamp, interp_transforms, interp_covariances


def __interpolate_pose(pose1: np.ndarray, pose2: np.ndarray, t: float) -> np.ndarray:
    """Interpolate two poses."""
    assert pose1.shape == (4, 4)
    assert pose2.shape == (4, 4)

    return pose1 @ se3.exp(t * SE3.log(SE3.inverse(pose1) @ pose2))


def __interpolate_covariance(cov1: np.ndarray, cov2: np.ndarray, t: float) -> np.ndarray:
    """Interpolate two covariance matrices"""
    assert type(cov1) is type(cov2)
    assert t >= 0.0 and t <= 1.0

    if isinstance(cov1, np.ndarray):
        return __exp_covariance((1 - t) * __log_covariance(cov1) + t * __log_covariance(cov2))
    elif isinstance(cov1, float):
        return (1 - t) * cov1 + t * cov2
    else:
        raise ValueError("Covariance can only be float or numpy array")


def __log_covariance(cov: np.ndarray) -> np.ndarray:
    """Compute log of covariance matrix"""
    w, v = np.linalg.eig(cov)
    return v @ np.diag(np.log(w)) @ v.T


def __exp_covariance(algebra: np.ndarray) -> np.ndarray:
    """Compute exp of covariance matrix"""
    w, v = np.linalg.eig(algebra)
    return v @ np.diag(np.exp(w)) @ v.T
