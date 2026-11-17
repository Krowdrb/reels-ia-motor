# Dos fuegos — Tratamiento

**Estilo:** Paper-cut Lightbox (`styles/paper-lantern`), marca `clawd-papel`. **Formato:** vertical 1080×1920, 30 fps, unos 47 s (objetivo 45–48 s, tope 50 s), −14 LUFS.
**Idioma:** español latino, voz Kokoro `ef_dora`, `lang: es-419`, velocidad 1.0, **limpia, sin `robot_voice.py` ni ningún efecto** (decisión del dueño 2026-11-13). Subtítulos quemados y `.srt`.
**Fuente:**
- Judas: el trato por treinta piezas de plata (Mateo 26:14–16); el beso en el huerto (26:47–50); arrepentido, devuelve las monedas, las arroja en el templo y sale (27:3–5).
- Pedro: el fuego en medio del patio del sumo sacerdote (Lucas 22:55; Juan 18:18, «brasas»); la criada, «Tú también estabas con Jesús», tres negaciones y el gallo (Mateo 26:69–75); «vuelto el Señor, miró a Pedro… y Pedro, saliendo fuera, lloró amargamente» (Lucas 22:61–62).
- La orilla: al amanecer, junto al mar de Tiberias, «vieron brasas puestas, y un pez encima, y pan» (Juan 21:4, 9); tres veces «¿Me amas?» y tres veces «Apacienta mis ovejas / corderos» (21:15–17).

**Render:** CPU (SwiftShader, `SSAA=1`, 2 núcleos) si no hay GPU. Máximo 9 capas por plano, sin lluvia ni partículas (las chispas del fuego son 3–4 recortes emisivos fijos que parpadean, no un sistema de partículas), **un solo `burst()`** en toda la película (S10, el sol), `maxCoc` ≤ 8, bloom ≤ .45.

## 1. Tres estructuras posibles

1. **Cronológica, de la cena a la orilla:** el trato de las monedas, la cena, el huerto, el patio, el templo, la orilla. Completa, pero tarda 10 s en llegar al primer fallo, Clawd tendría que viajar de un lugar a otro y el gancho «la misma noche» se diluye.
2. **A vs B en dos cajas:** dos cajas de luz una junto a otra (la de Pedro a la izquierda, la de Judas a la derecha), con la misma luna llena encima de las dos; los planos alternan entre ellas y al final una se apaga y la otra se enciende en oro. Es la estructura que funcionó en la investigación (3,05M en 23 s), pero pone a los dos al mismo nivel durante toda la película, obliga a mostrar a Judas tanto como a Pedro (justo lo que hay que evitar) y Clawd no puede estar dentro de las dos cajas a la vez.
3. **Dos fuegos (elegida):** Clawd está sentado **junto al fuego del patio del sumo sacerdote** desde el primer cuadro, con Pedro calentándose al otro lado. El A vs B vive en la voz y en la rima de los planos, no en una pantalla partida: los dos «salen» (Pedro sale a llorar, Judas sale del templo) y los dos amanecen, uno **gris** (la mañana del templo, con las monedas de plata en el suelo) y otro **dorado** (la orilla del lago). La luna llena de la Pascua une el patio y el huerto. La película abre en un fuego donde Pedro niega y termina en otro fuego, unas brasas en la orilla, donde Pedro responde tres veces. Juan usa la misma palabra para los dos fuegos (*brasas*, 18:18 y 21:9): la película entera es esa rima.

**Por qué la 3:** los dos nombres y el giro se entienden en 3 s sobre un plano con fuego, Pedro y Clawd (una imagen fuerte a tamaño de miniatura). Clawd está dentro de la historia sin tener que viajar mucho: el fuego es su sitio, y la orilla es el mismo encuadre rimado. Además, lo de Judas cabe en dos planos sobrios, sin competir con la escena de Pedro, y el arco oscuro → oro sigue al texto: noche, mañana gris, amanecer de oro.

**Frente a Jonás, la mujer samaritana y María de Betania** cambian:
- **Estructura:** dos personajes en paralelo y un fuego que rima, no un recuerdo desde el vientre, un eje vertical ni una sola casa.
- **Apertura:** un fuego en un patio a medianoche, con Clawd ya calentándose; no la oscuridad con un punto, el mediodía blanco ni un plano detalle de un objeto.
- **Plano firma:** las láminas de bruma y de montes se **abren como un telón** y el sol atraviesa todas las capas hasta las brasas; no unas costillas que se abren, la luz que sube por un pozo ni la luz que sale por una ventana.
- **Recorrido de cámara:** inclinación hacia la luna y viaje lateral bajo ella (el huerto), *rack focus* hasta la galería, un telón de primer plano (la puerta del templo) y una grúa hacia abajo en la orilla.
- **Música:** re dórico con `oboe` y vibráfono frotado (`vibraphone_bowed`), y un solo `tubular_bells` al amanecer.
- **Final:** la orilla de oro con las brasas, Pedro y Jesús sentados, y Clawd girándose a cámara.

## 2. Idea y arco

**Logline:** junto al fuego del patio, Clawd ve a Pedro negar a Jesús la misma noche en que Judas lo entregó; los dos salen, uno no vuelve, y días después, en otro fuego al amanecer, Jesús le hace a Pedro tres preguntas por tres negaciones.

