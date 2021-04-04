from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict


def plot(names_trajectories: Dict[str, np.ndarray],
         start=None,
         end=None,
         arrow_length=1.0,
         orientation=True):
    """
    Plot trajectory.

    Key as string name and value as (N x 6) numpy variable.
    The first 3 elements are translations.
    The latter 3 elements are unit vector of heading (body frame's y-axis).
    """
    # Obtain trajectory within the start and end range
    names_trajectories_sized = {}
    if start is not None and end is not None:
        for name, trajectory in names_trajectories.items():
            names_trajectories_sized[name] = trajectory[start:end]
    elif start is not None:
        for name, trajectory in names_trajectories.items():
            names_trajectories_sized[name] = trajectory[start:]
    elif end is not None:
        for name, trajectory in names_trajectories.items():
            names_trajectories_sized[name] = trajectory[:end]
    else:
        names_trajectories_sized = names_trajectories.copy()

    fig = plt
    ax = fig.gca(projection='3d')

    # Plot trajectory with orientation
    if orientation:
        for name, trajectory in names_trajectories_sized.items():
            ax.quiver(trajectory[:, 0],
                      trajectory[:, 1],
                      trajectory[:, 2],
                      trajectory[:, 3],
                      trajectory[:, 4],
                      trajectory[:, 5],
                      label=name,
                      color=np.clip(np.random.rand(3,), 0.3, 0.7),
                      length=arrow_length, arrow_length_ratio=0.3)

    # Plot trajectory only
    else:
        for name, trajectory in names_trajectories_sized.items():
            ax.scatter3D(trajectory[:, 0],
                         trajectory[:, 1],
                         trajectory[:, 2],
                         label=name,
                         color=np.clip(np.random.rand(3,), 0.3, 0.7),
                         s=2.0)

    ax.set_xlim3d(-50, 50)
    ax.set_ylim3d(-50, 50)
    ax.set_zlim3d(-50, 50)

    ax.set_xlabel('X axis')
    ax.set_ylabel('Y axis')
    ax.set_zlabel('Z axis')

    fig.legend()
    fig.draw()
