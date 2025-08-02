import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import dbConnect from './config/db.config.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.LOCAL_PORT || 'localhost';

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

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api/user', userRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});