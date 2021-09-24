/* eslint-disable no-console */

import nodemailer from 'nodemailer';

import {
    NODEMAILER_HOST,
    NODEMAILER_PORT,
    NODEMAILER_USER,
    NODEMAILER_PASS,
} from '../config/config';

// eslint-disable-next-line consistent-return
export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        console.log(NODEMAILER_USER, NODEMAILER_PASS);
        const transporter = nodemailer.createTransport({
            host: NODEMAILER_HOST,
            port: Number(NODEMAILER_PORT),
            secure: true,
            auth: {
                user: NODEMAILER_USER,
                pass: NODEMAILER_PASS,
            },
        });
        const info = await transporter.sendMail({
            from: NODEMAILER_USER,
            to,
            subject,
            html,
        });
        return info;
    } catch (error) {
        console.log(error);
        return 'error send email';
    }
};
