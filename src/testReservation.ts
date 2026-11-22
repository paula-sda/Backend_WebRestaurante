
const API_URL = 'http://localhost:3000/api/reservations';

// Replace this with an email address you can access.
const testReservation = {
    date: '2026-12-15',
    hour: '20:00',
    persons: 2,
    name: 'Paula Test',
    email: 'paula.saenzda@gmail.com',
    phone: '600123456'
};

async function testReservationRequest() {
    try {
        console.log('Sending test reservation...');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testReservation)
        });

        const result = await response.json();

        console.log('HTTP status:', response.status);
        console.log('Server response:', result);

        if (!response.ok) {
            console.error('The reservation request failed.');
            return;
        }

        console.log('Reservation request sent successfully!');
        console.log('Check your email to confirm the reservation.');

    } catch (error) {
        console.error('Could not connect to the backend:', error);
    }
}

testReservationRequest();
