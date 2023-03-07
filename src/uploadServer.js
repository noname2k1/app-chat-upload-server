require('dotenv').config();
const fs = require('fs-extra');
const express = require('express');
const app = express();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
const mimeTypes = require('mime-types');
const contributeModel = require('./models/contributeModel');
const attachmentModel = require('./models/attachmentModel');
const { isAuthenticated } = require('./middlewares/authMiddleWares');
const connnect = require('./tools/connectToMongo');
const PORT = 9000;
connnect();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        if (mimeTypes.extension(file.mimetype)) {
            cb(
                null,
                `${
                    file.mimetype.split('/')[0]
                }-${Date.now()}.${mimeTypes.extension(file.mimetype)}`
            );
        } else {
            cb(null, false);
        }
    },
});
//limit file size > 5mb
const uploader = multer({ storage, limits: { fileSize: 5000000 } });
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const checkError = (err, req, res, next) => {
    if (err) {
        return res.status(403).json({ status: 'failed', message: err.message });
    }
    next();
};

app.post(
    '/api/contribute',
    isAuthenticated,
    uploader.array('files'),
    checkError,
    async (req, res) => {
        // console.log(req.body);
        const { title, content, profile } = req.body;
        if (!title) {
            return res.status(403).json({
                status: 'failed',
                message: 'Please fill all fields',
                messagevn: 'Vui lòng điền đầy đủ thông tin',
                field: 'title',
            });
        }
        if (!content) {
            return res.status(403).json({
                status: 'failed',
                message: 'Please fill all fields',
                messagevn: 'Vui lòng điền đầy đủ thông tin',
                field: 'content',
            });
        }
        let attachmentsId = [];
        try {
            for (file of req.files) {
                //handle upload media file to cloudinary
                if (
                    file.mimetype.indexOf('image') !== -1 ||
                    file.mimetype.indexOf('video') !== -1
                ) {
                    const upload = await cloudinary.uploader.upload(file.path, {
                        folder: 'contribute',
                    });
                    const newAttachment = await attachmentModel.create({
                        filename: upload.signature,
                        extension: upload.format,
                        content: '',
                        url: upload.secure_url,
                    });

                    attachmentsId.push(newAttachment._id);
                } else {
                    //handle file not image or video
                    try {
                        const data = fs.readFileSync(
                            `${file.destination}/${file.filename}`,
                            'utf-8'
                        );
                        const newAttachment = await attachmentModel.create({
                            filename: file.filename,
                            extension: mimeTypes.extension(file.mimetype),
                            content: data,
                            url: '',
                        });

                        attachmentsId.push(newAttachment._id);
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
            // console.log('out loop');
            const newContribute = await contributeModel.create({
                title,
                content,
                attachments: attachmentsId,
                profile,
            });
            if (!newContribute) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'send contribute failed',
                    messagevn: 'Gửi đóng góp thất bại',
                });
            }
            try {
                await fs.emptyDir('public/uploads');
                // console.log('success!');
            } catch (err) {
                console.error(err);
            }
            return res.json({
                status: 'success',
                message: 'send contribute successfully',
                messagevn: 'Gửi đóng góp thành công',
                contribute: newContribute,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'failed',
                message: 'internal server error',
                messagevn: 'Lỗi máy chủ',
            });
        }
    }
);
app.listen(process.env.UPLOAD_PORT || PORT, () => {
    console.log(`Upload server listening on port ${PORT}`);
});