- **Planteamiento y gancho (0–9 s):** el fuego del patio, Pedro y Clawd; el beso de Judas bajo la misma luna.
- **El fallo de Pedro (9–14,5 s):** la criada, «No lo conozco», tres veces.
- **Silencio 1 (14,5–16 s).**
- **El gallo y la mirada (16–23 s):** el gallo; Jesús se vuelve y mira a Pedro; Pedro sale y llora.
- **Judas (23–28,5 s):** las monedas de plata en el suelo del templo, de mañana; una silueta que sale por la puerta y se pierde en la luz gris. No vuelve.
- **Silencio 2 (28,5–30 s).**
- **La orilla (30–41 s):** días después, al amanecer, brasas en la orilla y Jesús esperando; tres preguntas, tres encargos. El clímax: las capas se abren y el sol atraviesa.
- **Cierre (41–47 s):** la lección («Si fallaste, vuelve: el fuego sigue encendido») y la pregunta de una palabra.

**Color:** de **noche ciruela** a **gris de ceniza** (lo de Judas) y de ahí a **oro**. Nada de azul: junto a la luz dorada da verde; el agua del lago es pizarra violácea, no azul. **El fuego es crema y oro, no naranja:** Clawd es el único elemento naranja de la película (las brasas son puntos pequeños `#ffb35c`, nunca una mancha grande junto a él).
- **Escalera del patio (noche):** cielo `#1b1426` → muro lejano `#3a2c40` → galería con arcos `#261c2c` → patio `#140e18` → frente `#07050a`. Llama `#ffd38a`, brasas `#ffb35c`, luna **llena** `#f3e6c8` (la Pascua cae en luna llena: aquí sí se dibuja llena).
- **Escalera del huerto (recuerdo, misma noche):** cielo `#1b1426` con la misma luna → olivos lejanos `#3a3440` → olivos medios `#24202a` → frente `#0a080c`; antorchas pequeñas `#ffd38a`.
- **Escalera del templo (mañana gris):** fondo `#bfb8bb` → columnas lejanas `#8a8287` → columnas medias `#4c454a` → suelo `#1a1619`; monedas de plata `#d8d4cc` con borde frío. Grade desaturado; ninguna luz cálida.
- **Escalera del lago antes del alba:** cielo `#2a2236` → montes lejanos `#4a3a4e` → bruma `#5a4a5c` → agua pizarra `#2e2638` → orilla `#0c080e`; brasas `#ffb35c`.
- **Escalera de oro:** `#f6e2ac` → `#e8c47c` → `#b88a48` → `#5a3c1c` → `#22150a`; luz `#ffd98a`.
- **Dos acentos, uno por lado** (la historia tiene dos lados, `STYLE.md` §3): el **oro** del fuego (Pedro) y la **plata** de las monedas (Judas). Clawd es el único color fuerte.

**Eco:** S1 y S11 son el mismo encuadre: un fuego en el centro abajo, Clawd sentado a la izquierda, una figura a la derecha. En S1 es medianoche, el fuego está rodeado de siervos y Pedro está encogido, con la capucha puesta. En S11 es la orilla en oro, son unas brasas pequeñas con pan y pez, y Pedro está sentado junto a Jesús, con la capucha bajada.

**Clawd dentro de la historia:** es un testigo imaginario y el relato no cambia. No habla con Pedro ni con nadie, no lo defiende ante la criada, no detiene a Judas, no lo sigue. Está sentado en una piedra baja junto al fuego del patio, a la izquierda, con las manos hacia la llama; en la orilla, sentado en la proa de la barca varada, también a la izquierda. Mira, se encoge, baja los brazos y cuenta. En los momentos solemnes (S2 el beso, S4 la mirada, S5 el llanto, S6–S7 lo de Judas, S10 el clímax) se queda **quieto, a un lado del cuadro, con los brazos abajo**. En S4, mientras Jesús mira a Pedro, Clawd no gira la cabeza hacia la galería: mira el fuego.

## 3. Referencias

- **Las siluetas de Lotte Reiniger y de Michel Ocelot.**
  - *Aprender:* lectura por silueta, un solo gesto por personaje, el giro de una cabeza como acción principal de un plano.
  - *No tomar:* personajes, diseños, encuadres ni música concretos.
- **Los nocturnos con una sola fuente de luz de Georges de La Tour** (la negación junto al fuego es un tema clásico de la pintura).
  - *Aprender:* un fuego bajo que ordena a todos alrededor; las figuras salen de la oscuridad solo donde llega la llama; la criada que señala.
  - *No tomar:* ninguna composición ni figura concreta (aquí no hay caras: son siluetas).
- **Lámparas de papel recortado (shadow box)** con amanecer al fondo.
  - *Aprender:* la escalera de valores que se enciende de atrás hacia delante; capas de montes como bastidores de teatro.
  - *No tomar:* ningún diseño de lámpara concreto.

## 4. Guion (114 palabras, 22 líneas)

Ninguna línea empieza por J: «Jesús» y «Judas» van siempre en medio. Las palabras de la criada, de Pedro y de Jesús van entre comillas en los subtítulos; Clawd las cita sin cambiarlas. Los textos definitivos están en `voices/lines.json` y en `SCRIPT` de `tools/timeline.py`.

