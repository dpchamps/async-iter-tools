import {filter} from "./filter";
import {collect} from "../core/collect";

describe("filter", () => {
    it("Should filter", async () => {
        const base = async function* (){
            let x = 0;
            while(x < 10){
                yield x++;
            }
        };
        const iter = filter(base(), (x) => x % 2 === 0);

        await expect(collect(iter)).resolves.toEqual([0, 2, 4, 6, 8]);
    });

    it("Should filter with guards", async () => {
        const base = async function*() {
            for (const word of ["eenie", "meenie", "minie", "moe"]){
                yield word
            }
        }

        const iter = filter(base(), (word): word is "eenie" => word === "eenie");

        for await (const x of iter){
            expect(x).toBe("eenie");
        }
    })
});