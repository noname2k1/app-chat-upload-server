const accountModel = require('../models/accountModel');
const profileModel = require('../models/profileModel');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { generatorToken } = require('..//tools//authMethods');
const { requestKey } = require('../tools/generate');
const authController = {
    index: async (req, res) => {
        try {
            //load data from token
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return req.status(401).json({
                    status: 'failed',
                    message: 'You not authenticated',
                    messagevn: 'Yêu cầu đăng nhập',
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

            if (!decoded) {
                return req.status(400).json({
                    status: 'failed',
                    message: 'Invalid token',
                    messagevn: 'token không hợp lệ',
                });
            }

            const account = await accountModel.findOne({
                username: decoded.username,
                role: decoded.role,
                requestKey: decoded.requestKey,
            });
            if (!account) {
                return res.status(403).json({
                    status: 'failed',
                    message: 'Account not found',
                    messagevn: 'Tài khoản không tồn tại',
                });
            }
            const profile = await profileModel.findOne({ userid: account.id });
            return res.status(200).json({
                status: 'success',
                message: 'load user profile successfully',
                messagevn: 'lấy hồ sơ người dùng thành công',
                profile,
                role: account.role,
                token,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal error occurred' });
        }
    },
    // [GET] '/api/auth/me'
    me: async (req, res) => {
        try {
            const myAccount = await accountModel.findById(req.userid);
            if (!myAccount) {
                return res.status(404).json({
                    status: 'failed',
                    message: 'Account not found',
                    messagevn: 'Tài khoản không tồn tại',
                });
            }
            const { username, role, email, status, createdAt } = myAccount._doc;
            const infoAccount = {
                username,
                role,
                email,
                status,
                createdAt,
            };
            return res.status(200).json({
                status: 'success',
                message: 'get account details successfully',
                messagevn: 'lấy thông tin tài khoản thành công',
                infoAccount,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal error occurred' });
        }
    },
    update: async (req, res) => {},
    delete: async (req, res) => {},
    // [POST] '/api/auth/login'
    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            if (!username || !password)
                return res.status(403).json({
                    status: 'failed',
                    message: `Account's details are missing`,
                    messagevn: 'Thông tin tài khoản không đầy đủ',
                });
            const existAccount = await accountModel.findOne({ username });
            if (!existAccount)
                return res.status(403).json({
                    status: 'failed',
                    message: `Account's details are incorrect`,
                    messagevn: 'Thông tin tài khoản không chính xác',
                });
            const existsProfile = await profileModel.findOne({
                userid: existAccount.id,
            });
            if (await argon2.verify(existAccount.password, password)) {
                // password match
                const newRequestKey = requestKey();
                const updateRequestKey = await accountModel.findOneAndUpdate(
                    {
                        _id: existAccount.id,
                    },
                    {
                        requestKey: newRequestKey,
                    },
                    { new: true }
                );
                if (!updateRequestKey) {
                    return res.status(500).json({
                        status: 'failed',
                        message: 'Internal error occurred',
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    message: 'login successfully',
                    messagevn: 'đăng nhập thành công',
                    token: generatorToken({
                        id: existAccount.id,
                        username,
                        role: existAccount.role,
                        requestKey: newRequestKey,
                    }),
                    profile: existsProfile,
                    role: existAccount.role,
                });
            } else {
                // password did not match
                return res.status(403).json({
                    status: 'failed',
                    message: `Account's details are incorrect`,
                    messagevn: 'Thông tin tài khoản không chính xác',
                });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal error occurred' });
        }
    },
    register: async (req, res) => {
        const { username, password, email } = req.body;
        try {
            if (username && password && email) {
                const existUsername = await accountModel.findOne({
                    username,
                });
                if (existUsername)
                    return res.status(403).json({
                        status: 'failed',
                        message: `Username ${username} already registered`,
                        messagevn: `Tài khoản ${username} đã được đăng ký`,
                    });
                const existedEmail = await accountModel.findOne({
                    email,
                });
                if (existedEmail)
                    return res.status(403).json({
                        status: 'failed',
                        message: `Email ${email} already registered`,
                        messagevn: `Email ${email} đã được đăng ký`,
                    });
                const hash = await argon2.hash(password, {
                    type: argon2.argon2d,
                    memoryCost: 2 ** 16,
                    hashLength: 50,
                });
                const newAccount = await accountModel.create({
                    username,
                    password: hash,
                    email,
                });
                const newProfile = await profileModel.create({
                    userid: newAccount.id,
                });
                if (!newAccount || !newProfile) {
                    return res.status(500).json({
                        status: 'failed',
                        message: 'Internal error occurred',
                    });
                }
                const newRequestKey = requestKey();
                const updateRequestKey = await accountModel.findOneAndUpdate(
                    {
                        _id: newAccount.id,
                    },
                    {
                        requestKey: newRequestKey,
                    },
                    { new: true }
                );
                if (!updateRequestKey) {
                    return res.status(500).json({
                        status: 'failed',
                        message: 'Internal error occurred',
                    });
                }
                const token = generatorToken({
                    id: newAccount.id,
                    username: newAccount.username,
                    role: newAccount.role,
                    requestKey: newRequestKey,
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'Register successfully',
                    messagevn: 'Đăng ký thành công',
                    token,
                    profile: newProfile,
                    role: newAccount.role,
                });
            } else {
                return res.status(403).json({
                    status: 'failed',
                    message: `Account's details required`,
                    messagevn: 'Thông tin tài khoản không được để trống',
                });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal error occurred' });
        }
    },
    logout: async (req, res) => {
        const newRequestKey = requestKey();
        const updateRequestKey = await accountModel.findOneAndUpdate(
            {
                _id: req.userid,
            },
            {
                requestKey: newRequestKey,
            },
            { new: true }
        );
        if (!updateRequestKey) {
            return res.status(500).json({
                status: 'failed',
                message: 'Internal error occurred',
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'logout successfully',
            messagevn: 'đăng xuất thành công',
        });
    },
};
module.exports = authController;