| # | Texto | Pausa después | Referencia |
|---|---|---|---|
| l01 | Pedro y Judas le fallaron a Jesús la misma noche… | .1 | gancho; Mt 26:47–50, 69–75 |
| l01b | y solo uno volvió. | .35 | gancho; Jn 21:15–17 |
| l02 | Estoy junto a este fuego. | .3 | Lc 22:55; Jn 18:18 |
| l03 | Antes, Judas lo entregó con un beso… | .15 | Mt 26:48–49 |
| l04 | por treinta monedas. | .4 | Mt 26:15 |
| l05 | Ahora una criada mira a Pedro: | .1 | Mt 26:69 |
| l05b | «Tú también estabas con él». | .3 | Mt 26:69 |
| l06 | «No lo conozco». | .25 | Lc 22:57; Mt 26:70–74 |
| l06b | Tres veces. | **1.4 (silencio 1)** | Mt 26:74 |
| l07 | Cantó el gallo. | .3 | Mt 26:74 (el canto suena antes que la voz) |
| l08 | El Señor se volvió… y miró a Pedro. | .4 | Lc 22:61 |
| l09 | Pedro salió y lloró amargamente. | .5 | Lc 22:62; Mt 26:75 |
| l10 | También Judas, arrepentido, devolvió las monedas… | .2 | Mt 27:3 |
| l11 | salió del templo… y no volvió. | **1.4 (silencio 2)** | Mt 27:5 |
| l12 | Días después, Jesús esperaba en la orilla | .1 | Jn 21:1, 4 |
| l13 | con brasas encendidas. | .35 | Jn 21:9 |
| l14 | Tres veces le preguntó a Pedro: «¿Me amas?» | .3 | Jn 21:15–17 |
| l15 | Y tres veces: «Apacienta mis ovejas». | .5 | Jn 21:16–17 (clímax en «ovejas») |
| l16 | Si fallaste, vuelve: | .15 | lección |
| l16b | el fuego sigue encendido. | .4 | lección |
| l17 | ¿Qué le responderías tú a Jesús? | .25 | CTA de una palabra (experimento vigente hasta el 19 nov) |
| l17b | Dilo en una palabra. | hasta el final (2.0) | CTA |

- **Gancho:** l01 + l01b terminan hacia 3,3 s; los dos nombres suenan en el primer segundo y el giro («solo uno volvió») cierra la frase. La voz arranca antes de 0,3 s con el fuego ya en movimiento y la música desde 0 s.
- **«Antes»:** el beso fue esa misma noche, horas antes del patio (Mt 26:47, 57–58). El trato de las treinta monedas fue días antes (26:14–16); «por treinta monedas» no dice cuándo se pactó.
- **«Treinta monedas»:** el texto dice «treinta piezas de plata». En la voz va «monedas» (más claro y más corto); en la imagen son **de plata**, no de oro, y la descripción cita «treinta piezas de plata».
- **«Tres veces»:** las tres negaciones fueron ante la criada, otra criada y los presentes (26:69–74). La voz las resume; la imagen las muestra en tres golpes de luz.
- **l10–l11 (Judas), una frase sobria:** Mateo dice «arrepentido» (27:3), que arrojó las monedas en el templo y salió (27:5). «Y no volvió» es todo lo que dice la voz sobre su muerte: sin método, sin lugar, sin juicio sobre su destino. La descripción cita Mateo 27:3–5. **Es de mañana** (27:1), no de noche: por eso el templo es gris y no hay luna.
- **l12:** «Días después» es fiel (Jn 21:14, la tercera vez que se manifestó tras resucitar). «Esperaba en la orilla» sin «a Pedro»: esperaba a los siete que pescaban (21:2–4); Pedro se nombra en l14. La voz no dice «resucitado» para no cargar la línea; la imagen (Jesús en la orilla, en luz) y la descripción lo dicen.
- **l15:** Juan alterna «corderos» y «ovejas» (21:15–17); «Apacienta mis ovejas» es literal de 21:16–17.
- **l16, la lección:** Pedro volvió y encontró el fuego encendido; no promete nada que el texto no diga y no juzga a nadie. Es la frase que el espectador se lleva.
- **l17, el CTA:** «¿Qué le responderías tú a Jesús?» remite al «¿Me amas?» de l14; una sola pregunta y una sola petición.
- **Duración:** 114 palabras + dos silencios de 1,4 s ≈ 46–48 s (María de Betania, 114 palabras, quedó en 46 s). Si la voz pasa de 48 s, se quita l02 (la imagen ya muestra a Clawd en el fuego) y después «Ahora» de l05. Los silencios no se acortan y la voz no se acelera.
- **Título de YouTube** (personajes famosos + giro + pregunta): «Pedro y Judas le fallaron a Jesús la misma noche… ¿por qué solo uno volvió? | La negación 🔥 #shorts» (99 caracteres; va en `descripcion.txt`). Alternativa: «Pedro negó a Jesús 3 veces… y Jesús le hizo 3 preguntas | Pedro y Judas #shorts».
- **Descripción:** Mateo 26:14–16, 47–50, 69–75; 27:3–5; Lucas 22:55, 61–62; Juan 18:18; 21:1–17. Hay que aclarar que Clawd es un testigo imaginario que no cambia el relato y que el video se hizo con IA.
- **Whisper:** posibles confusiones son «brasas/brazas», «Apacienta/a pacienta», «amargamente/amarga mente», «arrepentido/arepentido», «conozco/conosco», «Judas/Judás». Si el resto coincide, se pone lo que oyó en `asr`. Un nombre mal pronunciado se corrige.

## 5. Lista de planos (tiempos estimados; los definitivos salen de la voz en `timeline.py`)

