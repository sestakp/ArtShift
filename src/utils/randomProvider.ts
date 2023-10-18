
export const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
 export function getRandomBoolean() {
    return getRandomInt(0, 1) === 1; // Maps 0 to false and 1 to true
  }