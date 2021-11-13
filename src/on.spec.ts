import {on} from "./on";
import EventEmitter from "events";
import {identity} from "./utils";

describe("on", () => {
    it("Should transport an event emitter into async iterator", async () => {
        const ee = new EventEmitter();
        const onMessage = on(ee, 'message');

        ee.emit('message', "hello");

        await expect(onMessage.next()).resolves.toEqual({
            value: ["hello"],
            done: false
        });
    });

    it("Should maintain order of events fired", async () => {
       const ee = new EventEmitter();
       const onMessage = on(ee, 'message');

       ee.emit('message', "Hello");
       ee.emit('message', "My name is");
       ee.emit('message', "Inigo Montoya");

       await expect(onMessage.next()).resolves.toEqual({
           value: ["Hello"],
           done: false
       });

       await expect(onMessage.next()).resolves.toEqual({
           value: ["My name is"],
           done: false
       });

       await expect(onMessage.next()).resolves.toEqual({
           value: ["Inigo Montoya"],
           done: false
       });
    });

    it("Should be iterable", async () => {
        const ee = new EventEmitter();
        const onMessage = on(ee, 'message');

        setTimeout(() => {
            ee.emit("message", "Sometime Later")
        }, 1);

        for await (const message of onMessage){
            expect(message).toEqual(["Sometime Later"]);
            break;
        }
    });

    it("Should stop iteration when return is called", async () => {
        const ee = new EventEmitter();
        const onMessage = on(ee, "message");

        ee.emit("message", "See you space cowboy");

        await expect(onMessage.next()).resolves.toEqual({
            value: ['See you space cowboy'],
            done: false
        });

        await expect(onMessage.return()).resolves.toEqual({
            value: undefined,
            done: true
        });

        await expect(onMessage.next()).resolves.toEqual({
            value: undefined,
            done: true
        });
    });

    it("Should throw when .throw is called", async () => {
        const ee = new EventEmitter();
        const noop = on(ee, "message");
        const error = new Error("its dead jim");
        await expect(noop.throw(error)).rejects.toThrow(error);
    })

    it("Should cancel iteration on throw", async () => {
       const ee = new EventEmitter();
       const noop = on(ee, 'message');

       await noop.throw().catch(identity);
       ee.emit("message", "something");
       await expect(noop.next()).resolves.toEqual({
           value:undefined,
           done: true
       });
    });

    it("Should remove attached event listeners on return", async () => {
       const ee = new EventEmitter();
       expect(ee.rawListeners('noop')).toHaveLength(0);

       const noop = on(ee, "noop");

       expect(ee.rawListeners('noop')).toHaveLength(1);
       await noop.return();
       await new Promise( res => process.nextTick(res));
       expect(ee.rawListeners('noop')).toHaveLength(0);
    });

    it("Should remove attached event listeners on throw", async () => {
       const ee = new EventEmitter();
       expect(ee.rawListeners('noop')).toHaveLength(0);

       const noop = on(ee, "noop");

       expect(ee.rawListeners('noop')).toHaveLength(1);
       await noop.throw().catch(identity);
       await new Promise( res => process.nextTick(res));
       expect(ee.rawListeners('noop')).toHaveLength(0);
    });
});