Las capas de cada plano van entre paréntesis (máximo 9, contando el cielo, las figuras y a Clawd). **El fuego del patio** es un brasero bajo de piedra en el centro del patio, con llama crema; alrededor, dos o tres siervos sentados de espaldas (`sit`). **La piedra de Clawd** está a la izquierda del fuego, en el mismo lugar en S1 y S3.

| # | Tiempo | Plano | Encuadre y cámara | Clawd: dónde está y qué hace | Por qué |
|---|---|---|---|---|---|
| S1 | 0–5,0 | **El fuego del patio.** Medianoche. En el centro abajo, el brasero con su llama crema que tiembla (`1 + .06·sin(7.3t)·sin(3.1t)`) y tres chispas emisivas fijas que parpadean. A la derecha, **Pedro** sentado en cuclillas, con manto y capucha (`sit`, `veil`), las manos hacia el fuego. Detrás, dos siervos de espaldas. Al fondo, el muro del patio y una galería con arcos, uno encendido; arriba, la luna llena. Arriba del cuadro, la tira de papel del título «DOS DISCÍPULOS» (Cinzel 800) y «Mateo 26–27 · Lucas 22 · Juan 21» (Playfair cursiva) crece de su borde entre 0,3 y 3,0 s, colocada en función de la cámara. En «la misma noche» la llama se aviva y la luz sube por el muro; en «solo uno volvió» baja un poco. (8: cielo con luna, muro con galería, siervos, patio, brasero, llama, Pedro, Clawd) | Plano medio, *dolly* lento hacia dentro, frontal y un poco bajo, a la altura del fuego | Sentado en su piedra a la izquierda del fuego, grande (u .0032), con las manos hacia la llama (aL y aR ~.7). En «Pedro» mira a Pedro; en «Judas» baja un poco los brazos; en «este fuego» (l02) mira la llama | El gancho legible a tamaño de miniatura: un fuego, un hombre encogido y Clawd dentro de la escena desde el cuadro 1 |
| S2 | 5,0–9,0 | **La misma luna: el beso.** La cámara se inclina hacia arriba desde la llama hasta la luna llena y, sin cortar, viaja a la izquierda bajo ella: el muro del patio se desliza fuera y entran capas de olivos. Es el huerto, horas antes. Antorchas pequeñas; un grupo de siluetas con lanzas al fondo. En el centro, **Jesús** de pie, sereno, y **Judas** que se le acerca y se inclina hacia él: dos perfiles que se juntan en «beso» y quedan quietos. En «treinta monedas», un brillo frío de plata en la bolsa de Judas (una sola chispa emisiva) y un tintineo. (9: cielo con luna, olivos lejanos, soldados con antorchas, olivos medios, Jesús, Judas, olivo de frente, Clawd, + la tira del título que sale por arriba) | Inclinación hacia arriba y viaje lateral con paralaje bajo la luna; en «beso» la cámara se detiene | Pequeño (u .0022), medio oculto tras el tronco de un olivo del frente, a la izquierda. **Quieto, con los brazos abajo.** No da un paso | El recuerdo entra por la luna, que es la misma en las dos escenas: «la misma noche» se ve. El beso, a distancia y en silueta, sin dramatismo |
| S3 | 9,0–14,5 | **La criada y las tres negaciones** + **silencio 1.** La cámara vuelve por el mismo camino (viaje a la derecha y bajada desde la luna) hasta el fuego. Entra por la derecha una **criada** (`stand`, `veil`), se detiene junto a Pedro y extiende el brazo hacia él en «Tú estabas con él». Pedro se echa atrás en tres golpes, uno por negación: **en cada uno, la llama se agacha y la sombra de Pedro en el muro se encoge un poco**. En «Tres veces», Pedro queda de pie, apartado del fuego, de espaldas. Después, **silencio 1**: la llama baja a brasas, los siervos quedan quietos, nada se mueve salvo un parpadeo mínimo de las brasas. (9: cielo con luna, muro con galería, siervos, patio, brasero, llama, criada, Pedro, Clawd) | Inclinación hacia abajo y viaje de vuelta; después, **plano medio fijo** con *dolly* muy lento hacia Pedro, que se para en el silencio | En su piedra, a la izquierda. En «Tú estabas con él» deja de calentarse y baja los brazos; en cada «no» se encoge un poco; en el silencio, quieto | La caída de Pedro contada con la luz: tres golpes, tres sombras más pequeñas. El silencio sostiene la vergüenza |
| S4 | 14,5–20,7 | **El gallo y la mirada.** El primer sonido después del silencio es el gallo. En el borde del muro, contra la luna que ya baja, la silueta de un **gallo** de papel levanta la cabeza (un giro de cabeza y cuello, nada más). Luego, *rack focus* del fuego (delante) a la galería del fondo: en un arco encendido, entre dos guardias, **Jesús** de pie, con las manos juntas por delante. En «se volvió» gira la cabeza y el torso despacio hacia el patio (rotación de la lámina de la cabeza ~.3 rad en 1 s); en «miró a Pedro» queda quieto, de frente al patio, con un borde de luz algo más cálido que el resto. (8: cielo con luna, muro con gallo, galería con arco encendido, guardias, Jesús, patio, Pedro de espaldas, Clawd) | Inserto del gallo (*dolly* corto) y después *rack focus* de Pedro (delante) a Jesús (atrás) | **Quieto a un lado**, en el borde izquierdo, fuera de foco, con los brazos abajo. Mira el fuego, no la galería: este momento no es suyo | El momento solemne: un solo gesto (una cabeza que se vuelve) y la distancia entre los dos medida en capas |
| S5 | 20,7–23,0 | **Pedro llora.** Afuera del portón del patio, junto al muro, a la luz de la luna. Pedro está doblado, con una mano en la cara (la cabeza baja, nunca horizontal), y se arrodilla despacio (`kneel`, con transición suave). Por el portón entreabierto se ve aún el resplandor del fuego. (6: cielo con luna, muro, portón con resplandor, suelo, Pedro, Clawd) | Plano general, *dolly* lento hacia atrás: Pedro se queda pequeño en la noche | En el portón, pequeño (u .0022), apoyado en la jamba, a la izquierda. **Quieto, con los brazos abajo.** No se acerca | La soledad del llanto. El resplandor del fuego en el portón deja la puerta abierta: él puede volver |
| S6 | 23,0–26,0 | **Las monedas en el templo.** Mañana gris (fundido de ciruela a gris en 0,6 s). Suelo de piedra del templo a ras del suelo; columnas pálidas al fondo. En «devolvió las monedas», **monedas de plata** caen de arriba (fuera de cuadro) y ruedan por el suelo; se quedan quietas, dispersas, con un brillo frío. De quien las arroja solo se ve una mano que se abre arriba, en el borde del cuadro. (6: fondo gris, columnas lejanas, columnas medias, suelo, monedas, Clawd) | Inserto a ras del suelo, *dolly* muy lento lateral siguiendo una moneda que rueda y se detiene | Junto a una columna de la derecha, pequeño (u .0022), **quieto, con los brazos abajo**. No mira las monedas: mira la puerta | Lo de Judas en un objeto: la plata devuelta, que ya no sirve. Sin rostro ni gesto teatral |
| S7 | 26,0–28,5 | **La puerta** + **silencio 2.** Desde dentro del templo, contraluz: la gran puerta abierta a una mañana gris y blanca. Una silueta (Judas, `stand`, sin rasgos) camina hacia la puerta, de espaldas, cruza el umbral y se aleja por la luz gris hasta hacerse muy pequeña. En «no volvió», **las dos hojas de la puerta se cierran** (telón de primer plano: sus bordes delanteros se tocan exactamente). Negro ciruela. **Silencio 2:** la caja queda a oscuras, con la luz apagada. (6: luz gris exterior, camino, silueta, columnas, hojas de la puerta, Clawd) | Plano general fijo; la puerta es el telón que cierra el plano | Dentro del templo, junto a la columna del borde izquierdo, de espaldas a cámara, pequeño, **quieto**. No sigue a nadie. Cuando la puerta se cierra queda a oscuras con todo lo demás | Una frase sobria hecha imagen: alguien se aleja y la puerta se cierra. No hay cuerda, ni árbol, ni figura colgada, ni campo de sangre |
| S8 | 30,0–33,0 | **Antes del alba, la orilla.** La luz de la caja se enciende de nuevo, despacio: primero el cielo violeta, luego los montes, luego la bruma sobre el agua pizarra. La cámara baja desde el cielo pálido hasta la orilla. Una barca varada a la izquierda; otra barca con figuras pequeñas en el agua, al fondo. En la orilla, a la derecha, **Jesús** de pie junto a unas brasas, sereno. **Pedro** sale del agua (Jn 21:7), con el manto pegado, y camina hacia él. (9: cielo, montes lejanos, bruma, agua, barca lejana, orilla, barca varada, Jesús, Pedro; Clawd va en la barca varada) | Grúa hacia abajo, del cielo a la orilla (la caja se enciende de atrás hacia delante: el primer paso de la luz) | Sentado en la proa de la barca varada, a la izquierda (u .0028). En «esperaba a Pedro» gira la cabeza hacia la orilla; las manos sobre las rodillas | El paso de la noche al día. La caja «se enciende» después de haberse apagado en S7: es la lámpara la que cuenta el tiempo |
| S9 | 33,0–36,9 | **Las brasas y las tres preguntas.** Plano medio de la orilla: unas **brasas** pequeñas en el centro abajo (el mismo lugar que el fuego de S1), con un pez y pan encima (dos recortes simples). Jesús sentado a la derecha, Pedro sentado frente a él, empapado, con la cabeza baja. En «Tres veces le preguntó», tres pulsos de luz desde las brasas, **uno por pregunta**, cada uno sube una capa más: orilla, agua, bruma. Pedro levanta la cabeza un poco más en cada pulso. (8: cielo de alba, montes, bruma, agua, orilla con brasas, Jesús, Pedro, Clawd) | Plano medio, *dolly* lento hacia dentro, frontal y a la altura de las brasas (rima con S1) | En la proa de la barca, a la izquierda, más cerca (u .0030). Quieto, con los brazos abajo, mirando a los dos | La rima con las tres negaciones: tres preguntas, tres pulsos de luz, como los tres golpes de S3 pero en sentido contrario |
| S10 | 36,9–41,0 | **Plano firma: las capas se abren.** En «Apacienta», las láminas de **bruma** y de **montes** del fondo se separan hacia los lados como un telón de papel (tres pares de láminas, de delante hacia atrás, con 0,3 s de escalonado). Detrás aparece el **sol** sobre el lago: el único `burst()` de la película, en «ovejas». La luz atraviesa todas las capas, de atrás hacia delante (`uTrans` .05 → .7, .3 s por capa), llega a las brasas y se une a su luz; las siluetas de Jesús y de Pedro ganan bordes de oro. El cielo pasa de violeta a oro crema. (9: cielo, sol, montes que se abren, bruma que se abre, agua, orilla, Jesús, Pedro, Clawd, + `burst`) | *Dolly* hacia atrás y grúa suave hacia arriba mientras las capas se abren: el cuadro pasa de plano medio a plano general | **Quieto a un lado**, en la proa, al borde izquierdo, con los brazos abajo y la cara hacia la luz. No levanta los brazos | El clímax con el movimiento propio del medio: la caja se abre y la luz pasa a través del papel. Dios, solo como luz |
| S11 | 41,0–47,0 | **El fuego sigue encendido.** La orilla en oro, mismo encuadre que S1: las brasas en el centro abajo, **Pedro** sentado a la derecha, ahora **sin capucha**, junto a **Jesús**; a la izquierda, Clawd. Las brasas siguen ardiendo. En «vuelve», la cámara se acerca a Clawd. En «¿Qué le responderías tú a Jesús?», Clawd se gira a cámara; en «una palabra», queda quieto mirando al espectador. (8: cielo de oro, montes, agua dorada, orilla, brasas, Jesús, Pedro, Clawd) | Plano general a plano medio de Clawd, *dolly* lento hacia dentro y un poco a la izquierda | Sentado en una piedra a la izquierda de las brasas (como en S1), grande (u .0034). En «el fuego sigue encendido» extiende las manos hacia las brasas (aL y aR ~.7, el gesto de S1); se gira a cámara en la pregunta | El eco: el fuego del principio, ahora en oro, con Pedro de vuelta. El CTA sale de la imagen, sin ningún gráfico |

