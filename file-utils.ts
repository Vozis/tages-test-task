import fsp from 'fs/promises';
import { IStringParamObj } from './types';
import fs from 'fs';
import readline from 'readline';

/**
 * Функция пробегает по каждой строке исходного файла и получает для нее объект
 * с данным
 * @param {string} fileName - наименование файла
 * @return {object} объект типа IStringParamObj
 * */
export const getFileByLine = async (
  fileName: string,
): Promise<IStringParamObj[]> => {
  return new Promise((resolve, reject) => {
    const arr: IStringParamObj[] = [];
    let stringCounter = 0;
    let startPos = 0;
    let endPos = 0;

    const rs = fs.createReadStream(fileName, {
      encoding: 'utf-8',
    });

    const rl = readline.createInterface({
      input: rs,
    });

    rl.on('line', async line => {
      const strObj: IStringParamObj = {
        start: startPos,
        end: endPos + line.length,
        readLetters: line[0],
      };
      startPos = endPos + line.length + 1;
      endPos = startPos;
      stringCounter++;
      arr.push(strObj);
    }).on('close', () => resolve(arr));
  });
};

export const getElFromFile = async (
  start: number,
  end: number,
  fileName: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const file = await fsp.open(fileName, 'r');
    const rs = file.createReadStream({
      start,
      end,
      encoding: 'utf-8',
    });

    rs.on('data', async chunk => {
      rs.close();
      await file.close();
      return resolve(chunk.toString());
    });
  });
};

export const getBuffer = async (
  elObj: IStringParamObj,
  fileName: string,
): Promise<string | Buffer> => {
  return new Promise(async (resolve, reject) => {
    const file = await fsp.open(fileName, 'r');
    const rs = file.createReadStream({
      start: elObj.start,
      end: elObj.end,
      encoding: 'utf-8',
    });

    const rl = readline.createInterface({
      input: rs,
    });

    rl.on('line', async line => {
      rs.close();
      rl.close();
      await file.close();
      return resolve(line + '\n');
    });

    // rs.on('data', async chunk => {
    //   rs.close();
    //   await file.close();
    //   return resolve(chunk);
    // });
  });
};

export const compareStrObjs = async (
  firstObj: IStringParamObj,
  secondObj: IStringParamObj,
  fileName: string,
  collator?: Intl.Collator,
): Promise<boolean> => {
  let readLetterCounter = 0;
  let firstLetterIndex = firstObj.start;
  let secondLetterIndex = secondObj.start;
  let firstCmpStr = firstObj.readLetters;
  let secondCmpStr = secondObj.readLetters;

  while (true) {
    if (readLetterCounter >= firstCmpStr.length) {
      firstObj.readLetters = await getElFromFile(
        firstLetterIndex,
        firstLetterIndex + firstObj.readLetters.length + 1,
        fileName,
      );
      firstCmpStr = firstObj.readLetters;
    }
    if (readLetterCounter >= secondCmpStr.length) {
      secondObj.readLetters = await getElFromFile(
        secondLetterIndex,
        secondLetterIndex + secondObj.readLetters.length + 1,
        fileName,
      );
      secondCmpStr = secondObj.readLetters;
    }

    const compare = collator.compare(
      firstCmpStr[readLetterCounter],
      secondCmpStr[readLetterCounter],
    );

    if (compare < 0) {
      return true;
    } else if (compare > 0) {
      return false;
    } else if (compare === 0) {
      readLetterCounter++;
    }
  }
};

export function printMemoryUsage() {
  const formatMemoryUsage = data =>
    `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

  const memoryData = process.memoryUsage();

  const memoryUsage = {
    rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };

  console.log(memoryUsage);
  return memoryData;
}
