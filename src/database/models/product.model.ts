import { Schema, model, Document } from 'mongoose';
import mongoose_unique_validator from 'mongoose-unique-validator';

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        categories: [
            {
                type: String,
                default: [],
            },
        ],
        sizes: [
            {
                type: String,
                default: [],
            },
        ],
        stock: {
            type: Number,
            required: true,
        },
        solds: {
            type: Number,
            default: 0,
        },
        imagePath: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    purchasePrice: number;
    categories: string[];
    sizes: string[];
    stock: number;
    solds: number;
    imagePath: string;
    author: string;
}

productSchema.plugin(mongoose_unique_validator, {
    message: 'is already taken',
});

export default model<IProduct>('Product', productSchema);