**Contraste de ritmo:**
- S1–S3 son planos de 4–5 s con cambios de luz en la palabra (la llama que se aviva, los tres golpes).
- S2 es el único viaje lateral y la única escena nocturna sin fuego.
- S4 y S5 son lentos: un solo gesto cada uno.
- S6–S7 son grises, a ras del suelo y fijos: el ritmo se para.
- S8 es el primer movimiento largo de luz (la caja se enciende); S10, el segundo y el más grande, con la única aceleración de cámara.
- S11 se calma.
- Hay un cambio visual (plano, cámara o luz) cada 3–4 s, también dentro de los planos largos.

**Movimientos de cámara:** *dolly* hacia dentro, inclinación hacia arriba y hacia abajo, viaje lateral con paralaje, *rack focus*, plano fijo con luz que cambia, telón de primer plano (la puerta), grúa hacia abajo, *dolly* hacia atrás con grúa hacia arriba.

## 6. Mapa de ritmo, música y sonido

**Rejilla:** 60 bpm (negra 1 s), compás de 4/4 = 4 s. Los cortes y los golpes caen en la palabra, no en cada tiempo.

**Tonalidad:** **re dórico** (re–mi–fa–sol–la–si–do) en la noche, **re sin tercera** en lo de Judas y **re mayor** desde el clímax.

