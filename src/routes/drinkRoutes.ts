
import { Router } from 'express';
import { Drink } from '../models/Drinks.ts';
import { SyncState } from '../models/SyncState.ts';
import { FALLBACK_DRINKS } from '../data/fallbackDrinks.ts';
import { getAllDrinks } from '../services/cocktailApi.ts';

const router = Router();

const SYNC_INTERVAL = 24 * 60 * 60 * 1000;

let isRefreshing = false;

// Initialize MongoDB when it has no drinks
async function initializeDrinks() {
    const count = await Drink.countDocuments();

    if (count > 0) {
        return;
    }

    try {
        // First, try to get drinks from TheCocktailDB
        const externalDrinks = await getAllDrinks();

        if (externalDrinks.length === 0) {
            throw new Error('No drinks received from external API');
        }

        await Drink.insertMany(
            externalDrinks.map((drink) => ({
                ...drink,
                ingredients: [],
                local: false
            }))
        );

        console.log('External drinks saved in MongoDB');

    } catch (error) {
        console.error('External API unavailable:', error);

        // If the API fails, save fallback drinks
        await Drink.insertMany(FALLBACK_DRINKS);

        console.log('Fallback drinks saved in MongoDB');
    }
}

// Check whether synchronization is necessary
async function shouldSync(): Promise<boolean> {
    const syncState = await SyncState.findOne({ name: 'drinks' });

    if (!syncState || !syncState.lastCheckedAt) {
        return true;
    }

    const elapsedTime =
        Date.now() - syncState.lastCheckedAt.getTime();

    return elapsedTime >= SYNC_INTERVAL;
}

// Save the date of the last check
async function saveSyncDate() {
    await SyncState.findOneAndUpdate(
        { name: 'drinks' },
        { $set: { lastCheckedAt: new Date() } },
        { upsert: true, new: true }
    );
}

// Synchronize external drinks with MongoDB
async function refreshDrinks() {
    if (isRefreshing) {
        return;
    }

    isRefreshing = true;

    try {
        console.log('Checking for external updates...');

        const externalDrinks = await getAllDrinks();

        if (externalDrinks.length === 0) {
            throw new Error('No drinks received from external API');
        }

        const savedDrinks = await Drink.find();

        const savedDrinksMap = new Map(
            savedDrinks.map((drink) => [drink.idDrink, drink])
        );

        const operations = [];

        for (const externalDrink of externalDrinks) {
            const savedDrink = savedDrinksMap.get(externalDrink.idDrink);

            if (!savedDrink) {
                operations.push({
                    insertOne: {
                        document: {
                            ...externalDrink,
                            ingredients: [],
                            local: false
                        }
                    }
                });

                continue;
            }

            const hasChanged =
                savedDrink.strDrink !== externalDrink.strDrink ||
                savedDrink.strAlcoholic !== externalDrink.strAlcoholic ||
                savedDrink.strDrinkThumb !== externalDrink.strDrinkThumb;

            if (hasChanged) {
                operations.push({
                    updateOne: {
                        filter: { idDrink: externalDrink.idDrink },
                        update: {
                            $set: {
                                strDrink: externalDrink.strDrink,
                                strAlcoholic: externalDrink.strAlcoholic,
                                strDrinkThumb: externalDrink.strDrinkThumb
                            }
                        }
                    }
                });
            }
        }

        if (operations.length > 0) {
            await Drink.bulkWrite(operations);
            console.log('External drinks updated:', operations.length);
        } else {
            console.log('No changes detected');
        }

        await saveSyncDate();

    } catch (error) {
        console.error('External synchronization failed:', error);

        // Existing MongoDB drinks remain untouched

        try {
            await saveSyncDate();
        } catch (syncError) {
            console.error('Could not save synchronization date:', syncError);
        }

    } finally {
        isRefreshing = false;
    }
}

// Get all drinks
router.get('/', async (_req, res) => {
    try {
        await initializeDrinks();

        const drinks = await Drink.find();

        const syncIsNeeded = await shouldSync();

        res.json(drinks);

        if (syncIsNeeded) {
            void refreshDrinks();
        }

    } catch (error) {
        console.error('Error getting drinks:', error);

        res.status(500).json({
            message: 'Error getting drinks'
        });
    }
});

//get drinks by id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const drink = await Drink.findOne({ idDrink: id });

        if (!drink) {
            return res.status(404).json({
                message: 'Drink not found'
            });
        }

        return res.status(200).json(drink);

    } catch (error) {
        console.error('Error getting drink:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

export default router;