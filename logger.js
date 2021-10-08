export const LOGRunStart = function (start) {
    console.log("[CRON] ----------------------------------")
    console.log("[CRON] ----------------------------------")
    console.log("[CRON] ----------------------------------")
    console.log("[CRON] Started cronjob on " + start.toLocaleString())
    console.log("[CRON] ----------------------------------")
    console.log("[CRON] ----------------------------------")
    console.log("");
}

export const LOGSQLStart = function (nrOfElements) {
    console.log(`[CRON] Found '${nrOfElements}' events in the future`);
    console.log("[CRON] ----------------------------------");
    console.log("");
}

export const LOGEventHandling = function (eventName, distance_curr, distance_prev, nrOfReminders) {
    console.log(`[CRON] Handling event with name '${eventName}'`);
    console.log("[CRON] Seconds to event: " + distance_curr);
    console.log("[CRON] Seconds (prev) to event: " + distance_prev);
    console.log(`[CRON] Found ${nrOfReminders} reminders matching calculated distances`);
    console.log("[CRON] ---------------")
}

export const LOGSQLEnd = function () {
    console.log("[CRON] ----------------------------------");
}

export const LOGRunEnd = function (stop, dif) {
    console.log("");
    console.log("[CRON] Stopped cronjob on " + stop.toLocaleString())
    console.log("[CRON] Total runtime: " + dif + " ms")
    console.log("");
    console.log("[CRON] ----------------------------------");
}
