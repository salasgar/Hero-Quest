/**
 * El relevo, corriendo en el portátil, para probar sin desplegar nada.
 *
 * Existe por un motivo concreto: T32 no se puede dar por buena sin abrir dos
 * navegadores y ver que una jugada hecha en uno aparece en el otro, y el relevo
 * de verdad —el Durable Object de Cloudflare— necesita una cuenta y la firma de
 * Juan Luis. Esto quita esa espera de en medio.
 *
 * **No es el relevo de producción y no debe llegar a serlo.** Guarda las
 * partidas en memoria: al parar el proceso desaparecen. Sirve para una tarde de
 * pruebas en casa, no para jugar con alguien que está lejos, porque escucha en
 * `localhost` y ahí no llega nadie de fuera.
 *
 * Lo que sí comparte con el de producción es **todo lo que decide algo**:
 * `src/red/protocolo.ts`, la misma función y los mismos rechazos. Si esto y
 * Cloudflare se comportaran distinto, el problema estaría en la cáscara, no en
 * las reglas.
 *
 *     npm run relevo
 *     npm run dev
 *     # y se abre  http://localhost:5173/?relevo=http://localhost:8787
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import {
  anadir,
  codigoDePartida,
  crearRegistro,
  LARGO_DEL_CODIGO,
  truncar,
  vista,
  type Montaje,
  type Registro,
} from "../src/red/protocolo";

const PUERTO = Number(process.env.PORT ?? 8787);

/** Una partida por código. En memoria: esto no sobrevive al proceso. */
const partidas = new Map<string, Registro>();

const CABECERAS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const responder = (res: ServerResponse, estado: number, cuerpo: unknown): void => {
  res.writeHead(estado, CABECERAS);
  res.end(JSON.stringify(cuerpo));
};

const leerCuerpo = async (req: IncomingMessage): Promise<Record<string, unknown>> => {
  const trozos: Buffer[] = [];
  for await (const t of req) trozos.push(t as Buffer);
  if (trozos.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(trozos).toString("utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const nuevoCodigo = (): string => codigoDePartida(randomBytes(LARGO_DEL_CODIGO));

createServer((req, res) => {
  void (async () => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CABECERAS);
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://localhost:${PUERTO}`);
    const camino = url.pathname.split("/").filter(Boolean);

    // Node atiende las peticiones de una en una en este bucle, así que «leer,
    // decidir, guardar» ya es indivisible aquí. En Cloudflare lo da el Durable
    // Object con `blockConcurrencyWhile`; es el mismo requisito, cumplido de
    // otra manera: guardar antes de contestar.
    if (req.method === "POST" && camino.length === 1 && camino[0] === "partidas") {
      const cuerpo = await leerCuerpo(req);
      const montaje = cuerpo.montaje as Montaje | undefined;
      if (!montaje) return responder(res, 400, { ok: false, motivo: "Falta el montaje." });

      const codigo = nuevoCodigo();
      const secreto = randomBytes(16).toString("hex");
      const creado = crearRegistro(montaje, secreto);
      if (!creado.ok) return responder(res, 409, { ok: false, motivo: creado.motivo });
      partidas.set(codigo, creado.valor);
      console.log(`partida ${codigo} creada`);
      return responder(res, 200, { ok: true, codigo, secreto });
    }

    if (camino[0] === "partidas" && camino.length >= 2) {
      const codigo = (camino[1] ?? "").toUpperCase();
      const registro = partidas.get(codigo);
      if (!registro)
        return responder(res, 404, { ok: false, motivo: "No hay ninguna partida con ese código." });
      const operacion = camino[2] ?? "";

      if (req.method === "GET") {
        const desde = Number(url.searchParams.get("desde") ?? 0);
        return responder(res, 200, {
          ok: true,
          ...vista(registro, Number.isFinite(desde) ? desde : 0),
        });
      }

      if (req.method === "POST" && operacion === "acciones") {
        const cuerpo = await leerCuerpo(req);
        const escrito = anadir(registro, {
          esperado: cuerpo.esperado as number,
          accion: cuerpo.accion as Parameters<typeof anadir>[1]["accion"],
          autor: cuerpo.autor as string,
        });
        if (!escrito.ok)
          return responder(res, 409, {
            ok: false,
            motivo: escrito.motivo,
            entradas: escrito.entradas,
            total: escrito.total,
          });
        partidas.set(codigo, escrito.valor);
        return responder(res, 200, { ok: true, total: escrito.valor.entradas.length });
      }

      if (req.method === "POST" && operacion === "truncar") {
        const cuerpo = await leerCuerpo(req);
        const cortado = truncar(registro, {
          esperado: cuerpo.esperado as number,
          secreto: cuerpo.secreto as string,
        });
        if (!cortado.ok)
          return responder(res, cortado.motivo.includes("mesa") ? 403 : 409, {
            ok: false,
            motivo: cortado.motivo,
            entradas: cortado.entradas,
            total: cortado.total,
          });
        partidas.set(codigo, cortado.valor);
        return responder(res, 200, { ok: true, total: cortado.valor.entradas.length });
      }
    }

    responder(res, 404, { ok: false, motivo: "Esa dirección no existe." });
  })();
}).listen(PUERTO, () => {
  console.log(`Relevo local escuchando en http://localhost:${PUERTO}`);
  console.log(`Abre  http://localhost:5173/?relevo=http://localhost:${PUERTO}`);
});
