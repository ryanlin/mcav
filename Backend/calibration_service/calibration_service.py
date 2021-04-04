from sys import argv
import numpy as np
import copy
import json
from typing import Tuple
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
        ids_poses[id] = node_poses

    return ids_poses


def sync_poses(poses1: Poses, poses2: Poses) -> Tuple[Poses, Poses]:
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


def fitness_score(source_egomotion_synced: np.ndarray, target_egomotion_synced: np.ndarray, transform: np.ndarray):
    """Compute rotation fitness and translation fitness."""
    assert source_egomotion_synced.shape == target_egomotion_synced.shape
    assert source_egomotion_synced[0].shape == (4, 4)
    assert transform.shape == (4, 4)

    source_egomotion_from_source = np.array([
        transform @ target_egomotion @ SE3.inverse(transform) for target_egomotion in target_egomotion_synced
    ])

    # Average error between truth and transformed source egomotion
    rotation_fitness = 0.0
    translation_fitness = 0.0
    for source_egomotion_truth, source_egomotion_transformed in zip(source_egomotion_synced, source_egomotion_from_source):
        rotation_fitness += np.linalg.norm(
            source_egomotion_truth[0:3, 0:3] - source_egomotion_transformed[0:3, 0:3], "fro")
        translation_fitness += np.linalg.norm(
            source_egomotion_truth[0:3, 3] - source_egomotion_transformed[0:3, 3])

    rotation_fitness /= float(len(source_egomotion_synced))
    translation_fitness /= float(len(source_egomotion_synced))

    return rotation_fitness, translation_fitness


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
        source_egomotion, _ = source_poses_synced.egomotion()
        target_egomotion, _ = target_poses_synced.egomotion()
        rotation_error, translation_error = fitness_score(
            source_egomotion, target_egomotion, T_star)

        edge_calibration_result = {"id": edge_id,
                                   "calibrationSucceeded": statusSuccess,
                                   "matrix": T_star.flatten().tolist(),
                                   "errScore": rotation_error + translation_error}

        edge_calibration_results.append(edge_calibration_result)

    return edge_calibration_results


if __name__ == "__main__":
    calibration_results = run_calibration_service(argv[1])

    output_json_message = json.dumps(calibration_results)
    print(output_json_message)
