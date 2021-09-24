import { Document, model, Schema } from 'mongoose';

const reportSchema = new Schema(
    {
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
        solved: {
            type: Boolean,
            default: false,
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

export interface IAppReport extends Document {
    title: string;
    description: string;
    imagePath: string;
    solved: boolean;
    author: string;
}

export default model<IAppReport>('appReport', reportSchema);
