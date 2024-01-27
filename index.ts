// console.log('hello world !!!');
import { getBuffer, getFileByLine, printMemoryUsage } from './file-utils';
import { mergeSort, mergeSortWithRecursive } from './sort-utils';
import fsp from 'fs/promises';
import fs from 'fs';
import readline from 'readline';

const params: {
  fileName: string;
  availableMemory: number;
} = {
  fileName: 'bigfile1.txt',
  availableMemory: 500 * 1024 * 1024,
};

// printMemoryUsage();

/**
 * Функция сортировки строкового файла
 * @param {string} fileName - наименование файла
 * @returns {void}
 * */
export const sortFile = async (fileName: string) => {
  console.time('all code');
  console.time('create StrObject');

  const stringParamObjArr = await getFileByLine(fileName);
  console.timeEnd('create StrObject');
  // console.log('stringParamObjArr: ', stringParamObjArr.slice(0, 10));

  let collator = new Intl.Collator();

  console.time('sort arr');

  const sortedParamObjArr = await mergeSortWithRecursive(
    stringParamObjArr,
    fileName,
    collator,
  );

  console.timeEnd('sort arr');
  // console.log('sortedParamObjArr: ', sortedParamObjArr);
  console.log('sortedParamObjArr length: ', sortedParamObjArr.length);

  console.time('save in new file');

  let currentMemoryUsage = 0;
  const sortFileName = fileName.split('.');
  let newFile = await fsp.open(
    `${sortFileName[0]}_sort.${sortFileName[1]}`,
    'w',
  );

  let ws = newFile.createWriteStream({
    encoding: 'utf-8',
  });
  for (let i = 0; i < sortedParamObjArr.length; i++) {
    const memoryUsage = sortedParamObjArr[i].end - sortedParamObjArr[i].start;
    currentMemoryUsage += memoryUsage;

    if (params.availableMemory >= currentMemoryUsage) {
      // console.log('have available memory');
      let str = await getBuffer(sortedParamObjArr[i], fileName);
      ws.write(str);
    } else if (
      params.availableMemory >= memoryUsage &&
      params.availableMemory < currentMemoryUsage
    ) {
      console.log(`Out available memory ${i} string`);
      ws.close();
      await newFile.close();

      newFile = await fsp.open(
        `${sortFileName[0]}_sort.${sortFileName[1]}`,
        'a+',
      );
      ws = newFile.createWriteStream({
        encoding: 'utf-8',
      });
      currentMemoryUsage = 0;
    }
  }

  console.timeEnd('save in new file');
  console.timeEnd('all code');
};

sortFile(params.fileName);

// const rs = fs.createReadStream(params.fileName, {
//   start: sortedParamObjArr[i].start,
//   end: sortedParamObjArr[i].end,
//   encoding: 'utf-8',
// });
//
// const rl = readline.createInterface({
//   input: rs,
// });
//
// rl.on('line', async line => {
//   if (line[line.length - 1] !== '\n') {
//     line += '\n';
//   }
//   ws.write(line);
// });
