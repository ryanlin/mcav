# Constraint construction adopted and configured from
# https://github.com/utiasSTARS/certifiable-calibration/blob/master/python/extrinsic_calibration/solver/constraint_gen.py

import numpy as np
import cvxpy as cp


def construct_P():
    X_gamma = cp.Variable(1)
    P = __construct_gamma(X_gamma)

    # Row orthogonality
    X_R = cp.Variable((3, 3), symmetric=True)
    P = P + __construct_R(X_R)

    # Column orthogonality
    X_C = cp.Variable((3, 3), symmetric=True)
    P = P + __construct_C(X_C)

    # Right handedness
    X_ijk = cp.Variable((3, 1))
    X_jki = cp.Variable((3, 1))
    X_kij = cp.Variable((3, 1))
    P = P + __construct_H(X_ijk, X_jki, X_kij)

    return P, X_gamma


def __kronecker(A, B):
    expr = []
    for i in range(A.shape[0]):
        for k in range(B.shape[0]):
            temp_list = []
            for j in range(A.shape[1]):
                for l in range(B.shape[1]):
                    temp_list.append(-A[i, j] * B[k, l])
            expr.append(temp_list)
    return expr


def __skew_symmetric(V: np.ndarray):
    return cp.vstack([cp.hstack([0, -V[2, 0], V[1, 0]]),
                      cp.hstack([V[2, 0], 0, -V[0, 0]]),
                      cp.hstack([-V[1, 0], V[0, 0], 0])])


def __skew_symmetric_neg(V: np.ndarray):
    return cp.vstack([cp.hstack([0, V[2, 0], -V[1, 0]]),
                      cp.hstack([-V[2, 0], 0, V[0, 0]]),
                      cp.hstack([V[1, 0], -V[0, 0], 0])])


def __add_lin_combination(X, list) -> cp.constraints:
    list_len = len(list)
    [list[i].append(cp.Constant(0)) for i in range(list_len)]
    temp_list = [cp.hstack(list[i]) for i in range(list_len)]
    temp_list.append(cp.hstack([cp.Constant(0),
                                cp.Constant(0),
                                cp.Constant(0),
                                cp.Constant(0),
                                cp.Constant(0),
                                cp.Constant(0),
                                cp.Constant(0),
                                cp.Constant(0),
                                cp.Constant(0),
                                X[0, 0] + X[1, 1] + X[2, 2]]))
    return cp.vstack(temp_list)


def __construct_C(X):
    return __add_lin_combination(X, __kronecker(X, np.eye(3)))


def __construct_R(X):
    return __add_lin_combination(X, __kronecker(np.eye(3), X))


def __construct_H(X_ijk, X_jki, X_kij):
    zero_matrix = np.zeros((3, 3))
    row1 = cp.hstack([zero_matrix,
                      __skew_symmetric_neg(X_ijk),
                      __skew_symmetric(X_kij),
                      -X_jki])
    row2 = cp.hstack([__skew_symmetric(X_ijk),
                      zero_matrix,
                      __skew_symmetric_neg(X_jki),
                      -X_kij])
    row3 = cp.hstack([cp.vstack([__skew_symmetric_neg(X_kij), -X_jki.T]),
                      cp.vstack([__skew_symmetric(X_jki), -X_kij.T]),
                      cp.vstack([zero_matrix, -X_ijk.T]),
                      cp.vstack([-X_ijk, cp.Constant([[0]])])])
    return cp.vstack([row1, row2, row3])


def __construct_gamma(X):
    expr = np.zeros((10, 10)).tolist()
    expr[9][9] = -X
    return __np_to_cp(expr)


def __np_to_cp(expr):
    num_rows = len(expr)
    rows = [cp.hstack(expr[i]) for i in range(num_rows)]
    return cp.vstack(rows)
