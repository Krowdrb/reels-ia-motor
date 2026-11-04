# Dirección de arte — dinero-en-la-biblia

Mateo 20:2 · Mateo 26:15 (+ Éxodo 21:32, Zacarías 11:12) · Marcos 12:41–44 · **Biblia: datos** (primer video del subnicho) · experimento de duración 35–45 s.

## Decisiones generales
- **Estilo:** `motion` (por defecto en datos) con **una figura breve**: la viuda, como beat `character` en 2 escenas. Está permitido: GUION.md documenta el beat `character` como un beat más y `engine/build.py` lo acepta en cualquier estilo (jesus-calma-la-tormenta ya mezcla motion + personajes). Nada de `cinematico` (no lleva beats y aquí necesitamos cifras en pantalla). Sin 3d.
- **Fondo:** marca oscura #0F0F12 en todas las escenas, **sin `backdrop`** (la viuda va sobre el fondo de la marca, para que el video se lea como «datos» y no como relato). `bg: "terra"` solo en el CTA final.
- **Paleta:** dorado #F5C26B = dinero y palabras clave (denario, plata, «más que todos»); terracota #D97757 = cifras de apoyo (`~30~`); rojo solo para «esclavo»; verde no se usa.
- **Voz:** `ef_dora`, `speed` 1.2. La viuda siempre con `talk: false` (narra Dora, no ella).
- **Duración objetivo:** 38–44 s ≈ **100–110 palabras**. Si pasa de 45 s, recortar la escena 2 (denario), nunca el gancho ni la viuda.
- **Ritmo:** un cambio visual cada 2–3 s (17 beats en ~42 s). Referencia bíblica siempre en pantalla con `badge` o `sub`.
- **Fidelidad:** sin dólares, pesos ni conversiones modernas inventadas. La única comparación con hoy es «el sueldo de un día de trabajo». No decir cuántos denarios eran las 30 piezas ni cuántos minutos de trabajo era un cuadrante (no está en el texto). «Dos blancas = un cuadrante» es literal de Marcos 12:42 (RVR1960).

## Ficha nueva: `viuda` (en `"characters"` del guion o en `personajes/viuda.json`)
```json
{"name": "Viuda", "style": "2d", "skin": "#A87650", "hair": "veil", "veilColor": "#6B5B4E", "hairColor": "#9A948C",
 "outfit": "dress", "outfitColor": "#4A3F38", "accent": "#F5C26B", "accessory": "none", "eyes": "#2A1A10", "age": "old", "blinkSeed": 2.1}
```
Silueta serena: manto de época gris-tierra (pobreza, luto), vestido oscuro, único toque dorado en el cinto (rima con las monedas). Expresiones solo `neutral` o `happy`; poses `hold` y `pray`. Sin caricatura, sin lágrimas, sin globo de diálogo.

## Escena por escena (≈ tiempos)

### 1 · Gancho (0–4 s) · PORTADA
- **VO (idea, ≤ 2 oraciones):** «Por *treinta* monedas de plata entregaron a *Jesús*. ¿Sabes cuánto valía eso de verdad?»
- **Beat 1 (start = fotograma 0):** `icon` `hand-coins`, `color: "gold"`, `pulse: true` (NO `drop`: en el fotograma 0 el icono aún estaría fuera de cuadro), título `ENTREGADO POR\n*30 MONEDAS*`, `titleSize` ~150, `sfx: "impact"`.
- **Beat 2 (at «sabes»):** `text` `¿CUÁNTO\n*VALÍA ESO?*`, `size` 150, `sfx: "whoosh"`.
- **punch:** «treinta».

### 2 · La moneda base: el denario (4–12 s)
- **badge:** `{"text": "MATEO 20:2", "at": "obreros"}`
- **VO (idea):** «Primero, la moneda base: el *denario*. En la parábola de los obreros, era el pago por *un día* de trabajo.»
- **Beat 1 (start):** `icon` `coins`, `color: "gold"`, `drop: true`, título `1 *DENARIO*`, `titleSize` 170 (aquí sí el «cha-ching»).
- **Beat 2 (at «obreros»):** `cards` con `sunrise` «AMANECER» (at «obreros»), `grape` «LA VIÑA» (at «parábola»… usar el orden real de la VO), `sun` «TODO EL DÍA» (at «día»).
- **Beat 3 (at «trabajo», `zone: "low"`):** `text` `1 DENARIO =\n*1 DÍA DE TRABAJO*`, `size` 112. Es la «traducción a hoy» del video.
- **punch:** «día».

