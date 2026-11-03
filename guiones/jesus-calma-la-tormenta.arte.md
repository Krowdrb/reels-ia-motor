# Dirección de arte — jesus-calma-la-tormenta

Marcos 4:35–41 · Biblia: historias · tipo «Vida de Jesús» (candidato en prueba) · experimento de duración 35–45 s.

## Decisiones generales
- **Estilo:** `personajes2d` con beats de motion intercalados (referencia, palabra de impacto, icono). Nada de 3d (todas las fichas llevan `"style": "2d"`).
- **Fondo:** `backdrop: "night"` en las 4 escenas del relato (cielo #0E1430→#2A2350, luna y estrellas, suelo #141A33). Es el único fondo del motor que sirve para el mar de noche; la tormenta la ponen los iconos y la cámara (`punch`), no el fondo. La luna del fondo ayuda a leer la «grande bonanza» del final. CTA en `bg: "terra"` sin backdrop.
- **Paleta:** marca (#0F0F12, terracota #D97757, dorado #F5C26B). Rojo solo para la tormenta y el miedo; verde solo para «bonanza»; dorado para las palabras de Jesús.
- **Voz:** narrador en off `em_santa`, `speed` 1.2. **Todos** los personajes con `talk: false` (la voz es del narrador también cuando cita a Jesús o a los discípulos; si la boca se moviera, parecería que el personaje dice toda la narración). Música desde el segundo 0 (automática).
- **Duración objetivo:** 38–44 s (≈ 95–110 palabras en total). Si pasa de 45 s, recortar la escena 2, nunca el gancho.
- **Respeto:** Jesús sin halo, sin caricatura, expresiones serenas (nunca `surprised`, `worried` ni `wink` para Jesús). Dios Padre no aparece dibujado. Nada de personas reales ni marcas.

## Fichas de personajes (nuevas, canónicas y reutilizables)
| id | Silueta | Colores | Uso |
|---|---|---|---|
| `jesus` | `hair: long` + `beard: short`, `outfit: robe` (paneles del manto) , `age: adult`, `accessory: none` | túnica clara #EDE4D3, manto terracota oscuro #B8613F, pelo y barba #3A2618, piel #A9744F | Ficha canónica para TODOS los videos de Jesús |
| `pedro` | `hair: curly` + `beard: long`, `outfit: tunic`, `age: adult` | túnica tierra #8B5E3C, cinto #5A3A26, piel #9C6844 | Ficha canónica de Pedro. **En este video es solo «un discípulo»**: sin globo ni frase propia |
| `juan` | `hair: short`, sin barba, `outfit: tunic`, `age: young` | túnica salvia #6E7F5A, cinto dorado #F5C26B, piel #B98258 | Ficha canónica de Juan (joven). Aquí, solo «discípulo» |

Las tres se distinguen por silueta (pelo largo + manto / rizos + barba larga / joven sin barba) y por color (claro / tierra / verde). Sobre el fondo `night` la túnica clara de Jesús es lo más luminoso de la pantalla: el ojo va a Él. `nico` y `vale` no se usan.

## Escena por escena

### 1 · Gancho (0–5 s) · `backdrop: night`
- **VO (idea):** arranca DENTRO de la escena, con el giro en la primera frase: «Las olas ya metían agua en la barca… y Jesús *dormía*.» (≤ 2 oraciones, sin presentación).
- **Beat 1 (start, fotograma 0 = portada):** `icon` `sailboat`, `color: "terra"`, `float: "Zz"`, `pulse: true`, título `JESÚS DORMÍA\nEN LA *TORMENTA*`, `sfx: "impact"`. Es el texto grande de 3–5 palabras que pide el primer fotograma.
- **Beat 2 (at «olas»/«agua»):** `icon` `cloud-lightning`, `color: "red"`, título `!TORMENTA!`… y en «dormía» volver al barco: `icon` `sailboat` con `float: "Zz"` y título `Y ÉL *DORMÍA*`.
- **punch:** «dormía».
- Sin personaje en esta escena: el motor no tiene ojos cerrados ni pose acostada, así que el sueño se cuenta con el icono + «Zz» (no dibujar a Jesús con los ojos abiertos mientras se dice que duerme).

### 2 · La tempestad y el despertar (5–16 s) · `backdrop: night`
- **VO (idea):** «Al caer la tarde cruzaban el mar. Se levantó una gran *tempestad*, y Él seguía en la popa, dormido sobre un cabezal. Los discípulos lo despertaron: Maestro, ¿no te importa que *perezcamos*?»
- **badge:** `{"text": "MARCOS 4:35–41", "at": "tarde"}` (la referencia en pantalla).
- **Beat 1 (start):** `icon` `cloud-rain-wind`, `color: "red"`, título `UNA GRAN\n!TEMPESTAD!`, `sfx: "whoosh"`.
- **Beat 2 (at «popa»):** `icon` `moon-star`, `color: "gold"`, `float: "Zz"`, título `DORMIDO EN\nLA *POPA*`.
- **Beat 3 (at «discípulos»):** `character` `pedro`, `place: left`, `pose: shrug`, `expr: worried`, `talk: false`, `size: 0.9`, **sin `bubble`**.
- **Beat 4 (at «despertaron», `zone: "stay"`):** `character` `juan`, `place: right`, `pose: pray`, `expr: worried`, `talk: false`, `size: 0.85`, título `*¿NO TE IMPORTA*\nQUE PEREZCAMOS?` (la frase es del grupo: va en el título, no en un globo de un solo personaje).
- **punch:** «tempestad», «perezcamos».

### 3 · «Calla, enmudece» (16–26 s) · `backdrop: night`
- **VO (idea):** «Jesús se levantó, reprendió al viento y dijo al mar: *Calla, enmudece*. Y el viento cesó, y se hizo grande *bonanza*.»
- **Beat 1 (start):** `character` `jesus`, `place: center`, `pose: idle`, `expr: neutral`, `talk: false`, `size: 1.1`, título `REPRENDIÓ\nAL *VIENTO*`; `poses`: at «reprendió» → `point` + `determined`.
- **Beat 2 (at «calla»):** `character` `jesus` de nuevo (mismo sitio y tamaño), `pose: open`, `expr: neutral`, `talk: false`, título `*CALLA,\nENMUDECE*`, `sfx: "impact"` (un beat nuevo reemplaza al anterior; así cambia el título sin quitar a Jesús de pantalla).
- **Beat 3 (at «cesó»):** `icon` `waves-horizontal`, `color: "green"`, título `GRANDE\n^BONANZA^`, `sfx: "chime"`.
- **punch:** «calla».
- Expresión de Jesús: autoridad serena (`determined` solo al reprender), nunca enojo ni sorpresa.

### 4 · «¿Aún no tenéis fe?» y «¿Quién es este?» (26–37 s) · `backdrop: night`
- **VO (idea):** «Y les dijo: ¿Por qué tenéis *miedo*? ¿Aún no tenéis fe? Y ellos, llenos de temor, se decían: ¿Quién es este, que aun el viento y el mar le *obedecen*?»
- **Beat 1 (start):** `character` `jesus`, `place: left`, `pose: explain`, `expr: happy` (cálido, no burlón), `talk: false`, `size: 0.95`, título `¿POR QUÉ\nTENÉIS *MIEDO*?`; `poses`: at «fe» → `bubble: "¿Aún no tenéis fe?"` (es cita literal de Jesús: el globo sí puede ser suyo).
- **Beat 2 (at «decían»):** `character` `pedro`, `place: left`, `pose: think`, `expr: surprised`, `talk: false`, `size: 0.9`.
- **Beat 3 (at «quién», `zone: "stay"`):** `character` `juan`, `place: right`, `pose: idle`, `expr: surprised`, `talk: false`, `size: 0.85`, título `¿QUIÉN\nES *ESTE*?`.
- **punch:** «obedecen».

### 5 · CTA (37–43 s) · `bg: "terra"`
- **VO (idea):** pregunta de una palabra sobre la vida del espectador: «¿Estás pasando por una tormenta? Responde *SÍ*, y etiqueta a alguien que necesita esta calma.»
- **Beat:** `cta`, `heading: "¿ESTÁS EN UNA\n_TORMENTA?_"`, `keyword: "SÍ"`, `keywordAt: "responde"`, `saveAt: "etiqueta"`, `comment: "RESPONDE _«SÍ»_"`. Sin palabra clave para «recibir algo».

## Portada / primer fotograma
- El fotograma 0 es el beat 1 de la escena 1: barca terracota con «Zz» dorado sobre el cielo nocturno y el título **«JESÚS DORMÍA EN LA TORMENTA»** (4 palabras grandes).
- `thumbnail`: `{"big": "MC 4", "lines": ["JESÚS DORMÍA", "*EN LA*", "TORMENTA"], "icon": "cloud-lightning"}`.
- Título de YouTube (gancho + relato + #shorts): «Todos tenían miedo… y Él dormía 🌊 | Jesús calma la tormenta #shorts».

## Iconos verificados en assets/lucide/icons
`sailboat`, `cloud-lightning`, `cloud-rain-wind`, `moon-star`, `waves-horizontal`, `wind`, `ship`, `anchor`, `bed`, `sun`, `hand-heart`, `book-open`. **`waves` NO existe** (se dibujaría «?»): usar `waves-horizontal`.

## Límites del motor detectados (no inventar)
- Fondos solo: desert · night · field · village · room · city. No hay mar ni barca dibujada: la barca es el icono `sailboat`.
- No hay expresión de ojos cerrados ni pose acostada: «Jesús dormía» se muestra con icono + `float: "Zz"`. Una expresión `asleep` y un fondo `sea`/`storm` serían mejoras útiles para futuros relatos.
- El globo (`bubble`) se ancla a un personaje: no ponerle a Pedro ni a Juan frases que Marcos atribuye al grupo.
