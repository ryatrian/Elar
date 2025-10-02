import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getSchedules, deleteSchedule } from './utils/db';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- Background Task Scheduling ---

async function checkSchedules() {
    try {
        const schedules = await getSchedules();
        const now = Date.now();
        const dueSchedules = schedules.filter(s => s.id <= now);

        if (dueSchedules.length > 0 && navigator.serviceWorker.controller) {
            // Request permission
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            if (Notification.permission === 'granted') {
                for (const schedule of dueSchedules) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SHOW_NOTIFICATION',
                        payload: {
                            text: schedule.text,
                            scheduleId: schedule.id,
                        }
                    });
                    // Immediately delete from DB to prevent re-triggering
                    await deleteSchedule(schedule.id); 
                }
            } else {
                console.warn('Notification permission not granted.');
                 // Clean up missed schedules if permission is denied
                for (const schedule of dueSchedules) {
                    await deleteSchedule(schedule.id);
                }
            }
        }
    } catch (error) {
        console.error('Error checking schedules:', error);
    }
}

// Check for schedules every 30 seconds
setInterval(checkSchedules, 30 * 1000);

// Also run once on load
navigator.serviceWorker.ready.then(() => {
    checkSchedules();
});
