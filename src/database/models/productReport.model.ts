import { Document, model, Schema } from 'mongoose';

const reportSchema = new Schema(
    {
        store: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
        },
        product: {
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

export interface IProductReport extends Document {
    store: string;
    product: string;
    title: string;
    description: string;
    imagePath: string;
    author: string;
}

export default model<IProductReport>('productReport', reportSchema);
