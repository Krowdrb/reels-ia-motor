# Formato del guion (guion.json)

El motor convierte un `guion.json` en un Reel vertical 1080x1920 de 45–75 s: voz en off sintética en español latino, motion graphics con estilo fijo (fondo #0F0F12, terracota #D97757, dorado #F5C26B, Inter Tight, iconos Lucide), subtítulos palabra por palabra, música y efectos.

**Quien escribe el guion solo escribe este JSON.** El estilo, el ritmo, la cámara, las transiciones y el sonido son automáticos.

## Estructura

```json
{
  "slug": "tema-en-kebab-case",
  "title": "Título para YouTube Shorts",
  "voice": "ef_dora",            // ef_dora (mujer) · em_alex (hombre) · em_santa (hombre grave)
  "speed": 1.2,
  "pronunciation": {"IA": "i a", "Claude": "Clod", "PDF": "pe de efe", "WhatsApp": "guatsap"},
  "scenes": [ ... 5 a 8 escenas ... ],
  "thumbnail": {"big": "3", "lines": ["FORMAS DE", "*GANAR CON*", "CLAUDE"], "icon": "badge-dollar-sign"},
  "caption": "Descripción para la publicación (con emojis y CTA)",
  "hashtags": ["sin", "numeral"]
}
```

`pronunciation` cambia cómo **suena** una palabra; los subtítulos siguen mostrando la original. Úsalo para siglas, marcas en inglés y anglicismos.

## Escena

```json
{
  "vo": "Texto de la voz. Varias oraciones. Marca *palabras clave* con asteriscos.",
  "label": {"num": "01", "text": "VENDE SERVICIOS"},   // opcional: tarjeta fija arriba (listas numeradas)
  "badge": {"text": "CASI NADIE LO HACE", "at": "nadie"}, // opcional: etiqueta dorada que parpadea
  "bg": "dark",                                        // "terra" = fondo terracota (úsalo solo en el CTA final)
  "punch": ["trabajo"],                                // palabras con zoom rápido de cámara
  "hold": 0,                                           // segundos extra opcionales al final de la escena
  "beats": [ ... ]
}
```

- Duración: cada escena dura lo que dure su voz, redondeado al beat. 70 s ≈ 150–170 palabras en total.
- Las `*palabras*` marcadas en `vo` salen en dorado y con un pequeño "pop" en los subtítulos. Marca 1 o 2 por oración.
- La 1.ª escena es el **gancho** (≤ 2 oraciones). La última es el **CTA** (`bg: "terra"`, beat `cta`).

## Beats (lo que se ve)

Cada beat aparece cuando la voz dice la palabra de `"at"`. El primero de cada escena empieza en `"start"` (puedes omitir `at`).
Un beat nuevo **reemplaza** al anterior, salvo si lleva `"zone": "low"`: entonces aparece abajo y empuja el anterior hacia arriba.

**Cómo escribir `at`:** pon una palabra de la voz de **esa escena**, tal como está escrita (sin asteriscos). Basta con el comienzo de la palabra. Se busca **después** del beat anterior.
- `"horas"` → la primera "horas" después del beat anterior
- `"paso#2"` → la segunda coincidencia
- `"pagan-0.15"` → 0,15 s antes · `"vende+0.3"` → 0,3 s después
- Si una palabra no existe, el motor se detiene y muestra la lista de palabras de la escena.

**Marcas de color en títulos:** `*dorado*` · `!rojo!` · `~terracota~` · `^verde^` · `_oscuro_` (para fondo terracota) · `\n` = salto de línea.
Títulos en MAYÚSCULAS, 2–3 líneas de máximo 16 caracteres cada una. Si un texto es largo, el motor lo reduce para que quepa.

| type | Para qué | Campos |
|---|---|---|
| `search` | Barra de búsqueda que se escribe sola | `text`, opcional `title`, opcional `cross` |
| `icon` | Icono grande en círculo + título | `icon`, `title`, opcional `sub`, `color` (terra·gold·green·red), `float` (p. ej. "?" encima), `drop: true` (cae y rebota + "cha-ching"), `pulse: true`, `cross` |
| `big` | Una palabra o frase gigante | `text`, `color`, `size` (220–300), `sparkles: true`, `strong: true` (golpe fuerte) |
| `text` | Solo título (+ subtexto que se puede tachar) | `title`, `size`, `sub`, `strikeAt`, `zone: "low"` |
| `counter` | Odómetro "5 DÍAS → 3 HORAS" con reloj | `from: {n, unit}`, `to: {n, unit}`, `toAt`, `strikeAt`, `sub`, `icon` (por defecto un reloj animado) |
| `cards` | 2–4 tarjetas con icono, en cascada | `items: [{icon, label, at}]` (se resaltan en `at`), opcional `title` |
| `chat` | Ventana de chat que escribe una respuesta | `prompt`, `answer` (usa \n), `underlineAt`, `checkAt`, opcional `header` |
| `orbit` | Iconos girando alrededor de un texto | `center`, `items: [{icon, label, at}]` (3–6) |
| `chips` | Icono + 2–6 píldoras de texto | `icon`, `items: [{text, at}]` |
| `clone` | Un icono se multiplica en una cuadrícula ×N | `icon`, `count`, `title` (usa `->` para una flecha animada) |
| `pills` | Tiendas que se encienden + burbujas de solución | `bases: [{icon, at}]` (2–3), `items: [{icon, label, at, from}]` (hasta 6; `from` = índice de la tienda) |
| `phone` | Celular con una web simple haciendo scroll | `site: {kicker, title, subtitle, button, items: [[nombre, precio]], cta}` |
| `steps` | Barra de progreso con 2–3 pasos | `title`, opcional `icon` arriba, `items: [{icon, label, at}]`, `doneAt` (todo en verde) |
| `cta` | Burbuja de comentario + flecha + guardar | `heading`, `keyword`, `keywordAt`, `saveAt`, opcional `comment` |

`cross: {"at": "palabra", "title": "!NO! LA USES\nCOMO BUSCADOR"}` tacha el icono o la barra con una X roja, sacude la pantalla y cambia el título.

Campo opcional en cualquier beat: `"sfx"` ∈ impact · pop · whoosh · chaching · chime · sparkle · ding · glitch.

**Iconos:** solo nombres actuales de Lucide (lucide.dev/icons), por ejemplo `circle-x`, `circle-check`, `triangle-alert`, `badge-dollar-sign`, `bot`, `clock`, `mail`, `globe`, `wallet`, `target`, `rocket`, `trending-up`, `users`, `camera`, `shopping-cart`, `graduation-cap`, `briefcase`, `lightbulb`, `zap`, `heart`, `star`, `calendar`, `chart-line`, `piggy-bank`, `hand-coins`, `brain`, `sparkles`, `message-circle`, `smartphone`, `video`, `image`, `book-open`, `pen-line`, `search`.
Un nombre que no existe se dibuja como un signo de pregunta.

## Personajes y fondos ilustrados

### Beat `character`
Muestra un personaje que mueve la boca con la voz, parpadea y respira. Cambia de pose y de expresión en las palabras clave.
```json
{"type": "character", "character": "nico", "pose": "wave", "expr": "happy", "place": "center",
 "title": "*3 TRUCOS* DE IA", "bubble": "¡Hola!", "prop": "smartphone", "talk": true, "size": 1.15, "zone": "stay",
 "poses": [{"at": "tres", "pose": "explain", "expr": "surprised", "bubble": "Nadie los cuenta"}]}
```
- `character`: id de una ficha en `personajes/<id>.json` o en `"characters"` del propio guion.
- `pose`: idle · wave · point · think · celebrate · explain · shrug · pray · open (brazos abiertos) · hold.
- `expr`: neutral · happy · surprised · worried · sad · wink · determined.
- `place`: center · left · right. A la derecha, el personaje mira hacia el centro.
- `title`: texto arriba. `bubble`: globo de diálogo, de 2 a 5 palabras.
- `prop`: icono de Lucide que el personaje sostiene en la mano.
- `talk: false`: la boca no se mueve. Úsalo cuando el personaje no es quien narra.
- `poses[]`: cambios de pose, expresión o globo cuando se dice la palabra de `at`.
- `"zone": "stay"`: el beat se suma al anterior sin reemplazarlo. Sirve para tener dos personajes en pantalla, uno a la izquierda y otro a la derecha.

### Fondo ilustrado de la escena
En la escena (no en el beat) puedes poner `"backdrop"` con uno de estos valores: desert · night · field · village · room · city.
Sin `backdrop`, la escena usa el fondo oscuro de la marca. Con fondo ilustrado, los títulos llevan contorno oscuro de forma automática.

### Ficha de personaje (`personajes/<id>.json`)
```json
{"name": "Nico", "style": "2d", "skin": "#C98B5E", "hair": "short", "hairColor": "#2B1B14", "beard": "none",
 "outfit": "hoodie", "outfitColor": "#D97757", "accent": "#F5C26B", "accessory": "headset", "eyes": "#2A1A10", "age": "young"}
```
- `hair`: short · long · bun · curly · cap · bald · veil (manto de época; usa `veilColor`) · crown.
- `beard`: none · short · long (usa `beardColor`).
- `outfit`: hoodie · shirt · blazer · robe · tunic · dress.
- `accessory`: none · glasses · headset · staff (bastón) · halo.
- `age`: young · adult · old.
- `style`: `2d` (por defecto, el recomendado) o `3d` (experimental: muñeco de juguete en 3D, más lento de renderizar).
- `blinkSeed`: número opcional para que dos personajes no parpadeen al mismo tiempo.

Reutiliza siempre las mismas fichas para los personajes recurrentes, para que se reconozcan entre videos. Crea fichas nuevas solo para personajes nuevos.

## Antes de escribir
Lee `aprendizajes.md` y el archivo más reciente de `investigacion/`. Aplica lo de "Hacer" y "Evitar" y usa un gancho del estilo de los que funcionaron. Si hay un experimento en curso, respétalo.

## Reglas de ritmo
- Debe cambiar algo en pantalla cada 2–3 s: usa los `at` de los ítems (cards, orbit, chips, pills, steps) para que las cosas aparezcan cuando se mencionan.
- Cada escena de 8–15 s debería tener 2–4 beats.
- Pon `punch` en la palabra más fuerte de cada escena (máximo 2 por escena).
- No uses emojis en títulos ni en `vo` (sí en `caption`).

El ejemplo completo está en `ejemplos/ganar-con-claude.json`.
