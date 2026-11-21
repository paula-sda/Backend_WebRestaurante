
import mongoose, { Schema } from 'mongoose';

const drinkIngredientSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

const drinkSchema = new Schema(
    {
        idDrink: {
            type: String,
            required: true,
            unique: true
        },
        strDrink: {
            type: String,
            required: true
        },
        strAlcoholic: {
            type: String,
            required: true
        },
        strDrinkThumb: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        ingredients: {
            type: [drinkIngredientSchema],
            default: []
        },
        local: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Drink = mongoose.model('Drink', drinkSchema);
