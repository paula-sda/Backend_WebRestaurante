
import emailjs from '@emailjs/nodejs';

interface ReservationEmail {
    email: string;
    nombre: string;
    fecha: string;
    hora: string;
    personas: number;
    telefono: string;
}

//primer email con la solicitud de reserva
export async function sendReservationRequest(
    reservation: ReservationEmail,
    confirmationUrl: string
): Promise<void> {

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
        throw new Error('EmailJS configuration is incomplete');
    }

    await emailjs.send(
        serviceId,
        templateId,
        {
            to_email: reservation.email,
            customer_name: reservation.nombre,
            reservation_date: reservation.fecha,
            reservation_time: reservation.hora,
            guests: reservation.personas,
            confirmation_url: confirmationUrl,
            restaurant_name: 'Rouge de Minuit'
        },
        {
            publicKey,
            privateKey
        }
    );
}

// segundo email despues de confirmar la reserva
export async function sendReservationConfirmed(
    reservation: ReservationEmail,
    reservationCode: string
): Promise<void> {

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_CONFIRMATION_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
        throw new Error('EmailJS configuration is incomplete');
    }

    await emailjs.send(
        serviceId,
        templateId,
        {
            to_email: reservation.email,
            customer_name: reservation.nombre,
            reservation_date: reservation.fecha,
            reservation_time: reservation.hora,
            guests: reservation.personas,
            reservation_code: reservationCode,
            restaurant_name: 'Rouge de Minuit'
        },
        {
            publicKey,
            privateKey
        }
    );
}