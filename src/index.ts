import express, { type Express} from 'express';
import { connectDb } from './config/db.ts';

const app: Express = express();

app.use(express.json());
const PORT = 3000;

async function startServer() {
    try {
        await connectDb();

        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });

    } catch (error) {
        console.error('No se pudo iniciar el servidor');
        process.exit(1);
    }
}
startServer();