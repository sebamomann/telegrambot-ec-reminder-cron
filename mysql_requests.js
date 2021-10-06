import * as mysql from 'mysql2/promise';

var con;

export async function startConnection() {
    try {
        con = await mysql.createConnection({
            host: process.env.MYSQL_URL,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            timezone: 'UTC'
        });
        console.log(`[SQL] Connected!`);
    } catch (e) {
        console.log(`[SQL] Could not connect to database. Reason ${e}`)
    }
}

export async function fetchEventsAndReminders() {
    var sql = 'SELECT * FROM event WHERE date > CURRENT_DATE';

    const [result] = await con.execute(sql);

    console.log(`[CRON] Found '${result.length}' events in the future`);
    console.log("");

    const events = [];

    // loop
    for (let event of result) {
        console.log(`[CRON] Handling event with name '${event.name}'`);

        var eventTime = new Date(event.date);
        var currentTime = new Date();
        var prevTime = new Date();
        prevTime.setTime(prevTime.getTime() - (1000 * 60)); // previous minute

        var distance_curr = eventTime.getTime() - currentTime.getTime();
        distance_curr = distance_curr / 1000; // time in seconds
        distance_curr = Math.floor(distance_curr);
        console.log("[CRON] Seconds to event: " + distance_curr);

        var distance_prev = eventTime.getTime() - prevTime.getTime();
        distance_prev = distance_prev / 1000; // time in seconds
        distance_prev = Math.floor(distance_prev);
        console.log("[CRON] Seconds (prev) to event: " + distance_prev);

        console.log(`[CRON] Query reminders`);
        const reminders = await fetchRemindersInTimespanByEventId(event.id, distance_curr, distance_prev);
        console.log(`[CRON] Found ${reminders.length} reminders`);

        if (reminders.length > 0) {
            events.push({ event, reminders });
        }

        console.log("");
    }

    return events;
}

export async function fetchRemindersInTimespanByEventId(eventId, curr, prev) {
    var sql = 'SELECT * FROM reminder JOIN account ON reminder.userId = account.id WHERE eventId = ? AND distance > ? AND distance < ?';

    const [result] = await con.execute(sql, [eventId, curr, prev]);

    return result;
}