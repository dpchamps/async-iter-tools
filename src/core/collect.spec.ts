import {delay} from "../utils";
import {collect} from "./collect";

describe("collect", () => {
    it("It should collect", async () => {
        const base = async function*(){
            let i = 0;
            while(i < 5){
                yield i++;
                await delay(2);
            }
        }

        await expect(collect(base())).resolves.toEqual([0, 1, 2, 3, 4])
    })
})