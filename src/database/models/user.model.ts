import { JWT_EXPIRES, JWT_SECRET } from './../../config/config';
import { Document, model, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

interface IUser {
    username: string;
    email: string;
    image: string;
    hash: string;
    salt: string;
}

interface IUserToAuthJSON {
    username: string;
    email: string;
    image: string;
    hash: string;
    salt: string;
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
        image: String,
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
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            image: this.image,
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
        image: this.image,
        token: this.generateJWT(),
    };
};

export const User = model<IUserInterface>('User', UserSchema);
