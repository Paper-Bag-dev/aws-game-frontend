export const randomFromArray = <T>(array: T[]): T => {
    if (array.length === 0) {
      throw new Error("Array cannot be empty");
    }
    return array[Math.floor(Math.random() * array.length)];
  };
  