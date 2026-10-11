import * as userModel from '../models/userModel.js';
import * as issueModel from '../models/issueModel.js';
import * as municipalityModel from '../models/municipalityModel.js';
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
    const { role, municipalityId, municipalRole } = req.body;

    const validRoles = ['CITIZEN', 'MUNICIPAL', 'ADMIN'];
    if (!role || !validRoles.includes(role.toUpperCase())) {
      return sendError(res, `Invalid role. Allowed roles are: ${validRoles.join(', ')}`, 400);
    }

    // Prevent admin from accidentally demoting themselves
    if (parseInt(id, 10) === req.user.id && role.toUpperCase() !== 'ADMIN') {
      return sendError(res, 'Administrators cannot change their own role. Ask another admin.', 403);
    }

    const updatedUser = await userModel.updateUserRole(id, role.toUpperCase(), {
      municipalityId,
      municipalRole,
    });
    if (!updatedUser) {
      return sendError(res, `User with ID ${id} not found.`, 404);
    }

    // Record audit log
    await municipalityModel.recordAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'USER_ROLE_UPDATED',
      resourceType: 'USER',
      resourceId: id,
      details: { targetEmail: updatedUser.email, newRole: role, municipalityId, municipalRole },
      ipAddress: req.ip,
    });

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
    const { category, status, search, municipalityId } = req.query;
    const issues = await issueModel.getAllIssues({ category, status, search, municipalityId });
    return sendSuccess(res, { issues }, 'Admin issue registry retrieved.');
  } catch (error) {
    next(error);
  }
};

export const getUserProfileAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return sendError(res, `User with ID ${id} not found.`, 404);
    }

    // Retrieve all issues submitted by this user (including canonical and merged)
    const issues = await issueModel.getAllIssues({
      reporterId: id,
      canonicalOnly: false,
    });

    const statusCounts = {
      reported: 0,
      under_review: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      citizen_verified: 0,
      reopened: 0,
    };
    issues.forEach((i) => {
      if (statusCounts[i.status] !== undefined) {
        statusCounts[i.status]++;
      }
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          badge: user.badge,
          avatar: user.avatar,
          department: user.department,
          municipalityId: user.municipality_id,
          municipalRole: user.municipal_role,
          createdAt: user.created_at,
        },
        issues,
        reports: issues,
        stats: {
          total: issues.length,
          byStatus: statusCounts,
        },
      },
      'User administrative profile retrieved.'
    );
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { resourceType, limit } = req.query;
    const logs = await municipalityModel.getAuditLogs({
      resourceType,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return sendSuccess(res, { logs }, 'Platform audit logs retrieved.');
  } catch (error) {
    next(error);
  }
};
