import numpy as np
import cvxpy as cp
from typing import Tuple, Optional
from .utils import construct_P


def calibrate(Ta: np.ndarray,
              Tb: np.ndarray,
              cov_a: np.ndarray,
              cov_b: np.ndarray,
              rh_cons: bool = True,
              row_orthog_cons: bool = True,
              col_orthog_cons: bool = True) -> Tuple[np.ndarray, np.ndarray, bool]:
    """Finds optimal calibration parameters from sensor b to sensor a given motion data.

    :param Ra: (n x 3 x 3) rotation from sensor a
    :param ta: (n x 3 x 1) translation from sensor a
    :param Rb: (n x 3 x 3) rotation from sensor b
    :param tb: (n x 3 x 1) translation from sensor b
    :param cov_a: (n x 6 x 6) covariances from sensor a
    :param cov_b: (n x 6 x 6) covariances from sensor b
    :param rh_cons: right-handedness constraint
    :param row_orthog_cons: row orthogonality constraint
    :param col_orthog_cons: column orthogonality constraint
    :return: calibrated rotation (3 x 3), translation (3 x 1), and status (boolean)
    """
    assert len(Ta) == len(Tb) == len(cov_a) == len(cov_b) > 0
    assert Ta.shape == Tb.shape
    assert Ta[0].shape == (4, 4)
    assert cov_a.shape == cov_b.shape
    assert cov_a[0].shape == (6, 6)

    Ra = Ta[:, 0:3, 0:3].copy()
    ta = Ta[:, 0:3, 3].copy()
    Rb = Tb[:, 0:3, 0:3].copy()
    tb = Tb[:, 0:3, 3].copy()

    Mr = __construct_Mr(Ra, Rb)
    Mt = __construct_Mt(ta, Rb, tb)

    kappa_a = __kappa(cov_a)
    tao_a = __tao(cov_a)
    kappa_b = __kappa(cov_b)
    tao_b = __tao(cov_b)

    kappa = (kappa_a + kappa_b) / 2
    tao = (tao_a + tao_b) / 2

    Qr = __construct_Qr(Mr, kappa)
    Qt = __construct_Qt(Mt, tao)

    Q = np.block([[np.zeros((3, 3)), np.zeros((3, 10))],
                  [np.zeros((10, 3)), Qr]]) + Qt

    # Ensuring that Q is symmetric
    Q = 0.5 * (Q.T + Q)

    Qtt = Q[:3, :3]
    Qtr = Q[:3, 3:]
    Qrt = Q[3:, :3]
    Qrr = Q[3:, 3:]

    # Rank of Qtt must be 3 or greater
    if np.linalg.matrix_rank(Qtt) < 3:
        print('Q_{t,t} rank < 3 for data given! Exiting Solver.')
        return np.zeros((3, 3)), np.zeros((3, 1)), False

    Q_tilde = Qrr - Qrt @ np.linalg.inv(Qtt) @ Qtr
    P, gamma = construct_P(rh_cons, row_orthog_cons, col_orthog_cons)
    Z = Q_tilde + P

    # Z has to be a positive semi-definite matrix
    constraint = [cp.PSD(Z)]

    objective = cp.Maximize(gamma)
    problem = cp.Problem(objective, constraint)

    problem.solve(solver=cp.CVXOPT, abstol=1e-7, max_iters=10000,
                  refinement=100, kktsolver='robust')

    # Exit if solution was not found
    if problem.status in ["infeasible", "unbounded"]:
        print('Infeasible or unbounded.')
        return np.zeros((3, 3)), np.zeros((3, 1)), False

    # Calculate the dual value and the matrix Z
    dual_value = problem.value
    Z_opt = Z.value

    # Get r_tilde_star
    U, S, _ = np.linalg.svd(Z_opt)
    nullspace = np.logical_or(np.isclose(np.log(S), np.log(
        S[-1]), atol=7), np.isclose(S, 0, atol=10 ** (-2)))
    nullspace_rank = np.sum(nullspace)

    if nullspace_rank == 1:
        # When there is only one nullspace eigenvector
        # Get the eigenvector
        r_tilde_prime = np.atleast_2d(U[:, -1]).T
        # Grab y
        y = r_tilde_prime[-1, 0]
        # Compute r_tilde_star
        r_tilde_star = r_tilde_prime / y
    elif nullspace_rank == 2:
        # When there are two nullspace eigenvectors
        # Grab these two nullspace eigenvectors
        potential_vec = U[:, nullspace]
        # Find eigenvectors that do not have all first 9 elements equal to zero
        non_zero = [not np.allclose(
            potential_vec[:9, i].flatten(), np.zeros(9)) for i in range(2)]
        # If the first 9 elements of both eigenvectors are not all zeros, then return failure
        if np.sum(non_zero) > 1:
            print('[ERROR] The first 9 elements of both eigenvectors are not all zeros')
            return np.zeros((3, 3)), np.zeros((3, 1)), False
        # Get the eigenvector that does not have all of its first 9 elements zeros
        r_tilde_prime = potential_vec[:, non_zero]
        # Compute h
        R_prime = np.reshape(r_tilde_prime[:9, :], (3, 3), 'F')
        h = 1. / (np.abs(np.linalg.det(R_prime))) ** (1. / 3.) * \
            np.sign(np.linalg.det(R_prime))
        # Compute r_tilde_star
        r_tilde_star = r_tilde_prime * h
    else:
        # Cannot have more than 2 nullspace eigenvectors
        print('[ERROR] Cannot have more than 2 nullspace eigenvectors')
        return np.zeros((3, 3)), np.zeros((3, 1)), False

    # Compute calibrated rotation and translation
    R_star = np.reshape(r_tilde_star[:9, 0], (3, 3), order='F')
    if np.linalg.norm(R_star.T @ R_star - np.eye(3), 'fro') > 0.1:
        return np.zeros((3, 3)), np.zeros((3, 1)), False

    t_star = -(np.linalg.inv(Qtt) @ Qtr @ r_tilde_star)

    # Check that the duality gap should be zero
    x_star = np.vstack((t_star, r_tilde_star))
    primal_value = (x_star.T @ Q @ x_star).item()
    duality_gap = abs(primal_value - dual_value) / primal_value
    if duality_gap > 0.001:
        print('[WARNING] Duality gap too large: ' + str(duality_gap))
        # return np.zeros(3), np.zeros(3), False

    return R_star, t_star, True


