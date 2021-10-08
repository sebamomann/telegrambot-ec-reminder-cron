import { Telegraf } from 'telegraf';
import { fetchEventsAndReminders } from './mysql_requests.js'
import { LOGRunStart, LOGRunEnd } from './logger.js';
import { parseFullName } from './account_parser.js';
import { prepareMessageText } from './message_preparation.js';

import * as cron from 'cron';

import dotenv from 'dotenv'
dotenv.config()

// START TELEGRAMBOT
const bot = new Telegraf(process.env.BOT_API_TOKEN);

const job = cron.job(process.env.CRON_DEFINITION, () => run())
job.start();

async function run() {
    const start = new Date();

    LOGRunStart(start);

    const datasets = await fetchEventsAndReminders();
    handleDatasets(datasets);

    const stop = new Date();

    LOGRunEnd(stop, stop.getTime() - start.getTime());
}

/**
 * Loop through each dataset
 * 
 * @param {event: {id, date, name}, reminders: {id, eventId, userId, distance, first_name, last_name, username, language}[]} datasets 
 */
function handleDatasets(datasets) {
    for (var dataset of datasets) {
        const event = dataset.event;
        const reminders = dataset.reminders;

        handleDataset(event, reminders);
    }
}

/**
 * Send Message to all reminders
 * 
 * @param {id, date, name} event
 * @param {{id, eventId, userId, distance, first_name, last_name, username, language}[]} reminders
 */
function handleDataset(event, reminders) {
    for (var reminder of reminders) {
        const fullName = parseFullName(reminder.first_name, reminder.last_name);
        var message = prepareMessageText(event, fullName);

        bot.telegram.sendMessage(reminder.userId, message);
    }
}
