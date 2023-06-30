const jwt = require('jsonwebtoken');
const accountModel = require('../models/accountModel');
const argon2 = require('argon2');
const { generatorToken } = require('../tools/authMethods');
const { requestKey } = require('../tools/generate');
const authMiddleWares = {
    isAuthenticated: async function (req, res, next) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: 'failed',
                message: 'You not authenticated',
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        if (!decoded) {
            return res.status(400).json({
                status: 'failed',
                message: 'Invalid token',
            });
        }
        const requestKey = decoded.requestKey;
        const account = await accountModel.findById(decoded.id);
        if (
            !account &&
            (!account?.requestKey || account?.requestKey !== requestKey)
        ) {
            return res.status(400).json({
                status: 'failed',
                message: 'Invalid token',
            });
        }
        req.userid = decoded.id;
        req.role = decoded.role;
        next();
    },
    changePassword: async function (req, res) {
        const { currentPassword, newPassword } = req.body;
        console.log(
            'current password:' +
                currentPassword +
                ' new password:' +
                newPassword
        );
        try {
            const myAccount = await accountModel.findOne({ _id: req.userid });
            if (!myAccount) {
                return res
                    .status(403)
                    .json({ status: 'failed', message: 'account not found' });
            }
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'current password/new password is required',
                    messagevn: 'thông tin không đầy đủ',
                });
            }
            if (newPassword === currentPassword) {
                return res.status(400).json({
                    status: 'failed',
                    message:
                        'new password must different from current password',
                    messagevn:
                        'Mật khẩu mới không được trùng với mật khẩu hiện tại',
                });
            }
            const passwordIsMatch = await argon2.verify(
                myAccount.password,
                currentPassword
            );
            if (!passwordIsMatch) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'password is incorrect',
                    messagevn: 'thông tin không chính xác',
                });
            } else {
                const hashPassword = await argon2.hash(newPassword);
                const updatedAccount = await accountModel.findOneAndUpdate(
                    { _id: req.userid },
                    {
                        password: hashPassword,
                        requestKey: requestKey(),
                    },
                    { new: true }
                );
                return res.status(200).json({
                    status: 'success',
                    message: 'Change password successfully',
                    messagevn: 'Đổi mật khẩu thành công',
                    token: generatorToken({
                        id: updatedAccount._id,
                        username: updatedAccount.username,
                        role: updatedAccount.role,
                        requestKey: updatedAccount.requestKey,
                    }),
                });
            }
        } catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'internal server error' });
        }
    },
};
module.exports = authMiddleWares;
