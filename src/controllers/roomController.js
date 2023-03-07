const roomModel = require('../models/roomModel');
const profileModel = require('../models/profileModel');
const roomController = {
    index: async (req, res) => {
        try {
            const rooms = await roomModel.find({});
            return res.status(200).json({
                status: 'success',
                message: 'get rooms successfully',
                rooms,
            });
        } catch (error) {
            console.log(error.message);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    //[GET] '/api/chat/room'
    me: async (req, res) => {
        try {
            const myProfile = await profileModel.findOne({
                userid: req.userid,
            });

            if (!myProfile) {
                return res.status(404).json({
                    status: 'failed',
                    message: 'Profile not found',
                });
            }
            const rooms = await roomModel
                .find({ member: myProfile._id })
                .populate('member')
                .sort({ updatedAt: -1 });
            if (rooms) {
                return res.status(200).json({
                    status: 'success',
                    message: 'get my rooms successfully',
                    rooms,
                });
            }
        } catch (error) {
            console.log(error.message);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    // [GET] '/api/chat/room/:id'
    show: async (req, res) => {
        const roomid = req.params.id;
        try {
            const room = await roomModel
                .findById(roomid)
                .populate('member')
                .populate('request')
                .populate({
                    path: 'blocked',
                    match: { _id: { $exists: true } },
                });
            if (!room) {
                return res
                    .status(404)
                    .json({ status: 'failed', message: 'Room not found' });
            }
            return res.status(200).json({
                status: 'success',
                messages: 'Get room successfully',
                room,
            });
        } catch (error) {
            console.log(error.message);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    // [POST] 'api/chat/room'
    new: async (req, res) => {
        const { name, otherprofileid } = req.body;
        const mode = req.query.mode;
        try {
            if (!mode)
                return res
                    .status(400)
                    .json({ status: 'failed', message: 'mode is required' });

            const myProfile = await profileModel.findOne({
                userid: req.userid,
            });
            if (mode === 'room') {
                if (!name) {
                    return res.status(400).json({
                        status: 'failed',
                        message: "Room's name is required",
                        messagevn: 'Tên phòng không được để trống',
                    });
                }
                const newRoom = await roomModel.create({
                    name,
                    host: myProfile._id,
                    member: [myProfile._id],
                    mode: 'room',
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'Your room room created successfully',
                    room: newRoom,
                });
            }
            if (mode === 'private') {
                if (!otherprofileid)
                    return res.status(400).json({
                        status: 'failed',
                        message: 'Other profile id is required',
                    });
                const otherprofile = await profileModel.findOne({
                    _id: otherprofileid,
                });
                if (!otherprofile) {
                    return res.status(400).json({
                        status: 'failed',
                        message: 'Other profile not found',
                    });
                }
                if (myProfile._id.toString() === otherprofile._id.toString())
                    return res.status(400).json({
                        status: 'failed',
                        message: 'You can not create room with yourself',
                    });
                const existRoom = await roomModel.findOne({
                    member: {
                        $all: [myProfile._id, otherprofile._id],
                    },
                    mode: 'private',
                });
                if (existRoom && otherprofile) {
                    return res.status(200).json({
                        status: 'success',
                        message: 'Room already exists',
                        room: {
                            ...existRoom._doc,
                            roomavatar: otherprofile.avatarlink,
                            roomname: otherprofile.name,
                            profileid: otherprofile._id,
                        },
                    });
                }
                const newRoom = await roomModel.create({
                    member: [myProfile._id, otherprofileid],
                    mode: 'private',
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'Your private room created successfully',
                    room: {
                        ...newRoom._doc,
                        roomavatar: otherprofile.avartarlink,
                        roomname: otherprofile.name,
                        profileid: otherprofile._id,
                    },
                });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    search: async (req, res) => {
        const string = req.query.string;
        let rooms = [];
        try {
            if (!string)
                return res.status(200).json({
                    status: 'success',
                    message: 'No string',
                    rooms: [],
                });
            if (string.startsWith('@')) {
                const id = mongoose.Types.ObjectId(string.split('@')[1]);
                rooms = await roomModel
                    .find({
                        _id: id,
                    })
                    .limit(20);
            } else {
                rooms = await roomModel
                    .find({
                        name: new RegExp(string, 'i'),
                    })
                    .limit(20);
            }
            return res.status(200).json({
                status: 'success',
                message: 'get rooms successfully',
                rooms,
            });
        } catch (error) {}
    },
    // [PUT]/[PATCH] '/api/chat/room'
    update: async (req, res) => {
        const { id, roomid, action, field } = req.body.patch;
        try {
            //Push request
            if (!roomid) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'roomid is required',
                });
            }
            const handleRequest = await roomModel
                .findOneAndUpdate(
                    { _id: roomid },
                    {
                        [action]: { [field]: id },
                    },
                    { new: true }
                )
                .populate('member');
            if (!handleRequest) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Room not found',
                });
            }
            return res.status(200).json({
                status: 'success',
                message: 'handle request successfully',
                room: handleRequest,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    // [PATCH] '/api/chat/room/change-background'
    changeBackground: async (req, res) => {
        const { roomid, backgroundColor } = req.body;
        try {
            if (!roomid) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'roomid is required',
                });
            }
            const handleRequest = await roomModel.findOneAndUpdate(
                { _id: roomid },
                {
                    backgroundColor,
                },
                { new: true }
            );
            if (!handleRequest) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Room not found',
                });
            }
            return res.status(200).json({
                status: 'success',
                message: 'Change BG successfully',
                room: handleRequest,
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
        } catch (error) {
            console.log(error.message);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
};
module.exports = roomController;
