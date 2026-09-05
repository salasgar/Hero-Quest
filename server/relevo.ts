/**
 * El relevo de acciones: el servicio que reparte una partida entre dos casas.
 *
 * Es una cáscara. Todo lo que **decide** algo vive en `src/red/protocolo.ts`,
 * puro y probado con vitest; aquí solo se traduce HTTP a esas funciones y se
 * guarda el resultado. Si alguna vez te encuentras escribiendo una regla de
 * HeroQuest en este fichero, te has salido de la tarea: el relevo no sabe jugar
 * y no debe aprender.
 *
 * Una partida = un Durable Object, con el código de partida como nombre. Eso da
 * gratis lo único que hace falta: **dentro de un objeto no hay dos peticiones a
 * la vez**, así que el candado del `esperado` se comprueba sin carreras. Es el
 * requisito que fija `tests/red-protocolo.test.ts` bajo el nombre «guardar antes
 * de contestar».
 *
 * Despliegue y cuenta: `server/README.md`.
 */

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

// ------------------------------------------------------- lo que pone Cloudflare
//
// Declarado a mano y al mínimo, en vez de traerse `@cloudflare/workers-types`:
// son cuatro métodos y así el repositorio no gana una dependencia de desarrollo
// que solo usa un fichero. Si algún día hace falta más superficie, mejor la
// dependencia que ir alargando esto.

interface AlmacenDurable {
  get<T>(clave: string): Promise<T | undefined>;
  put<T>(clave: string, valor: T): Promise<void>;
  deleteAll(): Promise<void>;
  setAlarm(cuando: number): Promise<void>;
}

interface EstadoDurable {
  storage: AlmacenDurable;
  blockConcurrencyWhile<T>(f: () => Promise<T>): Promise<T>;
}

interface Puerta {
  idFromName(nombre: string): unknown;
  get(id: unknown): { fetch(peticion: Request): Promise<Response> };
}

export interface Entorno {
  PARTIDAS: Puerta;
}

// ------------------------------------------------------------------ respuestas

/**
 * CORS abierto.
 *
 * La página vive en `salasgar.github.io` y el relevo en otro dominio, así que sin
 * estas cabeceras el navegador rechaza cada petición **antes de enviarla**, y el
 * fallo se lee en pantalla como «el relevo no responde», que es exactamente la
 * pista equivocada. Abierto a cualquier origen a propósito: aquí no hay sesión de
 * usuario ni cookie que robar, solo un código de partida de cuatro letras que ya
 * se manda por WhatsApp.
 */
const CABECERAS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const json = (cuerpo: unknown, estado = 200): Response =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: CABECERAS });

/** Un motivo legible, en el mismo formato que devuelve el motor. */
const error = (motivo: string, estado: number, extra: Record<string, unknown> = {}): Response =>
  json({ ok: false, motivo, ...extra }, estado);

/** Treinta días sin tocarla y la partida se borra. Ver el README. */
const CADUCIDAD = 30 * 24 * 60 * 60 * 1000;

// ------------------------------------------------------- una partida en marcha

export class Partida {
  constructor(private readonly estado: EstadoDurable) {}

  private async leer(): Promise<Registro | undefined> {
    return this.estado.storage.get<Registro>("registro");
  }

  private async guardar(registro: Registro): Promise<void> {
    await this.estado.storage.put("registro", registro);
    await this.estado.storage.setAlarm(Date.now() + CADUCIDAD);
  }

  /** La caducidad. Una partida abandonada no puede quedarse aquí para siempre. */
  async alarm(): Promise<void> {
    await this.estado.storage.deleteAll();
  }

