const profileModel = require('../models/profileModel');
const mongoose = require('mongoose');
const profileController = {
    index: async (req, res) => {
        try {
            const profiles = await profileModel.find({});
            return res.status(200).json({
                status: 'success',
                message: 'get all profile successfully',
                profiles,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    me: async (req, res) => {
        try {
            const myProfile = await profileModel.findOne({
                userid: req.userid,
            });
            return res.status(200).json({
                status: 'success',
                message: 'get profile successfully',
                myProfile,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    show: async (req, res) => {
        try {
            const otherProfile = await profileModel.findOne({
                _id: req.params.profileid,
            });
            if (!otherProfile)
                return res.status(404).json({
                    status: 'failed',
                    message: 'Profile not found',
                    messagevn: 'Không tìm thấy hồ sơ',
                });
            return res.status(200).json({
                status: 'success',
                message: 'get profile successfully',
                messagevn: 'lấy hồ sơ thành công',
                otherProfile,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    // show: async (req, res) => {},
    update: async (req, res) => {
        const data = req.body;
        try {
            const myProfile = await profileModel.findOne({
                userid: req.userid,
            });
            if (!myProfile) {
                return res
                    .status(404)
                    .json({ status: 'failed', message: 'Profile not found' });
            }
            const updatedProfile = await profileModel.findOneAndUpdate(
                { _id: myProfile._id },
                data,
                { new: true }
            );
            return res.status(200).json({
                status: 'success',
                message: 'Updated profile',
                messagevn: 'Cập nhật Hồ Sơ thành công',
                updatedProfile,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    search: async (req, res) => {
        const string = req.query.string;
        let profiles = [];
        try {
            if (!string)
                return res.status(200).json({
                    status: 'success',
                    message: 'No string',
                    profiles: [],
                });
            if (string.startsWith('@')) {
                const id = mongoose.Types.ObjectId(string.split('@')[1]);
                profiles = await profileModel
                    .find({
                        _id: id,
                    })
                    .limit(20);
            } else {
                profiles = await profileModel
                    .find({
                        name: new RegExp(string, 'i'),
                    })
                    .limit(20);
            }
            return res.status(200).json({
                status: 'success',
                message: 'get profiles successfully',
                profiles,
            });
        } catch (error) {}
    },
    patch: async (req, res) => {
        const patch = req.body;
        try {
            const updatedProfile = await profileModel.findOneAndUpdate(
                { userid: req.userid },
                patch,
                { new: true }
            );
            if (!updatedProfile) {
                return res
                    .status(404)
                    .json({ status: 'failed', message: 'Profile not found' });
            }
            return res.status(200).json({
                status: 'success',
                message: 'Updated a part of profile',
                profile: updatedProfile,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    delete: async (req, res) => {
        try {
            const updatedProfile = await profileModel.findOneAndUpdate(
                { userid: req.userid },
                {
                    name: '',
                    bio: '',
                    adress: '',
                    phone: '',
                    avatarlink:
                        'https://res.cloudinary.com/dnzphkxi4/image/upload/v1657259293/default_avatar/male_avatar_t0yrqe.png',
                }
            );
            if (!updatedProfile) {
                return res
                    .status(404)
                    .json({ status: 'failed', message: 'Profile not found' });
            }
            return res.status(200).json({
                status: 'success',
                message: 'reseted profile',
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
};
module.exports = profileController;
