import express, { type Express} from 'express';
import { connectDb } from './config/db.ts';
import cors from 'cors';
import drinkRoutes from './routes/drinkRoutes.ts';
import reservationRoutes from './routes/reservationRoutes.ts';

const app: Express = express();
app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(express.json());
app.use('/api/drinks', drinkRoutes);
app.use('/api/reservations', reservationRoutes);
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