function generateRandomName(): string {
  let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ1234567890";
  let out = "";
  for (let i = 0; i < 10; i++) {
    let index = Math.floor(Math.random() * abc.length);
    out += abc.charAt(index);
  }
  return out;
}


export default {
    generateRandomName
}