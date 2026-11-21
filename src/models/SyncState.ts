
import mongoose, { Schema } from 'mongoose';

const syncStateSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    lastCheckedAt: {
        type: Date,
        default: null
    }
});

export const SyncState = mongoose.model('SyncState', syncStateSchema);