**Instrumentos nuevos para la marca:**
- `oboe`: la voz de Pedro. Motivo la–sol–fa–mi (cae, como él) en la noche; en el clímax sube re–mi–fa♯–la.
- `vibraphone_bowed`: la luz del fuego. Suena cada vez que la llama se aviva o un pulso de luz sube.
- `tubular_bells`: **una sola campana** (re) cuando sale el sol en S10.

Base de `cellos`, `contrabass` y `cellos_pizz`. Sin batería: un solo golpe de `frame_drum` en «beso». `timpani` no se usa.

| Sección | Tiempo | Música | Ambiente | Foley |
|---|---|---|---|---|
| Fuego (S1) | 0–5,0 | Desde 0 s: pedal de `contrabass` en re y una nota de `vibraphone_bowed` (la4) cuando la llama se aviva en «la misma noche» | Fuego que crepita (cerca), grillos lejanos, el murmullo de los siervos muy bajo | Roce de papel al entrar el título; leña que se asienta en «solo uno volvió» |
| El beso (S2) | 5,0–9,0 | `cellos_pizz` escasos; el `oboe` dice el motivo que cae (la–sol–fa–mi) | El crepitar se queda sobre la subida a la luna y se apaga (L-cut); viento en los olivos y pasos de soldados lejanos | Hojas de olivo; armas que rozan; un golpe de `frame_drum` (`small`) en «beso»; en «monedas», **un tintineo corto de plata** |
| Criada (S3) | 9,0–14,5 | `cellos` graves en re, muy bajos; el `oboe` repite el motivo una vez, más bajo | Vuelve el crepitar (entra .4 s antes de que la cámara baje al fuego: J-cut) | Pasos de sandalia de la criada; en cada negación, **un golpe seco de leña** y la llama que se agacha; tela cuando Pedro se levanta |
| **Silencio 1** | 14,5–15,9 | **Nada** (meta: −55 dB o menos) | Solo un tono de sala muy bajo; el crepitar se apaga en seco | Ninguno |
| Gallo y mirada (S4) | 16,0–20,7 | El primer sonido es **el gallo**, solo y claro. Después, una nota larga de `vibraphone_bowed` (re4) en «miró a Pedro», sobre `violas` sin tercera | Brasas casi apagadas; un viento frío | Tela al girar Jesús, muy baja |
| Llanto (S5) | 20,7–23,0 | `oboe` solo, en registro grave, el motivo hasta mi y sin resolver | Viento de la noche; el crepitar del patio, lejano, a través del portón | Rodilla en la tierra. No se pone un sollozo (no se imitan voces) |
| Monedas (S6) | 23,0–26,0 | `cellos` en re sin tercera, sostenidos y muy bajos; nada más | Eco grande de piedra (el templo); un murmullo lejano y frío | **Monedas** que caen sobre piedra, ruedan y se detienen; la última rueda sola hasta quedarse quieta |
| Puerta (S7) + **silencio 2** | 26,0–28,5 / 28,5–30,0 | Los `cellos` se apagan en «salió del templo»; después **nada** (meta: −55 dB o menos) | Viento gris del exterior; con la puerta cerrada, solo tono de sala | Pasos sobre piedra que se alejan; **el golpe sordo de la puerta** al cerrarse en «no volvió» |
| Orilla antes del alba (S8) | 30,0–33,0 | El primer sonido tras el silencio son **las olas pequeñas del lago** (entran a 29,6 s, antes de la luz: J-cut); luego `cellos` en re dórico y `cellos_pizz` | Agua que lame la orilla; una gaviota lejana | Pedro que sale del agua (chapoteo y pasos en la grava); crepitar suave de brasas |
| Preguntas (S9) | 33,0–36,9 | Tres notas de `vibraphone_bowed` en escalera (re–fa–la), una por pregunta y por pulso de luz; el `oboe` empieza a subir | Agua, brasas | Un roce de tela cuando Pedro levanta la cabeza |
| **Clímax (S10)** | 36,9–41,0 | En «Apacienta», `violins`, `violas`, `cellos` y `horn` abren en **re mayor**; en «ovejas», con el `burst`, **una campana de `tubular_bells`** (re); el `oboe` dice el motivo que sube (re–mi–fa♯–la) | El viento de la mañana entra al abrirse las capas | **Papel que se desliza** con cada par de láminas que se abre; un brillo largo con el sol |
| Lección y CTA (S11) | 41,0–47,0 | Cuerdas bajas sostenidas en re mayor; `vibraphone_bowed` solo bajo el CTA; última nota de `oboe` (re5) al final | Olas tranquilas, brasas | Golpecito de cartulina cuando Clawd se gira |