def __construct_Qr(Mr: np.ndarray, kappa: Optional[np.ndarray] = None) -> np.ndarray:
    n = Mr.shape[0]

    if kappa is None:
        kappa = np.ones(n)

    upperLeftSum = np.zeros((9, 9))
    for i in range(n):
        Mr_i = Mr[i]
        kappa_i = kappa[i]
        upperLeftSum = upperLeftSum + kappa_i * Mr_i.T @ Mr_i

    return np.block([[upperLeftSum, np.zeros((9, 1))], [np.zeros((1, 9)), 0]])


def __construct_Qt(Mt: np.ndarray, tao: Optional[np.ndarray] = None) -> np.ndarray:
    n = Mt.shape[0]

    if tao is None:
        tao = np.ones(n)

    Qt = np.zeros((13, 13))
    for i in range(n):
        Mt_i = Mt[i]
        tao_i = tao[i]
        Qt = Qt + tao_i * Mt_i.T @ Mt_i

    return Qt


def __construct_Mr(Ra: np.ndarray, Rb: np.ndarray) -> np.ndarray:
    n = Ra.shape[0]

    Mr = []
    for i in range(n):
        Ra_i = Ra[i]
        Rb_i = Rb[i]
        Mr_i = np.kron(Ra_i.T, np.eye(3)) - np.kron(np.eye(3), Rb_i)
        Mr.append(Mr_i)

    return np.stack(Mr)


def __construct_Mt(ta: np.ndarray, Rb: np.ndarray, tb: np.ndarray) -> np.ndarray:
    n = Rb.shape[0]

    Mt = []
    for i in range(n):
        Rb_i = Rb[i]
        ta_i = np.atleast_2d(ta[i].copy()).T
        tb_i = np.atleast_2d(tb[i].copy()).T
        Mt_i = np.block([np.eye(3) - Rb_i, np.kron(ta_i.T, np.eye(3)), -tb_i])
        Mt.append(Mt_i)

    return np.stack(Mt)


def __kappa(cov: np.ndarray) -> np.ndarray:
    return np.asarray([np.linalg.norm(cov[i, 3:, 3:], ord='fro') for i in range(cov.shape[0])])


def __tao(cov: np.ndarray) -> np.ndarray:
    return np.asarray([np.linalg.norm(cov[i, 0:3, 0:3], ord='fro') for i in range(cov.shape[0])])
