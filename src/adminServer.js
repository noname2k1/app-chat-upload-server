const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const AdminJSMongoose = require('@adminjs/mongoose');
const accountModel = require('.//models//accountModel');
const messageModel = require('.//models//messageModel');
const profileModel = require('.//models//profileModel');
const roomModel = require('.//models//roomModel');
const contributeModel = require('./models/contributeModel');
const attachmentModel = require('./models/attachmentModel');

const PORT = process.env.ADMIN_PORT || 3000;
const DEFAULT_ADMIN = {
    email: 'admin@example.com',
    password: '123456',
};
AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});

const authenticate = async (email, password) => {
    const admin = await accountModel.findOne({ role: 'admin' });
    if (admin && email === admin.email && password === admin.password) {
        return admin;
    }
    if (
        !admin &&
        email === DEFAULT_ADMIN.email &&
        password === DEFAULT_ADMIN.password
    ) {
        return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
};

(async () => {
    await mongoose.connect('' + process.env.MONGODB_URI + '');

    const app = express();
    const adminJs = new AdminJS({
        resources: [
            accountModel,
            messageModel,
            profileModel,
            roomModel,
            contributeModel,
            attachmentModel,
        ],
    });

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        adminJs,
        {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'sessionsecret',
        },
        null,
        {
            resave: true,
            saveUninitialized: true,
            secret: 'sessionsecret',
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            },
            name: 'adminjs',
        }
    );
    app.use(adminJs.options.rootPath, adminRouter);

    app.listen(PORT, () => {
        console.log(
            `AdminJS started on http://localhost:${PORT}${adminJs.options.rootPath}`
        );
    });
})();
