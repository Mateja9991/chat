const { Group } = require('../../db/models');

async function groupMemberAuth(req, res, next) {
	try {
		const {
			body: { groupId: bodyGroupId },
			params: { groupId: paramsGroupId },
		} = req;
		const groupId = bodyGroupId ? bodyGroupId : paramsGroupId;
		const group = await Group.findById(groupId);
		if (!group) {
			res.status(404);
			throw new Error('group not found.');
		}
		const isMember = req.user.groups.includes(groupId);
		if (!req.admin && !isMember) {
			res.status(403);
			throw new Error(
				'Not authorized.  To access this document you need to be group member.'
			);
		}
		req.group = group;
		next();
	} catch (e) {
		next(e);
	}
}

async function groupAdminAuth(req, res, next) {
	try {
		const {
			body: { groupId: bodyGroupId },
			params: { groupId: paramsGroupId },
		} = req;
		const groupId = bodyGroupId ? bodyGroupId : paramsGroupId;
		let group = await Group.findById(groupId);
		if (!group) {
			res.status(404);
			throw new Error('group not found.');
		}
		if (!req.admin && !group.adminIds.includes(req.user._id)) {
			res.status(403);
			throw new Error(
				'Not authorized.  To access this document you need to be group leader.'
			);
		}
		req.group = group;
		next();
	} catch (e) {
		next(e);
	}
}

module.exports = {
	groupAdminAuth,
	groupMemberAuth,
};
