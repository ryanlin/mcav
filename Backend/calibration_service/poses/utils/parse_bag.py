from .quaternion_to_matrix import quaternion_to_matrix
from .lie_groups import SE3, SO3
import pandas as pd
import numpy as np
from bagpy import bagreader
from typing import Tuple


def parse_bag(topic: str, bag_file_path: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Parse rosbag to obtain timestamp, transforms, and covariances.
    """
    # Parse rosbag
    df_pose = pd.read_csv(bagreader(bag_file_path).message_by_topic(topic))

    time_stamp = df_pose["Time"].to_numpy()
    covariance = df_pose["pose.covariance"].tolist()

    x = df_pose["pose.pose.position.x"].to_numpy()
    y = df_pose["pose.pose.position.y"].to_numpy()
    z = df_pose["pose.pose.position.z"].to_numpy()

    qx = np.atleast_2d(df_pose["pose.pose.orientation.x"].to_numpy()).T
    qy = np.atleast_2d(df_pose["pose.pose.orientation.y"].to_numpy()).T
    qz = np.atleast_2d(df_pose["pose.pose.orientation.z"].to_numpy()).T
    qw = np.atleast_2d(df_pose["pose.pose.orientation.w"].to_numpy()).T

    # Convert quaternions to rotation matrices
    quaternion = np.block([qx, qy, qz, qw])
    R = np.apply_along_axis(quaternion_to_matrix, 1, quaternion)

    # Organize transforms
    transforms = np.array(
        [np.block([[R[i], np.array([[x[i]], [y[i]], [z[i]]])],
                   [0.0, 0.0, 0.0, 1.0]])
         for i in range(len(time_stamp))])

    return (time_stamp, transforms, covariance)
