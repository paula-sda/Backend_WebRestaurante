import express, { type Express, type Request, type Response } from 'express';
import mongoose from 'mongoose';

const app: Express = express();

const uri = process.env.MONGO_URI
  ?? 'mongodb://localhost:27017/app';

async function connectDb() {
  await mongoose.connect(uri);
  console.log('MongoDB conectado');
}

connectDb();

app.listen(3000);