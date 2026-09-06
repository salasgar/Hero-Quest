import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { IMAGENES, LOGOTIPO, rutaDe } from "../src/data/imagenes";

const PUBLICO = join(__dirname, "..", "public");

/**
 * Lo que este test defiende no es que las imágenes se vean bonitas —eso no se
 * prueba—, sino dos cosas que sí se rompen solas: que una ruta declarada
 * apunte a un fichero que ya no está, y que entre una imagen sin decir de
 * dónde sale. La segunda es una condición que puso Juan Luis al firmar T41:
 * «lo descargado, con licencia que permita usarlo y con su origen apuntado».
 */
describe("las imágenes declaradas", () => {
  it("existen todas en public/", () => {
    for (const imagen of IMAGENES) {
      expect(existsSync(join(PUBLICO, imagen.archivo)), imagen.archivo).toBe(true);
    }
  });

  it("no deja ninguna imagen de public/ sin declarar", () => {
    // Solo imágenes: en `public/` puede haber otras cosas (IMAGENES.md, y lo
    // que traiga T44 con los sonidos) y no es asunto de esta lista.
    const extensiones = [".png", ".webp", ".svg", ".jpg", ".jpeg", ".gif", ".avif"];
    const enDisco = readdirSync(PUBLICO).filter((f) =>
      extensiones.some((ext) => f.toLowerCase().endsWith(ext)),
    );
    const declaradas = new Set(IMAGENES.map((i) => i.archivo));
    expect(enDisco.filter((f) => !declaradas.has(f))).toEqual([]);
  });

  it("dice de dónde sale cada una y con qué permiso", () => {
    for (const imagen of IMAGENES) {
      expect(imagen.procedencia.trim(), imagen.archivo).not.toBe("");
      expect(imagen.licencia.trim(), imagen.archivo).not.toBe("");
    }
  });

  it("no tiene descargadas sin licencia nombrada", () => {
    // Las generadas y las que dio Juan Luis no arrastran a nadie de fuera. Una
    // descargada sin licencia concreta sí, y esa es la que no puede colarse.
    for (const imagen of IMAGENES.filter((i) => i.origen === "descargada")) {
      expect(imagen.licencia, imagen.archivo).toMatch(/CC0|CC BY|dominio público|MIT|SIL OFL/i);
    }
  });

  it("el logotipo está entre ellas", () => {
    expect(IMAGENES.some((i) => i.archivo === LOGOTIPO)).toBe(true);
  });
});

describe("rutaDe", () => {
  it("cuelga la imagen de la base del sitio", () => {
    // En Pages la base es `/Hero-Quest/`; en `npm run dev`, `/`. Lo que importa
    // es que la ruta salga de ahí y no escrita a mano, que es lo que dejó una
    // imagen rota en la página publicada la última vez.
    expect(rutaDe(LOGOTIPO)).toBe(`${import.meta.env.BASE_URL}${LOGOTIPO}`);
  });

  it("se niega a servir una imagen que no está declarada", () => {
    expect(() => rutaDe("dragon-inventado.png")).toThrow(/no declarada/);
  });
});