- **Mezcla:** voz al frente (RMS ~−18 dB), música 5–6 dB por debajo bajo la voz, foley entre −24 y −34 dB (el gallo, la puerta y las monedas, hasta −20 dB: son los sonidos que cuentan la historia), final a −14 LUFS.
- **Transiciones sonoras:** el crepitar del patio se queda sobre la subida a la luna (L-cut, S1→S2) y vuelve antes de bajar (J-cut, S2→S3); las olas del lago entran antes de que se encienda la orilla (J-cut, S7→S8).
- **Gallo y monedas:** grabaciones con licencia libre (CC0 o similar), anotadas en `CREDITS`. El gallo es un solo canto, completo y limpio, sin eco.
- **Instrumentos:** `celesta` suena como glockenspiel y aquí no se usa; `french_horn` = `horn`; si hiciera falta `timpani`, con nota (`'D2'`).
- **Comprobar** por tramos en `out/mix.wav` que los dos silencios existen de verdad (meta −55 dB o menos) antes de entregar.

## 7. Subtítulos y título

- Blanco cálido, serif grande para móvil, en la banda oscura inferior (`bottom: 350px`). En el patio, el frente es el suelo en sombra `#07050a`; en el templo (S6), el suelo `#1a1619`; en la orilla, la grava oscura `#0c080e` y en oro `#22150a`. Si no alcanza, se pone una banda oscura tenue detrás del texto. Nunca sobre la llama, las brasas, las monedas ni el sol.
- Palabras clave en oro: *Pedro*, *Judas*, *la misma noche*, *solo uno volvió*, *fuego*, *beso*, *treinta monedas*, *No lo conozco*, *gallo*, *miró a Pedro*, *lloró amargamente*, *arrepentido*, *no volvió*, *Días después*, *brasas*, *¿Me amas?*, *Apacienta mis ovejas*, *vuelve*, *una palabra*.
- Título solo al principio: tira de papel «DOS DISCÍPULOS» (Cinzel 800) y «Mateo 26–27 · Lucas 22 · Juan 21» (Playfair cursiva), colocada en función de la cámara. «Discípulos» no se dice en la voz, así que no se repite en los subtítulos.
- Ningún otro texto en pantalla: sin tarjetas, contadores, iconos, globos, cifras dibujadas ni CTA gráfico. El «tres» y el «treinta» viven solo en la voz, los subtítulos y la descripción. El último subtítulo (el CTA) dura hasta el final.

## 8. Qué hay que construir (sin motor nuevo)

**`actors.js`** (de la plantilla, de mujer-samaritana y de maria-de-betania):
- `human()` con `veil` (Pedro con capucha en S1–S5, sin ella en S11; la criada) y la pose `kneel` para el llanto.
- `brasero()`: brasero bajo de piedra con una llama emisiva que tiembla y se agacha (escala vertical de la llama, de 1 a .5) y tres chispas fijas que parpadean. Las brasas de la orilla son el mismo objeto sin brasero, más pequeñas, con un pez y un pan recortados encima.
- `gallo()`: silueta de gallo de perfil, con cabeza y cuello en una lámina aparte que gira.
- `monedas()`: discos de plata pequeños (`#d8d4cc`) con borde frío; caen con gravedad simple, ruedan por distancia ÷ radio y se detienen.
- `barca()`: se puede partir del `ship()` de la plantilla, sin vela y varada.
- La cabeza de Jesús como lámina aparte en S4, para el giro.

