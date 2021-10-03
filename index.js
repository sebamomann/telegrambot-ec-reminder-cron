import { Telegraf } from 'telegraf';
import { startConnection, fetchEventsAndReminders } from './mysql_requests.js'
import * as fs from 'fs';
import * as cron from 'cron';

const messageSet_raw = fs.readFileSync('./message_set.json');
const messageSet = JSON.parse(messageSet_raw);

// START TELEGRAMBOT
const bot = new Telegraf(process.env.BOT_API_TOKEN);

// CONNECT TO DATABASE
await startConnection();

const job = cron.job(process.env.CRON_DEFINITION, () => run())
job.start();

async function run() {
    const start = new Date();

    console.log("[CRON] ----------------------------------")
    console.log("[CRON] ----------------------------------")
    console.log("[CRON] ----------------------------------")
    console.log("");
    console.log("[CRON] Started cronjob on " + start.toLocaleString())
    console.log("");
    console.log("[CRON] ----------------------------------")
    console.log("");

    const datasets = await fetchEventsAndReminders();

    for (var dataset of datasets) {
        const event = dataset.event;
        const reminders = dataset.reminders;

        var replacements = { "{{EVENT_NAME}}": event.name, "{{DATE}}": event.date.toLocaleString(), "{{NAME}}": null };

        for (var reminder of reminders) {
            const first_name = reminder.first_name;
            const last_name = reminder.last_name;

            replacements["{{NAME}}"] = first_name + " " + last_name;

            var message = messageSet[getRandomInt(messageSet.length)];

            Object.keys(replacements).forEach((key) => {
                const replacementValue = replacements[key];
                message = message.replace(key, replacementValue);
            })


            bot.telegram.sendMessage(reminder.userId, message);
        }
    }


    const stop = new Date();

    var dif = stop.getTime() - start.getTime();

    console.log("");
    console.log("[CRON] Stopped cronjob on " + stop.toLocaleString())
    console.log("[CRON] Total runtime: " + dif + " ms")
    console.log("");
    console.log("[CRON] ----------------------------------");
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
