import { IStringParamObj } from './types';
import { compareStrObjs } from './file-utils';

export const merge = async (
  leftArr: IStringParamObj[],
  rightArr: IStringParamObj[],
  fileName: string,
  collator?: Intl.Collator,
): Promise<IStringParamObj[]> => {
  let arr = [];

  while (leftArr.length && rightArr.length) {
    const leftEl = leftArr[0];
    const rightEl = rightArr[0];

    const cmpRes = await compareStrObjs(leftEl, rightEl, fileName, collator);

    if (cmpRes) {
      const leftPushEl = leftArr.shift();
      arr.push(leftPushEl);
    } else {
      const rightPushEl = rightArr.shift();
      arr.push(rightPushEl);
    }
  }
  return [...arr, ...leftArr, ...rightArr];
};

/**
 * Функция сортировки полученного выше массива объектов с рекурсией
 * используется метод слияния
 *
 * @return {object[]} sortedParamObjArr - массив объектов IStringParamObj
 * */
export const mergeSortWithRecursive = async (
  array: IStringParamObj[],
  fileName: string,
  collator?: Intl.Collator,
): Promise<IStringParamObj[]> => {
  // находим середину
  const half = array.length / 2;

  if (array.length < 2) {
    return array;
  }

  const left = array.splice(0, half);

  return merge(
    await mergeSortWithRecursive(left, fileName, collator),
    await mergeSortWithRecursive(array, fileName, collator),
    fileName,
    collator,
  );
};

export const mergeSort = async (
  array: IStringParamObj[],
  fileName: string,
  collator?: Intl.Collator,
): Promise<IStringParamObj[]> => {
  let resArr: IStringParamObj[][] = [];
  for (let i = 0; i < 10; i++) {
    resArr.push([array[i]]);
  }
  let tmpArr = [];
  let elemsInSortArray = 1;

  while (resArr.length != 1) {
    console.log(resArr.length);
    console.log(resArr);
    let counter = 0;
    for (let i = 0; i < resArr.length; i += 2) {
      console.log('counter:', counter);
      const leftArr = resArr[i];

      if (i + 1 < resArr.length) {
        const rightArr = resArr[i + 1];

        const mergeArr = await merge(leftArr, rightArr, fileName, collator);

        tmpArr.push(mergeArr);
      } else {
        tmpArr.push(leftArr);
      }
      counter++;
    }
    resArr = tmpArr;
    tmpArr = [];
    elemsInSortArray *= 2;
  }
  console.log('finat arr: ', resArr);
  return resArr[0];
};
