import * as userModel from '../models/userModel.js';
import * as issueModel from '../models/issueModel.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    return sendSuccess(res, { users }, 'User registry retrieved.');
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['CITIZEN', 'MUNICIPAL', 'ADMIN'];
    if (!role || !validRoles.includes(role.toUpperCase())) {
      return sendError(res, `Invalid role. Allowed roles are: ${validRoles.join(', ')}`, 400);
    }

    // Prevent admin from accidentally demoting themselves
    if (parseInt(id, 10) === req.user.id && role.toUpperCase() !== 'ADMIN') {
      return sendError(res, 'Administrators cannot change their own role. Ask another admin.', 403);
    }

    const updatedUser = await userModel.updateUserRole(id, role.toUpperCase());
    if (!updatedUser) {
      return sendError(res, `User with ID ${id} not found.`, 404);
    }

    return sendSuccess(res, { user: updatedUser }, `User role updated to ${role.toUpperCase()}.`);
  } catch (error) {
    next(error);
  }
};

export const getAdminOverview = async (req, res, next) => {
  try {
    const userStats = await userModel.countUsers();
    const issueStats = await issueModel.getStats();

    return sendSuccess(
      res,
      {
        users: userStats,
        issues: issueStats,
      },
      'Administrative system overview retrieved.'
    );
  } catch (error) {
    next(error);
  }
};

export const getAllIssuesAdmin = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const issues = await issueModel.getAllIssues({ category, status, search });
    return sendSuccess(res, { issues }, 'Admin issue registry retrieved.');
  } catch (error) {
    next(error);
  }
};
