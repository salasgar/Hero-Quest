/** Un color estable y distinguible por letra de sala. */
export function colorDeSala(clave: string): string {
  if (clave === ".") return "#7c8698";
  const n = clave.charCodeAt(0) - 97; // 'a' -> 0
  const tono = (n * 360) / 22 + 12;
  return `hsl(${tono.toFixed(0)} 62% 58%)`;
}

export const COLOR_PASILLO = "#5b6472";
