
import mongoose from 'mongoose';

export async function connectDb() {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error('No se ha encontrado MONGO_URI');
        }

        await mongoose.connect(uri);

        console.log('MongoDB conectado');

    } catch (error) {
        console.error('Error al conectar con MongoDB:', error);
        throw error;
    }
}
