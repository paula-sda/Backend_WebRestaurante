
import mongoose, { Schema } from 'mongoose';

export interface Reservation {
    date: string;
    hour: string;
    persons: number;
    name: string;
    email: string;
    phone: string;
    reservationCode: string;
    confirmationTokenHash: string;
    status: 'pending' | 'confirmed';
    confirmedAt: Date | null;
}

const reservationSchema = new Schema<Reservation>({
    date: {
        type: String,
        required: true
    },
    hour: {
        type: String,
        required: true
    },
    persons: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    reservationCode: {
        type: String,
        required: true,
        unique: true
    },
    confirmationTokenHash: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed'],
        default: 'pending'
    },
    confirmedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

export const ReservationModel = mongoose.model<Reservation>(
    'Reservation',
    reservationSchema
);
