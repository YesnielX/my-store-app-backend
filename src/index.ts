import cors from 'cors';
import express, { json } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { PORT } from './config/config';
import database from './database/database';
import router from './routes';

const app = express();

app.use(json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
database();
app.use('/api', router);

app.listen(PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});
