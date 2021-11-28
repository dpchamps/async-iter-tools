import {collect} from "./collect";
import {take} from "./take";
import {repeat} from "./repeat";

describe('take', () => {
    it("Should take the number specified", async () => {
        const mock = jest.fn();
        await expect(
            collect(take(repeat(mock), 5))
        ).resolves.toHaveLength(5);
        expect(mock).toHaveBeenCalledTimes(5)
    });

    it("Should take up to but not including the number specified", async () => {
        const base = async function*(){
            let i = 0;
            while(i < 5){
                yield i++
            }
        }

        await expect(collect(take(base(), 10))).resolves.toEqual([0,1,2,3,4]);
    });
})