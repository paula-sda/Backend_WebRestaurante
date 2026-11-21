
interface CocktailDbDrink {
    idDrink: string;
    strDrink: string;
    strDrinkThumb: string;
}

interface CocktailDbResponse {
    drinks: CocktailDbDrink[] | null;
}

export interface ExternalDrink {
    idDrink: string;
    strDrink: string;
    strAlcoholic: string;
    strDrinkThumb: string;
    price: number;
}

function getPrice(idDrink: string): number {
    const id = Number(idDrink);
    return 5 + (id % 6) * 0.5;
}

async function getDrinksByType(alcoholic: boolean): Promise<ExternalDrink[]> {
    const type = alcoholic ? 'Alcoholic' : 'Non_Alcoholic';

    const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${type}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Error getting drinks from TheCocktailDB');
    }

    const data = await response.json() as CocktailDbResponse;

    if (!data.drinks) {
        return [];
    }

    return data.drinks.map((drink) => ({
        idDrink: drink.idDrink,
        strDrink: drink.strDrink,
        strAlcoholic: alcoholic ? 'Alcoholic' : 'Non-Alcoholic',
        strDrinkThumb: drink.strDrinkThumb,
        price: getPrice(drink.idDrink)
    }));
}

export async function getAllDrinks(): Promise<ExternalDrink[]> {
    const [alcoholicDrinks, nonAlcoholicDrinks] = await Promise.all([
        getDrinksByType(true),
        getDrinksByType(false)
    ]);

    return [...alcoholicDrinks, ...nonAlcoholicDrinks];
}