### 3 · 30 piezas de plata = el precio de un esclavo (12–21 s)
- **badge:** `{"text": "MATEO 26:15", "at": "judas"}`
- **VO (idea):** «A Judas le pagaron *treinta* piezas de plata. Y la ley de Moisés fijaba ese mismo precio por un *esclavo*.»
- **Beat 1 (start):** `clone` `coins`, `count: 30`, título `~30~ PIEZAS\nDE *PLATA*`, `sfx: "chaching"`.
- **Beat 2 (at «ley»):** `icon` `scroll-text`, `color: "terra"`, título `LA LEY DE\n*MOISÉS*`, `sub: "Éxodo 21:32"`.
- **Beat 3 (at «esclavo»):** `icon` `scale`, `color: "red"`, `pulse: true`, título `EL PRECIO DE\nUN !ESCLAVO!`, `sub: "Zacarías 11:12 lo anunció"`, `sfx: "impact"`.
- **punch:** «esclavo».

### 4 · La ofrenda de la viuda (21–30 s)
- **badge:** `{"text": "MARCOS 12:41–44", "at": "viuda"}`
- **VO (idea):** «Pero la ofrenda más grande fue la más *pequeña*. Una viuda pobre echó en el templo *dos blancas*: un cuadrante.»
- **Beat 1 (start):** `icon` `landmark` (el templo / el arca de las ofrendas), `color: "gold"`, título `LA OFRENDA\nMÁS *PEQUEÑA*`.
- **Beat 2 (at «viuda»):** `character` `viuda`, `place: "center"`, `pose: "hold"`, `prop: "coins"`, `expr: "neutral"`, `talk: false`, `size: 0.95`, título `UNA VIUDA\n*POBRE*`.
- **Beat 3 (at «dos»):** `counter` `icon: "coins"`, `from: {"n": 2, "unit": "BLANCAS"}`, `to: {"n": 1, "unit": "CUADRANTE"}`, `toAt: "cuadrante"`, `sub: "Marcos 12:42"`.
- **punch:** «pequeña».

### 5 · Clímax: dio más que todos (30–37 s)
- **VO (idea):** «Y Jesús dijo que ella echó *más que todos*, porque dio *todo* lo que tenía para vivir.»
- **Beat 1 (start):** `character` `viuda`, `pose: "pray"`, `expr: "happy"`, `talk: false`, título `LO DIJO\n*JESÚS*` (cambia en «más» al beat 2).
- **Beat 2 (at «más»):** `big` `MÁS QUE\nTODOS`, `color: "gold"`, `size` 240, `sparkles: true`, `strong: true`, `sfx: "sparkle"`.
- **Beat 3 (at «todo»):** `icon` `hand-heart`, `color: "gold"`, `pulse: true`, título `DIO *TODO*\nLO QUE TENÍA`, `sub: "Marcos 12:43–44"`.
- **punch:** «todos».

### 6 · CTA (37–42 s) · `bg: "terra"`
- **VO (idea):** «Dios no mide la cantidad: mira el *corazón*. ¿Conoces a alguien que da aunque tenga poco? *Etiquétalo*.»
- **Beat:** `cta`, heading `¿CONOCES A\n_ALGUIEN ASÍ?_`, `keyword: "ETIQUÉTALO"`, `keywordAt: "etiquétalo"`. Sin palabra clave para «recibir algo» (aprendizajes: Evitar).

## Iconos (todos verificados en assets/lucide/icons/)
hand-coins · coins · sunrise · grape · sun · scroll-text · scale · landmark · hand-heart (alternativas existentes: heart, banknote, wheat, hammer, book-open, sparkles, gem, wallet).

## Portada
- **Fotograma 0 (portada de TikTok):** beat 1 de la escena 1 — `hand-coins` dorado sobre #0F0F12 con `ENTREGADO POR *30 MONEDAS*` (4 palabras, letras grandes). Tras el render, comprobar con `ffmpeg -ss 0 -frames:v 1` que el título se lee completo en el fotograma 0; si entra animado y sale vacío, poner el mismo texto a tamaño completo desde el inicio.
- **Portada de YouTube/FB (`thumbnail`):** `{"big": "30", "lines": ["MONEDAS DE", "*PLATA*", "¿CUÁNTO VALÍAN?"], "icon": "coins"}`.
- **Momento más llamativo del video:** escena 3, la cuadrícula de 30 monedas → «EL PRECIO DE UN ESCLAVO» (si `cover.py` elige otro, la segunda opción es «MÁS QUE TODOS» con destellos, escena 5).
