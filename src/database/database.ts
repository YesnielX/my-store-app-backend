import mongoose from 'mongoose';

import { MONGODB_URI } from '../config/config';

export default async () => {
    try {
        mongoose.connect(MONGODB_URI);
        mongoose.Promise = global.Promise;
        mongoose.connection.on('error', (err) => {
            console.error(err);
            process.exit(1);
        });
        mongoose.connection.once('open', () => {
            console.log('MongoDB connection established successfully');
        });
    } catch (error) {
        console.log(error);
    }
};
