import { Schema, model, Document } from 'mongoose';
import mongoose_unique_validator from 'mongoose-unique-validator';

const storeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        imagePath: {
            type: String,
            required: true,
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                default: [],
            },
        ],
        managers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: [],
            },
        ],
        employees: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: [],
            },
        ],
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export interface IStore extends Document {
    name: string;
    imagePath: string;
    products: string[];
    managers: string[];
    employees: string[];
    author: string;
}

storeSchema.plugin(mongoose_unique_validator, {
    message: 'is already taken',
});

export default model<IStore>('Store', storeSchema);
