import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';

import dbConnect from './config/db.config.js';
import userRoutes from './routes/userRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import concertRoutes from './routes/concertRoutes.js';
import orderRoutes from './routes/orderRoute.js';
import paymentMethodRoutes from './routes/paymentMethodRoute.js';
import transactionRoutes from './routes/transactionRoutes.js';

import uploadRoutes from './routes/UploadImageRoute.js';
import {handleUploadError} from './controllers/uploadImageController.js';

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.LOCAL_HOST || 'localhost';

async function connectToDatabase() {
  try {
    await dbConnect.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

connectToDatabase();

app.use(cors());
app.use(morgan('combined'));

// support parsing of application/json type post data
app.use(bodyParser.json());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploadImage'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/concert', concertRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment-method', paymentMethodRoutes);
app.use('/api/transaction', transactionRoutes);

// Error handling middleware for multer errors
app.use(handleUploadError);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});