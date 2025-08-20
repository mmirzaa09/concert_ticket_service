import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import dbConnect from './config/db.config.js';
import userRoutes from './routes/userRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import concertRoutes from './routes/concertRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.LOCAL_PORT;
// const HOST = 'localhost';

async function connectToDatabase() {
  try {
    await dbConnect.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

connectToDatabase();

app.use(morgan('combined'));

// support parsing of application/json type post data
app.use(bodyParser.json());

// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/concert', concertRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});