import { Document, model, Schema } from 'mongoose';

const reportSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imagePath: {
            type: String,
            default: '',
        },
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

export interface IReport extends Document {
    storeId: string;
    productId: string;
    title: string;
    description: string;
    imagePath: string;
    author: string;
}

export default model<IReport>('productReport', reportSchema);
