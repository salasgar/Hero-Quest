/**
 * El banco de frases del modo relato.
 *
 * Cada situación es una lista de plantillas con huecos (`{clave}`). El que
 * llama rellena los huecos con fragmentos ya resueltos —con su artículo, su
 * mayúscula si toca— porque aquí no se adivina gramática: una plantilla que
 * dijera «{Sujeto} entra» y recibiera «háfir» en minúscula saldría mal, así
 * que la responsabilidad de la mayúscula y la preposición es de quien llama
 * a `rellenar`, no de esta lista.
 *
 * Al menos tres variantes por situación donde tiene sentido —para que no se
 * note la repetición a la tercera sala—; menos donde la situación es rara o
 * puramente estructural (el cambio de turno, por ejemplo).
 */

/** Sustituye cada `{clave}` por su valor. No toca lo que no encuentra hueco. */
export function rellenar(plantilla: string, valores: Record<string, string | number>): string {
  return plantilla.replace(/\{(\w+)\}/g, (m, clave: string) =>
    clave in valores ? String(valores[clave]) : m,
  );
}

/** Hash simple y estable de una cadena, para mezclar el índice con el actor. */
function hashDeTexto(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Elige una variante de forma determinista: la misma partida, el mismo
 * índice y el mismo actor dan siempre la misma frase. Nunca `Math.random()`.
 */
export function variante<T>(opciones: readonly T[], indice: number, actor = ""): T {
  const punto = Math.abs(indice) + hashDeTexto(actor) * 7;
  return opciones[punto % opciones.length]!;
}

export const MOVIMIENTO_CORTO: readonly string[] = [
  "{Sujeto} avanza un par de pasos cortos, con cautela.",
  "{Sujeto} apenas se desplaza, atento a cada sombra.",
  "{Sujeto} da unos pasos breves, sin fiarse del silencio.",
];

export const MOVIMIENTO_NORMAL: readonly string[] = [
  "{Sujeto} recorre el pasillo con paso firme.",
  "{Sujeto} avanza {n} casillas, atento a lo que pueda salir al paso.",
  "{Sujeto} cruza la penumbra sin detenerse.",
];

export const MOVIMIENTO_LARGO: readonly string[] = [
  "{Sujeto} echa a correr y devora {n} casillas de un tirón.",
  "{Sujeto} atraviesa la mazmorra a toda prisa, como si algo lo empujara.",
  "{Sujeto} recorre un largo tramo sin aliento, {n} casillas de una vez.",
];

export const ATAQUE_MATA: readonly string[] = [
  "{Sujeto} descarga un golpe implacable {objeto}: el filo no deja nada en pie.",
  "{Sujeto} arremete {objeto} con toda su furia, y el golpe es el último que recibe.",
  "{Sujeto} encuentra el hueco en la guardia {objeto2} y el combate termina ahí mismo.",
];

export const ATAQUE_HIERE: readonly string[] = [
  "{Sujeto} golpea {objeto} y le arranca un grito de dolor.",
  "{Sujeto} conecta un golpe certero {objeto}, que se tambalea.",
  "{Sujeto} abre una herida {objeto} con un tajo rápido.",
];

export const ATAQUE_FALLA: readonly string[] = [
  "{Sujeto} lanza un golpe {objeto}, pero el acero resbala sin encontrar carne.",
  "{Sujeto} ataca {objeto}, que aparta el golpe en el último instante.",
  "{Sujeto} descarga su arma {objeto} y falla por un palmo.",
];

export const MUERE_HEROE: readonly string[] = [
  "{Sujeto} se desploma sobre las piedras frías, y ya no se levanta.",
  "Las fuerzas abandonan {objeto} de golpe: cae y no vuelve a moverse.",
  "{Sujeto} suelta el arma, cae de rodillas y después no se mueve más.",
];

export const MUERE_MONSTRUO: readonly string[] = [
  "{Sujeto} se desploma entre estertores y queda inmóvil para siempre.",
  "{Sujeto} se derrumba como un saco vacío sobre las losas.",
  "Un último espasmo recorre {objeto}, y después ya no queda nada que temer.",
];

export const PUERTA_ABIERTA: readonly string[] = [
  "La puerta cede con un largo chirrido que retumba por el pasillo.",
  "Con un empujón, la puerta se abre y deja pasar un soplo de aire viciado.",
  "La madera vieja gime y la puerta se abre de par en par.",
];

export const SALA_VACIA: readonly string[] = [
  "{base} No se oye ni un sonido: la sala está vacía.",
  "{base} El silencio lo llena todo; nadie aguarda aquí.",
  "{base} No hay nadie dentro, solo polvo y penumbra.",
];

export const SALA_CON_MONSTRUOS: readonly string[] = [
  // Los tres van con «{quienes}» en aposición, nunca como sujeto de un verbo:
  // la lista puede ser uno o varios nombres, y un verbo en singular
  // («aguarda») se rompe en cuanto la sala tiene más de un monstruo.
  "{base} Y allí, esperando, {quienes}.",
  "{base} No estáis solos: algo aguarda entre las sombras: {quienes}.",
  "{base} Algo se mueve al fondo: {quienes}.",
];

export const TRAMPA_FOSO: readonly string[] = [
  "¡El suelo se abre bajo los pies {objeto2} y cae al vacío!",
  "Sin aviso, las losas ceden y {sujeto} se precipita al foso.",
];

export const TRAMPA_FOSO_ABIERTO: readonly string[] = [
  "{Sujeto} tropieza y cae en el foso que ya estaba abierto.",
  "El foso, abierto de antes, se traga {objeto} de todos modos.",
];

export const TRAMPA_LANZA_ESQUIVA: readonly string[] = [
  "Una lanza sale disparada de la pared, pero {sujeto} la esquiva por un pelo.",
  "El siseo del metal anuncia la lanza; {sujeto} se aparta justo a tiempo.",
];

export const TRAMPA_LANZA_ALCANZA: readonly string[] = [
  "¡Una lanza sale disparada de la pared y se hunde en {sujeto}!",
  "El metal silba en la oscuridad y alcanza {objeto} de lleno.",
];

export const TRAMPA_BLOQUE_ESQUIVA: readonly string[] = [
  "Un bloque de piedra cae del techo, y {sujeto} lo esquiva por un pelo. El paso queda bloqueado.",
  "El techo se desprende con un estruendo; {sujeto} se aparta justo a tiempo, pero el camino queda sellado.",
];

export const TRAMPA_BLOQUE_ALCANZA: readonly string[] = [
  "Un bloque de piedra se desprende del techo y aplasta {objeto}. El paso queda bloqueado.",
  "El estruendo de la piedra al caer llega tarde para {sujeto}, que no logra apartarse. El camino queda sellado.",
];

export const SALTO_LOGRADO: readonly string[] = [
  "{Sujeto} toma carrerilla y salva {que} de un brinco limpio.",
  "Con un salto certero, {sujeto} deja atrás {que} sin despeinarse.",
];

export const SALTO_FALLIDO: readonly string[] = [
  "{Sujeto} salta hacia {que}, pero un pie en falso lo hace tropezar.",
  "El salto sale corto: {sujeto} tropieza al intentar salvar {que}.",
];

export const TRAMPA_DESCUBIERTA: readonly string[] = [
  "Con ojo atento, alguien repara en una trampa oculta en el suelo.",
  "Un detalle fuera de lugar delata una trampa escondida bajo las losas.",
];

export const TRAMPA_DESARMADA: readonly string[] = [
  "Con manos firmes, la trampa queda inutilizada para siempre.",
  "Un par de gestos precisos y el mecanismo de la trampa deja de ser una amenaza.",
];

export const PUERTA_SECRETA: readonly string[] = [
  "Al empujar la pared, una losa gira y deja ver un pasadizo que nadie esperaba.",
  "Un hueco disimulado en la piedra se abre: hay un pasadizo secreto.",
];

export const BUSQUEDA_SIN_TESORO: readonly string[] = [
  "Registráis la sala de arriba abajo. Nada: ni una moneda.",
  "Removéis cada rincón de la sala, pero no hay tesoro que encontrar.",
];

export const BUSQUEDA_SIN_TRAMPAS: readonly string[] = [
  "Ni trampas ni pasadizos: la sala está limpia.",
  "Un examen cuidadoso no revela ningún peligro oculto.",
];

export const TESORO_ORO: readonly string[] = [
  "{Sujeto} rebusca entre el polvo y se guarda {n} monedas de oro.",
  "El brillo del oro llama la atención {objeto2}: {n} monedas van a la bolsa.",
];

export const OBJETO_MISION: readonly string[] = [
  "{Sujeto} lo encuentra por fin: {objeto2}. ¡Es justo lo que habíais venido a buscar!",
  "Entre el polvo y los escombros, {sujeto} da con {objeto2}: la búsqueda ha terminado.",
];

export const OBJETO_GUARDADO: readonly string[] = [
  "{Sujeto} guarda «{nombre}» en la mochila, por si hace falta más tarde.",
  "Sin perder tiempo, {sujeto} se echa «{nombre}» a la mochila.",
];

export const EQUIPO_PUESTO: readonly string[] = [
  "{Sujeto} encuentra {pieza} entre el tesoro y se lo equipa sin dudarlo.",
  "{Sujeto} se hace con {pieza} y se lo pone al momento.",
];

export const EQUIPO_GUARDADO: readonly string[] = [
  "{Sujeto} encuentra {pieza}, pero no es para su clase: se lo guarda en la mochila por si otro lo quiere.",
  "{Sujeto} encuentra {pieza} y, como ya lleva uno igual, lo guarda en la mochila.",
];

export const POCION_PROPIA: readonly string[] = [
  "{Sujeto} se bebe «{nombre}» de un trago.",
  "Sin dudar, {sujeto} destapa «{nombre}» y se la bebe entera.",
];

export const POCION_AJENA: readonly string[] = [
  "{Sujeto} acerca «{nombre}» {objeto} y le ayuda a beber.",
  "Con cuidado, {sujeto} le da de beber «{nombre}» {objeto}.",
];

export const OBJETO_DADO: readonly string[] = [
  "{Sujeto} le tiende «{nombre}» {objeto}{equipado}.",
  "Sin decir palabra, {sujeto} le pasa «{nombre}» {objeto}{equipado}.",
];

export const CARTA_DE_TESORO: readonly string[] = [
  "{Sujeto} registra la sala y encuentra: {nombre}. {texto}",
  "Removiendo entre los escombros, {sujeto} da con {nombre}. {texto}",
];

export const MONSTRUO_ERRANTE: readonly string[] = [
  "¡No estabais solos! {Sujeto} aparece de improviso a vuestro lado.",
  "Un ruido a la espalda y, de repente, {sujeto} está entre vosotros.",
];

export const HECHIZO_LANZADO: readonly string[] = [
  "{Sujeto} traza los gestos del conjuro: {hechizo}{contra}.",
  "Un murmullo arcano escapa de labios {objeto2}, y {hechizo} cobra forma{contra}.",
];

export const HECHIZO_DANO: readonly string[] = [
  "{Hechizo} estalla contra {sujeto} y le arranca un grito de dolor.",
  "{Hechizo} alcanza {objeto} de lleno, y el dolor es evidente.",
];

export const HECHIZO_SIN_DANO: readonly string[] = [
  "{Hechizo} estalla contra {sujeto}, pero no le hace ni un rasguño.",
  "{Hechizo} se disuelve en el aire junto {objeto}, sin efecto alguno.",
];

export const HECHIZO_NO_MUERTO: readonly string[] = [
  "Los no muertos no duermen ni sueñan: {hechizo} se pierde sobre {sujeto} sin efecto.",
  "{Objeto} no tiene sueño que robar: es de los que no duermen. {Hechizo} se pierde en el vacío.",
];

export const HECHIZO_MENTE_SUPERIOR: readonly string[] = [
  "{Sujeto} resiste: su mente es demasiado fuerte para el hechizo.",
  "El conjuro choca contra una voluntad de hierro: {sujeto} no se inmuta.",
];

export const HECHIZO_YA_SANO: readonly string[] = [
  "{Sujeto} no tiene ni un rasguño que curar: {hechizo} se gasta en balde.",
  "El hechizo busca una herida que curar en {sujeto}, pero no encuentra ninguna.",
];

export const HECHIZO_SIN_OBJETIVO: readonly string[] = [
  "{Hechizo} recorre la sala vacía y no encuentra a nadie a quien afectar.",
  "El conjuro se dispersa en la oscuridad: no hay nadie ahí para {hechizo}.",
];

export const CURACION: readonly string[] = [
  "El calor recorre {objeto}, que recupera {n} {puntos} de cuerpo.",
  "{Sujeto} respira hondo y recupera {n} {puntos} de cuerpo.",
];

export const MOVIMIENTO_EXTRA: readonly string[] = [
  "Un viento repentino empuja {objeto}, que gana {n} casillas de más.",
  "Algo invisible tira de {objeto} hacia delante: {n} casillas de propina.",
];

// Los dos bancos que siguen van siempre con «{objeto}»/«{deQuien}», nunca con
// «{Sujeto}»: `efectoDeHechizo` puede alcanzar a más de una figura (`objetivos`
// es una lista) y un verbo en singular pegado a `{Sujeto}` da «Háfir cabecea»
// cuando en realidad cabecean dos. Con la figura siempre de objeto, la frase
// no necesita saber cuántas hay.
export const EFECTO_DORMIR: readonly string[] = [
  "Un sopor irresistible vence {objeto}: los ojos se cierran solos.",
  "Los párpados {deQuien} pesan de golpe, y el sueño se los cierra.",
];

export const EFECTO_PERDER_TURNO: readonly string[] = [
  "Un torbellino envuelve {objeto}, que se queda sin su próximo turno.",
  "Un remolino de viento atrapa {objeto} y le arrebata el turno siguiente.",
];

export const EFECTO_BONUS_ATAQUE: readonly string[] = [
  "Una fuerza nueva recorre {objeto}: golpeará más fuerte en su próximo ataque.",
  "El conjuro recorre los brazos {deQuien}: el próximo golpe será demoledor.",
];

export const EFECTO_BONUS_DEFENSA: readonly string[] = [
  "La piel {deQuien} se vuelve dura como la piedra: aguantará mejor el próximo golpe.",
  "Un manto invisible protege {objeto}, listo para el siguiente ataque.",
];

export const EFECTO_ATRAVESAR_MUROS: readonly string[] = [
  "La roca se vuelve tan fina como el humo ante {sujeto}: se cruzará sin esfuerzo en el próximo paso.",
  "Un cosquilleo extraño recorre {objeto}: la piedra ya no será un obstáculo.",
];

export const EFECTO_ATRAVESAR_FIGURAS: readonly string[] = [
  "Una niebla vuelve casi transparente {objeto}, que pasará entre los monstruos sin que lo vean.",
  "Una bruma cubre {objeto}, que se deslizará entre los enemigos sin ser tocado.",
];

export const EFECTO_MOVIMIENTO_EXTRA: readonly string[] = [
  // «De espaldas» pide «a», no «de» («de espaldas a la pared»): con {deQuien}
  // salía «de espaldas de Háfir».
  "El viento se pone de espaldas {objeto}: tirará cuatro dados de movimiento.",
  "Una racha invisible empuja {objeto}, que correrá con cuatro dados en su próximo turno.",
];

export const MONSTRUO_SIN_ACTUAR: readonly string[] = [];

export const ZARGON_SIN_MONSTRUOS_ESPERA: readonly string[] = [
  "Zargon aguarda entre las sombras: todavía no habéis encontrado a nadie.",
  "En algún rincón, Zargon espera a que descubráis a los suyos.",
];

export const ZARGON_SIN_MONSTRUOS_TODOS: readonly string[] = [
  "Zargon ya no tiene a quién mover: todos sus monstruos han actuado.",
  "Por esta ronda, Zargon se queda sin nadie más que mandar.",
];

export const CAMBIO_DE_TURNO_ZARGON: readonly string[] = [
  "— El aliento frío de Zargon recorre la mazmorra —",
  "— Zargon toma el control de las sombras —",
];

export const FIN_VICTORIA: readonly string[] = [
  "¡Victoria! {motivo}",
  "¡Lo habéis conseguido! {motivo}",
];

export const FIN_DERROTA: readonly string[] = [
  "Derrota. {motivo}",
  "La mazmorra se cobra su precio. {motivo}",
];
