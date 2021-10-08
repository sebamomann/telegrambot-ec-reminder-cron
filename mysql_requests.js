import * as mysql from 'mysql2/promise';
import moment from 'moment-timezone';
import { LOGEventHandling, LOGSQLStart } from './logger.js';

var con;

export async function startConnection() {
    try {
        con = await mysql.createConnection({
            host: process.env.MYSQL_URL,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB
        });
        console.log(`[SQL] Connected!`);
    } catch (e) {
        console.log(`[SQL] Could not connect to database. Reason ${e}`)
    }
}

export async function fetchEventsAndReminders() {
    var sql = 'SELECT * FROM event WHERE date >= CURRENT_TIMESTAMP';

    const [result] = await con.execute(sql);

    LOGSQLStart(result.length);

    const events = [];
    const currentTime = moment(new Date()); // current system time
    var prevTime = moment(new Date()).subtract(1, "minutes"); // current system time one minte back

    for (let event of result) {
        const eventTime = moment(event.date);

        var distance_curr = moment.duration(eventTime.diff(currentTime)).asSeconds();
        var distance_prev = moment.duration(eventTime.diff(prevTime)).asSeconds();

        const reminders = await fetchRemindersInTimespanByEventId(event.id, distance_curr, distance_prev);

        // save active reminders with the event in an array
        if (reminders.length > 0) {
            events.push({ event, reminders });
        }

        LOGEventHandling(event.name, distance_curr, distance_prev, reminders.length);
    }

    LOGSQLEnd();

    return events;
}

export async function fetchRemindersInTimespanByEventId(eventId, curr, prev) {
    var sql = 'SELECT *, account.id AS accountId FROM reminder JOIN account ON reminder.userId = account.id WHERE eventId = ? AND distance >= ? AND distance < ?';

    const [result] = await con.execute(sql, [eventId, curr, prev]);

    return result;
}

function isDST(d) {
    let jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
    let jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) != d.getTimezoneOffset();
}