from sys import argv
import numpy as np
import copy
import json
from graph import Graph
from poses import Poses
from poses import quaternion_to_matrix
from poses.utils.lie_groups import SE3
from calibration import calibrate


def get_ids_poses(node_dict: dict):
    """Map ID to poses from node information

    @param node_dict Dict[int, NodeInformation]
    """
    ids_poses = dict()

    for id, node_info in node_dict.items():
        node_poses = Poses.from_pose_bag(
            node_info.topic, node_info.rosbag_path)

        if node_info.axes_alignment == "Up-East-North":
            # Align to East-North-Up
            rotation_trajectory = np.array(
                [[0.0, 0.0, 1.0, 0.0],
                 [1.0, 0.0, 0.0, 0.0],
                 [0.0, 1.0, 0.0, 0.0],
                 [0.0, 0.0, 0.0, 1.0]])
            node_poses.transform_pose_(rotation_trajectory)

        orientation_rotation = quaternion_to_matrix(
            np.array(node_info.rotate_orientation))
        if not np.allclose(orientation_rotation, np.eye(3)):
            node_poses.rotate_orientation_(orientation_rotation)

        ids_poses[id] = node_poses

    return ids_poses


def sync_poses(poses1: Poses, poses2: Poses):
    """Sync poses with least data to poses with most data"""
    poses1_copy = copy.deepcopy(poses1)
    poses2_copy = copy.deepcopy(poses2)

    if len(poses1_copy) < len(poses2_copy):
        poses1_copy.sync_(poses2_copy.timestamps)
        poses2_copy.sync_(poses1_copy.timestamps)
    else:
        poses2_copy.sync_(poses1_copy.timestamps)
        poses1_copy.sync_(poses2_copy.timestamps)

    return poses1_copy, poses2_copy


def calibrate_synced_poses(source_poses_synced: Poses, target_poses_synced: Poses):
    """Calibrate poses that are synced together

    return calibrated rotation, calibrated translation, fitness (error) score,
        and calibration status
    """
    assert len(source_poses_synced) == len(target_poses_synced)
    assert np.allclose(source_poses_synced.timestamps,
                       target_poses_synced.timestamps)

    source_motion, source_covariances = source_poses_synced.egomotion()
    target_motion, target_covariances = target_poses_synced.egomotion()

    R_star, t_star, statusSuccess = calibrate(
        target_motion, source_motion, target_covariances, source_covariances)

    return R_star, t_star, statusSuccess


def fitness_score(source_poses_synced: Poses, target_poses_synced: Poses, transform: np.ndarray):
    target_poses_from_transform = np.array([
        src_pose @ transform for src_pose in source_poses_synced.poses
    ])

    # Make pose start at origin
    T1_inv = SE3.inverse(target_poses_from_transform[0])
    target_poses_from_transform = np.array([
        target_pose @ T1_inv for target_pose in target_poses_from_transform
    ])

    # Average error between truth and transformed target poses
    fitness = 0.0
    for target_pose_truth, target_pose_transformed in zip(target_poses_synced.poses, target_poses_from_transform):
        fitness += np.linalg.norm(target_pose_truth - target_pose_transformed,
                                  "fro")
    fitness /= float(len(source_poses_synced))

    return fitness


def run_calibration_service(json_message: str):
    """Perform calibration on json message

    return a list of dictionary of calibration result:
        id: edge id
        calibrationSucceeded: true if calibration is successful.
        matrix: 4x4 transformation matrix horizontally flattened.
        errScore: the score for the quality of the solution.
    """
    calibration_graph = Graph(json_message)

    ids_poses = get_ids_poses(calibration_graph.nodes)

    edge_calibration_results = []
    for edge_id, edge in calibration_graph.edges.items():
        source_poses_synced, target_poses_synced = sync_poses(ids_poses[edge.source_node_id],
                                                              ids_poses[edge.target_node_id])

        R_star, t_star, statusSuccess = calibrate_synced_poses(
            source_poses_synced, target_poses_synced)

        T_star = np.block([[R_star, t_star], [0, 0, 0, 1]])

        error_score = fitness_score(
            source_poses_synced, target_poses_synced, T_star)

        edge_calibration_result = {"id": edge_id,
                                   "calibrationSucceeded": statusSuccess,
                                   "matrix": T_star.flatten().tolist(),
                                   "errScore": error_score}

        edge_calibration_results.append(edge_calibration_result)

    return edge_calibration_results


if __name__ == "__main__":
    calibration_results = run_calibration_service(argv[1])

    output_json_message = json.dumps(calibration_results)
    print(output_json_message)
