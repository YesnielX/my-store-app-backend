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
    createdAt: Date;
    updatedAt: Date;
}

storeSchema.plugin(mongoose_unique_validator, {
    message: 'is already taken',
});

export default model<IStore>('Store', storeSchema);
