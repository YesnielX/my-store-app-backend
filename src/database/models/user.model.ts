/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import crypto from 'crypto';

import jwt from 'jsonwebtoken';
import { Document, model, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { JWT_EXPIRES, JWT_SECRET } from '../../config/config';
import { IRole } from './role.model';
export interface IUser {
    username: string;
    email: string;
    roles: IRole[];
    image: string;
    isPrincipalAdmin: boolean;
    isAdmin: boolean;
    hash: string;
    salt: string;
}

export interface IUserToAuthJSON {
    username: string;
    email: string;
    roles: string[];
    image: string;
    isPrincipalAdmin: boolean;
    isAdmin: boolean;
    token: string;
}

interface IUserInterface extends Document, IUser {
    setPassword(password: string): void;
    validatePassword(password: string): boolean;
    toAuthJSON(): IUserToAuthJSON;
    generateJWT(): string;
}

const UserSchema = new Schema<IUserInterface>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
        image: String,
        isPrincipalAdmin: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        hash: {
            type: String,
            private: true,
        },
        salt: {
            type: String,
            private: true,
        },
    },
    { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
};

UserSchema.methods.validatePassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            roles: this.roles,
            image: this.image,
            isPrincipalAdmin: this.isPrincipalAdmin,
            isAdmin: this.isAdmin,
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES,
        }
    );
};

UserSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        username: this.username,
        email: this.email,
        roles: this.roles,
        image: this.image,
        isPrincipalAdmin: this.isPrincipalAdmin,
        isAdmin: this.isAdmin,
        token: this.generateJWT(),
    };
};

export default model<IUserInterface>('User', UserSchema);
