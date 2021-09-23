// Role Model with mongoose

import { Document, model, Schema } from 'mongoose';

const roleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        permissions: {
            maxStores: {
                type: Number,
                default: 0,
            },
            maxProducts: {
                type: Number,
                default: 0,
            },
            maxManagers: {
                type: Number,
                default: 0,
            },
            maxEmployees: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// interface
export interface IRole extends Document {
    name: string;
    description: string;
    permissions: {
        maxStores: number;
        maxProducts: number;
        maxManagers: number;
        maxEmployees: number;
    };
}

// model
export default model<IRole>('Role', roleSchema);
