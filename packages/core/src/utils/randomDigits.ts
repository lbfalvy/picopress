export function randomDigits(digits: number): string {
  return (Math.random() * Math.pow(16, digits)).toString(16);
}
