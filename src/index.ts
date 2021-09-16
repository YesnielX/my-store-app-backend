import express, { json } from 'express';
import helmet from 'helmet';
import router from './routes';
import morgan from 'morgan';

const app = express();
app.use(json());
app.use(helmet());
require('dotenv').config();
app.use(morgan('dev'));
app.use("/api", router);


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});