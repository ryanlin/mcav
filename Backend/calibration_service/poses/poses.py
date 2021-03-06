from .utils import parse_bag
from .utils.lie_groups import SE3, se3, SO3, adjoint
from .utils import interpolate_timestamps_poses_covariances
from .utils import compute_motion
from .utils import compute_motion_covariance
import numpy as np
from typing import Optional, Tuple


class Poses:
    """Stores pose information in right-hand convention.

    IMPORTANT: Poses must follow the right-hand convention.
    See https://gtsam.org/2021/02/23/uncertainties-part2.html for more information.
    """

    def __init__(self, timestamps: np.ndarray, poses: np.ndarray, covariances: Optional[np.ndarray] = None):
        self.timestamps = timestamps
        self.poses = poses
        self.covariances = covariances

    @classmethod
    def from_pose_bag(cls, topic: str, bag_file_path: str):
        """Obtain pose information from rosbag file"""
        timestamps, poses, covariance_strings = parse_bag(topic, bag_file_path)

        # Process covariances.
        # If covariances are matricies
        if isinstance(covariance_strings[0], str):
            covariances = []
            for string in covariance_strings:
                # Organize covariance matrix
                covariance = np.array(
                    [float(v) for v in string[1: -1].split(',')]).reshape(6, 6).T

                # Put identity if covariance matrix has all zeros
                for i in range(6):
                    if not np.isclose(covariance[i, i], 0.0, rtol=1e-05, atol=1e-08, equal_nan=False):
                        break
                else:
                    covariances.append(np.eye(6) * 1e-3)
                    continue

                # Overestimation of rotation covariance of GPS. The car GPS sensor does not provide this.
                if covariance[3, 3] == 0.0:
                    covariance[3, 3] = 1e-3
                if covariance[4, 4] == 0.0:
                    covariance[4, 4] = 1e-3
                if covariance[5, 5] == 0.0:
                    covariance[5, 5] = 1e-3

                covariances.append(covariance)
            covariances = np.stack(covariances)

        # Else if covariances are values
        elif not np.isnan(covariance_strings[0]):
            covariances = covariance_strings.to_numpy()

        # No covariances
        else:
            covariances = None

        return cls(timestamps, poses, covariances)

    def transform_pose_(self, transform: np.ndarray):
        """Transform each pose in-place

        transform: (4x4) transformation matrix
        """
        assert transform.shape == (4, 4)
        self.poses = np.array([transform @ pose for pose in self.poses])

    def rotate_orientation_(self, transform: np.ndarray):
        """Rotate orientation at each point along the trajectory in-place

        transform: (3x3) rotation matrix
        """
        assert transform.shape == (3, 3)
        self.poses = np.array([np.block([[pose[0:3, 0:3] @ transform, np.atleast_2d(pose[0:3, 3]).T],
                                         [0.0, 0.0, 0.0, 1.0]]) for pose in self.poses])

    def __len__(self):
        return len(self.timestamps)

    def trajectory(self) -> np.ndarray:
        """Get (N x 3) trajectory coordinates."""
        return self.poses[:, 0:3, 3]

    def orientation(self) -> np.ndarray:
        """Get (N x 3) unit vector of body frame's y-axis in world frame."""
        return self.poses[:, 0:3, 1]

    def relative_trajectory_orientation(self) -> Tuple[np.ndarray, np.ndarray]:
        """Get relative trajectory coordinates and (N x 3) body frame's y-axis unit vector in world frame."""
        # Compute relative poses
        T1_inv = SE3.inverse(self.poses[0])
        relative_poses = np.array([T1_inv @ pose for pose in self.poses])

        # return trajectory, orientation
        return relative_poses[:, 0:3, 3], relative_poses[:, 0:3, 1]

    def sync_(self, timestamp_target: np.ndarray) -> np.ndarray:
        """Sync poses given target timestamps.

        Return the resulting interpolated timestamp.
        """
        self.timestamps, self.poses, self.covariances = interpolate_timestamps_poses_covariances(
            timestamp_target, self.timestamps, self.poses, self.covariances)
        return self.timestamps.copy()

    def egomotion(self) -> Tuple[np.ndarray, np.ndarray]:
        """Compute egomotion between poses.

        Return motion matrices (N-1, 4, 4) and motion covariances (N-1, 6, 6)
        """
        T1 = None
        cov1 = None
        T2 = None
        cov2 = None
        motion_list = []
        motion_cov_list = []
        for pose, cov in zip(self.poses, self.covariances):
            if T1 is None:
                T1 = pose.copy()

                if cov is None:
                    cov1 = np.eye(6)
                elif isinstance(cov, float):
                    cov1 = np.eye(6) * cov
                else:
                    cov1 = cov.copy()
            else:
                T2 = pose.copy()
                if cov is None:
                    cov2 = np.eye(6)
                elif isinstance(cov, float):
                    cov2 = np.eye(6) * cov
                else:
                    cov2 = cov.copy()

                motion_list.append(compute_motion(T1, T2))
                motion_cov_list.append(
                    compute_motion_covariance(T1, T2, cov1, cov2))

                T1 = pose.copy()
                if cov is None:
                    cov1 = np.eye(6)
                elif isinstance(cov, float):
                    cov1 = np.eye(6) * cov
                else:
                    cov1 = cov.copy()

        motion = np.stack(motion_list)
        motion_cov = np.stack(motion_cov_list)

        return motion, motion_cov

    def __relative_poses(self) -> np.ndarray:
        """Express poses in the frame of the first pose instead of in the world frame"""
        T1_inv = SE3.inverse(self.poses[0])
        return np.array([T1_inv @ pose for pose in self.poses])
