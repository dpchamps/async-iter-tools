import {map} from "./map";
import {delay} from "./utils";

describe("Map async iterator", () => {
   it("Should map an async iterator", async () => {
       async function* fn(){
           let x = 1;
           while(x < 4){
               yield x ++;
               await delay(10);
           }
       }

       const mapped = map(fn(), (x) => String(x*x));

       await expect(mapped.next()).resolves.toEqual({value: "1", done: false});
       await expect(mapped.next()).resolves.toEqual({value: "4", done: false});
       await expect(mapped.next()).resolves.toEqual({value: "9", done: false});
       await expect(mapped.next()).resolves.toEqual({value: undefined, done: true});
   });

   it("Should be iterable", async () => {
       expect.assertions(1)
       async function* doesWork() {
           await delay(1);
           yield 1
       }

       for await(const x of map(doesWork(), x => x)){
           expect(x).toBe(1);
       }
   })
});
