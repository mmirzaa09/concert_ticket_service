import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import dbConnect from './config/db.config.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 8000;

async function connectToDatabase() {
  try {
    await dbConnect.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

connectToDatabase();

// support parsing of application/json type post data
app.use(bodyParser.json());

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});