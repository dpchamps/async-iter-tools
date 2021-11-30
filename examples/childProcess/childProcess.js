"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const src_1 = require("../../src");
const type = (type, value) => ({
    type,
    value
});
const intoMessage = ([message]) => type("message", message);
const intoError = ([message]) => type("error", message);
const intoExit = ([message]) => type("exit", message);
const go = async () => {
    const cp = (0, child_process_1.fork)(`${__dirname}/child.js`);
    const interval = setInterval(() => cp.send("Send"), 1000);
    const iter = (0, src_1.merge)((0, src_1.map)((0, src_1.on)(cp, "message"), intoMessage), (0, src_1.map)((0, src_1.on)(cp, "exit"), intoExit), (0, src_1.throws)((0, src_1.map)((0, src_1.on)(cp, "error"), intoError)));
    try {
        for await (const event of iter) {
            console.log(event);
        }
    }
    catch (e) {
        console.log(`Halted with error:`, e);
        clearInterval(interval);
    }
};
go().catch(console.error);
