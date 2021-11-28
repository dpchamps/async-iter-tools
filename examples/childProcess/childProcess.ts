import {fork} from 'child_process';
import {merge, on, map, throws} from "../../src";

const type = <T>(type: string, value: T) => ({
    type,
    value
});

const intoMessage = ([message]: string[]) => type("message", message);
const intoError = ([message]: number[]) => type("error", message);
const intoExit = ([message]: unknown[]) => type("exit", message);

const go = async () => {
    const cp = fork(`${__dirname}/child.js`);
    const interval = setInterval(() => cp.send("Send"), 1000);
    const iter = merge(
        map(on(cp, "message"), intoMessage),
        map(on(cp, "exit"), intoExit),
        throws(map(on(cp, "error"), intoError)),
    );

    try{
        for await (const event of iter){
            console.log(event);
        }
    }catch (e){
        console.log(`Halted with error:`, e);
        clearInterval(interval);
    }

};

go().catch(console.error);