  async fetch(peticion: Request): Promise<Response> {
    const url = new URL(peticion.url);
    const camino = url.pathname.split("/").filter(Boolean);
    // El Worker ya ha enrutado: aquí llega `.../:codigo[/acciones|/truncar]`.
    const operacion = camino[camino.length - 1] ?? "";

    // `blockConcurrencyWhile` es lo que convierte «leer, decidir, guardar» en un
    // paso indivisible. Sin él, dos peticiones podrían leer el mismo registro y
    // las dos creerían ir al día: es justo la carrera que el `esperado` existe
    // para atrapar, y aquí es donde se cierra.
    return this.estado.blockConcurrencyWhile(async () => {
      if (peticion.method === "POST" && operacion === "crear") {
        if (await this.leer()) return error("Ese código de partida ya está cogido.", 409);
        const cuerpo = (await peticion.json()) as { montaje?: Montaje; secreto?: string };
        if (!cuerpo.montaje || !cuerpo.secreto) return error("Falta el montaje o el secreto.", 400);
        const creado = crearRegistro(cuerpo.montaje, cuerpo.secreto);
        if (!creado.ok) return error(creado.motivo, 409);
        await this.guardar(creado.valor);
        return json({ ok: true, total: 0 });
      }

      const registro = await this.leer();
      if (!registro) return error("No hay ninguna partida con ese código.", 404);

      if (peticion.method === "GET") {
        const desde = Number(url.searchParams.get("desde") ?? 0);
        return json({ ok: true, ...vista(registro, Number.isFinite(desde) ? desde : 0) });
      }

      if (peticion.method === "POST" && operacion === "acciones") {
        const cuerpo = (await peticion.json()) as {
          esperado?: number;
          accion?: unknown;
          autor?: string;
        };
        if (typeof cuerpo.esperado !== "number" || !cuerpo.accion || !cuerpo.autor) {
          return error("Falta el esperado, la acción o el autor.", 400);
        }
        const escrito = anadir(registro, {
          esperado: cuerpo.esperado,
          // El relevo no valida reglas: la legalidad la comprueba cada pantalla
          // con el motor, que es quien sabe. Aquí solo se guarda.
          accion: cuerpo.accion as Parameters<typeof anadir>[1]["accion"],
          autor: cuerpo.autor,
        });
        if (!escrito.ok) {
          // 409 no es un fallo, es el caso normal de dos jugadores a la vez: se
          // le devuelve lo que le faltaba para que se ponga al día y reintente.
          return error(escrito.motivo, 409, { entradas: escrito.entradas, total: escrito.total });
        }
        await this.guardar(escrito.valor);
        return json({ ok: true, total: escrito.valor.entradas.length });
      }

      if (peticion.method === "POST" && operacion === "truncar") {
        const cuerpo = (await peticion.json()) as { esperado?: number; secreto?: string };
        if (typeof cuerpo.esperado !== "number" || !cuerpo.secreto) {
          return error("Falta el esperado o el secreto.", 400);
        }
        const cortado = truncar(registro, { esperado: cuerpo.esperado, secreto: cuerpo.secreto });
        if (!cortado.ok) {
          const codigo = cortado.motivo.includes("mesa") ? 403 : 409;
          return error(cortado.motivo, codigo, { entradas: cortado.entradas, total: cortado.total });
        }
        await this.guardar(cortado.valor);
        return json({ ok: true, total: cortado.valor.entradas.length });
      }

      return error("Esa operación no existe.", 404);
    });
  }
}

// ------------------------------------------------------------------ el enrutado

/** Cuatro letras al azar del alfabeto sin `I`, `O`, `0` ni `1`. */
const nuevoCodigo = (): string =>
  codigoDePartida(crypto.getRandomValues(new Uint8Array(LARGO_DEL_CODIGO)));

/**
 * El secreto de la mesa, que es lo único que distingue a quien puede deshacer.
 * No es una contraseña de nada más: 16 bytes bastan y sobran.
 */
const nuevoSecreto = (): string =>
  [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export default {
  async fetch(peticion: Request, entorno: Entorno): Promise<Response> {
    if (peticion.method === "OPTIONS") return new Response(null, { headers: CABECERAS });

    const url = new URL(peticion.url);
    const camino = url.pathname.split("/").filter(Boolean);

    // POST /partidas — crear. El código lo pone el servidor, no el cliente: si lo
    // eligiera quien llama, dos mesas podrían pedir el mismo y una se metería en
    // la partida de la otra.
    if (peticion.method === "POST" && camino.length === 1 && camino[0] === "partidas") {
      const cuerpo = (await peticion.json()) as { montaje?: Montaje };
      if (!cuerpo.montaje) return error("Falta el montaje.", 400);

      const codigo = nuevoCodigo();
      const secreto = nuevoSecreto();
      const objeto = entorno.PARTIDAS.get(entorno.PARTIDAS.idFromName(codigo));
      const respuesta = await objeto.fetch(
        new Request(`${url.origin}/partidas/${codigo}/crear`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ montaje: cuerpo.montaje, secreto }),
        }),
      );
      if (!respuesta.ok) return respuesta;
      return json({ ok: true, codigo, secreto });
    }

    // /partidas/:codigo[/acciones|/truncar]
    if (camino[0] === "partidas" && camino.length >= 2) {
      const codigo = (camino[1] ?? "").toUpperCase();
      if (codigo.length !== LARGO_DEL_CODIGO) return error("Ese código no tiene forma de código.", 400);
      const objeto = entorno.PARTIDAS.get(entorno.PARTIDAS.idFromName(codigo));
      return objeto.fetch(peticion);
    }

    return error("Esa dirección no existe.", 404);
  },
};
