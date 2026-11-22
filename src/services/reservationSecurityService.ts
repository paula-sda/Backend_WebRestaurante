
import { randomBytes, createHash } from 'node:crypto';

// codigo de reserva único para cada reserva
export function generateReservationCode(): string {
    return `RDM-${randomBytes(3).toString('hex').toUpperCase()}`;
}

// Token seguro para confirmar la reserva, se envía al correo del cliente
export function generateConfirmationToken(): string {
    return randomBytes(32).toString('hex');
}

//hasea el token de confirmación para guardarlo en la base de datos
export function hashConfirmationToken(token: string): string {
    return createHash('sha256')
        .update(token)
        .digest('hex');
}
