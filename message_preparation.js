import { getRandomInt } from "./math_util.js";

import * as fs from 'fs';

const messageSet_raw = fs.readFileSync('./message_set.json');
const messageSet = JSON.parse(messageSet_raw);

export const prepareMessageText = function (event, fullName) {
    var replacements = {
        "{{EVENT_NAME}}": event.name,
        "{{DATE}}": event.date.toLocaleString(),
        "{{NAME}}": fullName
    };
    var message = messageSet[getRandomInt(messageSet.length)];

    Object.keys(replacements).forEach((key) => {
        const replacementValue = replacements[key];
        message = message.replace(key, replacementValue);
    });

    return message;
}