**`shots.js`** (se quitan `belly`, el mar y la playa de Jonás):
- `patio(S, o)`: muro con galería de arcos (uno encendido), luna llena, siervos, suelo y portón. Lo usan S1, S3, S4 y S5 (S5 desde fuera del portón).
- `huerto(S, o)`: olivos en tres capas bajo la misma luna; una tira larga para el viaje lateral desde el patio.
- `templo(S, o)`: columnas en tres capas, suelo de piedra y la puerta con dos hojas (telón de primer plano).
- `lago(S, o)`: cielo, montes en pares de láminas que se separan, bruma en pares de láminas que se separan, agua pizarra, orilla y barca varada. Los colores van por parámetro: antes del alba y oro.

**Clímax:**
- En S10, separar los pares de láminas (montes y bruma) hacia fuera con 0,3 s de escalonado; animar el `uTrans` de cada capa de atrás hacia delante y mover `uLight` desde el sol hasta las brasas.
- Un solo `burst(…, '#ffd79a')` en el sol, en «ovejas».
- Bloom .45 solo en S10; en el resto, .25–.38. `maxCoc` 6–8 en todos.
- El grade de cada plano vuelve a sus valores por defecto en cada cuadro, para no arrastrar el gris de S6–S7.

**`timeline.py`:** momentos clave `noche`, `volvio`, `fuego`, `beso`, `monedas`, `criada`, `tres`, `sil1`, `gallo`, `se_volvio`, `miro`, `lloro`, `devolvio`, `salio`, `no_volvio`, `sil2`, `orilla`, `brasas`, `preguntas`, `apacienta`, `ovejas`, `vuelve`, `cta`.

**`voices/lines.json`:** voz `ef_dora`, `lang: es-419`, speed 1.0, **sin post-proceso**. Se reemplazan todas las líneas de Jonás.

## 9. Portada

- **Imagen:** la caja de luz con **dos fuegos**, uno sobre otro, en vertical. Arriba, el patio a medianoche en ciruela: Pedro encogido junto al brasero, con la capucha, bajo la luna llena, y una franja oscura donde va el texto. En el centro y abajo, la orilla en oro: las brasas encendidas, Jesús sentado sereno con un borde de luz y Pedro frente a él con la cabeza levantada. **Clawd grande** (u ~.0036) en el centro izquierdo, sentado en la piedra junto a las brasas, mirando al espectador. En el suelo, a la derecha, tres monedas de plata dispersas y apagadas (lo de Judas, sin figura). El oro nace abajo; la parte de arriba es noche con viñeta.
- **Gancho (5 palabras):** «PEDRO Y JUDAS: UNO VOLVIÓ», en Cinzel crema, entre 270 y 700 px desde arriba, sobre la parte oscura (nunca sobre el oro). El 20 % inferior queda vacío.

## 10. Reglas de fidelidad

- **Solo los hechos del texto:**
  - Judas pactó las treinta piezas de plata (Mt 26:15), entregó a Jesús con un beso en el huerto (26:48–49) y, arrepentido, devolvió las monedas, las arrojó en el templo y salió (27:3–5).
  - Pedro se calentaba junto al fuego del patio del sumo sacerdote (Lc 22:55; Jn 18:18), negó tres veces ante una criada, otra criada y los presentes, cantó el gallo (Mt 26:69–74), el Señor se volvió y lo miró, y él salió y lloró amargamente (Lc 22:61–62).
  - Días después, al amanecer, Jesús esperaba en la orilla con brasas, pez y pan (Jn 21:4, 9), y le preguntó tres veces «¿Me amas?», con tres encargos de apacentar (21:15–17).
- **Lo de Judas, sobrio:**
  - Una frase («salió del templo… y no volvió»). No se nombra ni se muestra el ahorcamiento: **ninguna cuerda, ningún árbol con figura, ningún campo de sangre** (Hch 1:18 no se usa).
  - Lo que se ve: las monedas en el suelo del templo y una silueta que se aleja por una puerta. Sin rostro ni gesto de villano.
  - No se dice nada sobre su destino eterno ni se le juzga: la voz no dice «condenado», «traidor» ni «perdido».
  - Es de mañana (Mt 27:1–3), no de noche.
- **Pedro con dignidad:** sin caricatura, sin cara ni lágrimas dibujadas; el llanto es una silueta doblada con la mano en la cara.
- **Jesús y Dios:** Jesús es una silueta serena, sin gestos teatrales: solo gira la cabeza en S4 y está sentado en S9–S11. **Dios no aparece como figura: solo luz** (el sol de S10). Sin rostro de Jesús ni aureola dibujada.
- **Las monedas** son de plata, no de oro, y son treinta (no se cuentan en pantalla).
- **La luna** es llena en la noche del patio y del huerto (la Pascua cae en luna llena). En el templo y en la orilla no hay luna.
- **Clawd** es un recurso narrativo: no habla con los personajes, no interviene, no cambia los hechos. La descripción lo aclara y declara que el contenido se hizo con IA.
- **El cierre:** sin promesas de milagros ni chantaje espiritual. «Si fallaste, vuelve: el fuego sigue encendido» es una invitación, no una amenaza. El CTA es una pregunta de una palabra. Sin «Etiqueta», sin «SÍ o NO», sin «AMÉN».
