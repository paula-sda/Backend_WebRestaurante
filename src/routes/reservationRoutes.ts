
import { Router, type Request, type Response } from 'express';
import { readFile } from 'node:fs/promises';

import { ReservationModel } from '../models/Reservation.ts';

import {generateReservationCode, generateConfirmationToken, hashConfirmationToken} from '../services/reservationSecurityService.ts';

import { sendReservationRequest, sendReservationConfirmed} from '../services/emailService.ts';

const router = Router();

// Crear una nueva reserva
router.post('/', async (req: Request, res: Response) => {
    try {
        const { date, hour, persons, name, email, phone } = req.body;

        // Validar los campos de la reserva
        if (!date || !hour || !persons || !name || !email || !phone) {
            return res.status(400).json({
                message: 'All reservation fields are required'
            });
        }

        const numberOfPersons = Number(persons);
        const normalizedEmail = String(email).trim().toLowerCase();

        if (
            !Number.isInteger(numberOfPersons) ||
            numberOfPersons < 1 ||
            numberOfPersons > 6 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            return res.status(400).json({
                message: 'Invalid reservation data'
            });
        }

        // generar un código de reserva único
        let reservationCode = '';

        do {
            reservationCode = generateReservationCode();
        } while (await ReservationModel.exists({ reservationCode }));

        // Generate the confirmation token.
        const confirmationToken = generateConfirmationToken();
        const confirmationTokenHash = hashConfirmationToken(confirmationToken);

        // guardar la reserva en la base de datos con estado "pendiente"
        const reservation = await ReservationModel.create({
            date,
            hour,
            persons: numberOfPersons,
            name: String(name).trim(),
            email: normalizedEmail,
            phone: String(phone).trim(),
            reservationCode,
            confirmationTokenHash,
            status: 'pending',
            confirmedAt: null
        });

        const backendUrl = process.env.BACKEND_URL;

        if (!backendUrl) {
            await reservation.deleteOne();
            throw new Error('BACKEND_URL is not configured');
        }

        // construir el enlace de confirmación con el token
        const confirmationUrl = new URL(
            '/api/reservations/confirm',
            backendUrl
        );

        confirmationUrl.searchParams.set('token', confirmationToken);

        // Enviar primer email con el enlace de confirmación
        try {
            await sendReservationRequest(
                {
                    email: normalizedEmail,
                    nombre: String(name).trim(),
                    fecha: date,
                    hora: hour,
                    personas: numberOfPersons,
                    telefono: String(phone).trim()
                },
                confirmationUrl.toString()
            );
        } catch (error) {
            await reservation.deleteOne();
            throw error;
        }

        return res.status(201).json({
            message: 'Reservation request received. Check your email to confirm it.'
        });

    } catch (error) {
        console.error('Error creating reservation:', error);

        return res.status(500).json({
            message: 'Could not create the reservation'
        });
    }
});


// confirmar la reserva mediante el enlace de confirmación
router.get('/confirm', async (req: Request, res: Response) => {
    try {
        const token = req.query.token;

        if (typeof token !== 'string' || !token) {
            return res.status(400).send(
                'Invalid confirmation link.'
            );
        }

        // encontrar el token de confirmación en la base de datos
        const tokenHash = hashConfirmationToken(token);

        const reservation = await ReservationModel.findOne({
            confirmationTokenHash: tokenHash,
            status: 'pending'
        });

        if (!reservation) {
            return res.status(400).send(
                'This link is invalid or the reservation has already been confirmed.'
            );
        }

        // confirmar la reserva y actualizar el estado
        reservation.status = 'confirmed';
        reservation.confirmedAt = new Date();

        await reservation.save();

        // Send the second email with the reservation code.
        await sendReservationConfirmed(
            {
                email: reservation.email,
                nombre: reservation.name,
                fecha: reservation.date,
                hora: reservation.hour,
                personas: reservation.persons,
                telefono: reservation.phone
            },
            reservation.reservationCode
        );

        // ir a la página reserva confirmada
        const html = await readFile(
            new URL('../views/reservationConfirmed.html', import.meta.url),
            'utf8'
        );

        return res.status(200).type('html').send(html);

    } catch (error) {
        console.error('Error confirming reservation:', error);

        return res.status(500).send('An error occurred while confirming the reservation.');
    }
});

export default router;
