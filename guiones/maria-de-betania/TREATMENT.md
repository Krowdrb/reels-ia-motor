# El frasco roto — Tratamiento

**Estilo:** Paper-cut Lightbox (`styles/paper-lantern`), marca `clawd-papel`. **Formato:** vertical 1080×1920, 30 fps, unos 47 s (objetivo 45–48 s, tope 50 s), −14 LUFS.
**Idioma:** español latino, voz Kokoro `ef_dora`, `lang: es-419`, velocidad 1.0, **limpia, sin `robot_voice.py` ni ningún efecto** (decisión del dueño 2026-11-13). No `em_santa`. Subtítulos quemados y `.srt`.
**Fuente:** Juan 12:1–8 (seis días antes de la Pascua, 12:1; cena en Betania, Marta sirve, Lázaro a la mesa, 12:2; una libra de nardo puro, muy caro, los pies, los cabellos, la casa llena del olor, 12:3; Judas y los 300 denarios, 12:4–5; la bolsa y el robo, 12:6; «Déjala… para el día de mi sepultura», 12:7; «a los pobres siempre los tendréis», 12:8). Paralelos: Marcos 14:3–9 (frasco de alabastro que ella **quiebra**; «dondequiera que se predique este evangelio… se contará lo que ésta ha hecho, para memoria de ella», 14:9) y Mateo 26:6–13. Mateo 20:2: un denario = el jornal de un día.
**Render:** CPU (SwiftShader, `SSAA=1`, 2 núcleos) si no hay GPU. Máximo 9 capas por plano, sin lluvia ni partículas, **un solo `burst()`** en toda la película (S11, en la ventana), `maxCoc` ≤ 8, bloom ≤ .45.

## 1. Tres estructuras posibles

1. **Viaje lateral a lo largo de la mesa:** un solo *travelling* recorre la cena de un extremo a otro (Lázaro, los discípulos, Judas, Jesús) y termina en María a sus pies. Elegante y continuo, pero el gancho (el frasco, la cifra) llega al final y Clawd tendría que viajar con la cámara.
2. **El viaje del frasco:** el objeto como protagonista. Empieza guardado en la oscuridad de un arcón («lo ha guardado», 12:7), sale a la luz, se quiebra y su luz sale de la casa. El objeto cuenta el cambio, pero el arcón cerrado es una imagen de arranque lenta y María queda en segundo plano.
3. **Una casa, una noche, una luz (elegida):** todo ocurre en una sola habitación de Betania, de noche, y la luz cuenta la historia. Clawd está sentado desde el primer cuadro en una **hornacina de la pared del fondo**, junto a tres lámparas de aceite y al lado de la única ventana. El gancho es un plano detalle del frasco de alabastro en manos de María, junto a esas mismas lámparas: en «lo rompió» una grieta de luz cruza el alabastro. Por la ventana se ve la noche y el camino hacia Jerusalén, y el travesaño de la ventana proyecta en la pared una **sombra en cruz**, muy tenue. El perfume es luz dorada: primero llena el interior (12:3), la protesta de Judas la enfría y la hace retroceder, y en el clímax («se contará lo que ella hizo») la luz vuelve, sube por todas las capas de la casa, sale por la ventana y se extiende por los montes oscuros hasta el horizonte.

**Por qué la 3:** el gancho (la cifra y el frasco) se entiende en 3 s con un solo objeto en pantalla. Clawd está dentro de la casa desde el segundo 0 sin tener que moverse: es un testigo, no un viajero. Además, el arco oscuridad → luz coincide con el del texto. La sombra de la cruz dice «seis días antes de la Pascua» sin ninguna palabra en pantalla, y el perfume que «llena la casa» se vuelve visible y tiene un sentido: lo que hizo ella sale de esa casa al mundo (Mc 14:9).

**Frente a Jonás y a la mujer samaritana** cambian:
- **Estructura:** un interior en una sola noche, no un recuerdo desde el vientre ni un eje vertical.
- **Apertura:** un plano detalle de un objeto a la luz de las lámparas, no la oscuridad con un punto ni el mediodía blanco.
- **Plano firma:** la luz que llena una casa y sale por la ventana al paisaje, no unas costillas que se abren ni luz que sube por un pozo.
- **Recorrido de cámara:** *rack focus* y *dolly* de interior, y al final un *dolly* a través de la ventana.
- **Música:** sol eólico con clarinete grave, `strumstick` y cristal frotado.
- **Final:** la casa encendida en el monte vista desde fuera, y Clawd en la ventana.

## 2. Idea y arco

**Logline:** desde una hornacina junto a las lámparas, Clawd ve a una mujer romper un perfume que valía casi un año de trabajo sobre Jesús, seis días antes de la cruz, y oye a Jesús defenderla y prometer que su gesto se contará en todo el mundo.

- **Planteamiento (0–12,6 s):** el gancho; Betania de noche, la sombra en cruz en la pared; la cena; Marta sirve y Lázaro está a la mesa.
- **El gesto (12,6–20,4 s):** María quiebra el frasco, unge a Jesús y le seca los pies con su cabello; la casa se llena de luz dorada.
- **Silencio 1.**
- **La crítica (21,9–30,6 s):** Judas protesta por los 300 denarios; la luz se enfría y retrocede hasta quedar solo alrededor de María; él tenía la bolsa y robaba.
- **Silencio 2.**
- **La defensa (32,2–39,4 s):** «Déjala»; la sepultura (la sombra en cruz se ve nítida); los pobres y «a mí no siempre».
- **Clímax y cierre (39,4–48 s):** «dondequiera que se predique el evangelio, se contará lo que ella hizo»: la luz llena la casa capa por capa y sale por la ventana hasta el horizonte. Clawd, en la ventana, pregunta al espectador.

**Color:** de **noche ciruela y ocre oscuro** a **oro**. Nada de azul: el azul junto a la luz dorada da verde. Nada naranja ni terracota detrás de Clawd: el oro es crema y pajizo, y los frentes son pardos.
- **Escalera de noche, interior:** pared del fondo `#2a1e24` → muro medio `#1c141a` → mesa `#120c10` → frente `#07050a`; llamas de las lámparas `#ffb862`, pequeñas; alabastro crema translúcido `#efe4cc`.
- **Escalera de noche, exterior (por la ventana):** cielo `#1a1424` → montes lejanos `#3a2c3e` → montes medios `#241a28` → frente `#0c080e`; luna creciente gibosa `#f3e6c8`. Seis días antes de la Pascua la luna aún no está llena: no se dibuja luna llena.
- **Enfriamiento (Judas):** el grade baja la saturación hacia `#241c22`, las llamas bajan y la escalera dorada se repliega a las dos capas más cercanas a María.
- **Escalera de oro:** `#f6e2ac` → `#e8c47c` → `#b88a48` → `#5a3c1c` → `#22150a`; luz `#ffd98a`.
- **Acento:** el oro del perfume es el único acento. Clawd es el único color fuerte.

**Eco:** S1 y S12 son la misma hornacina. En S1 hay un frasco intacto a la luz de tres llamas pequeñas, en una casa a oscuras. En S12 la hornacina está vacía del frasco pero llena de oro, y la ventana de al lado deja salir la luz al mundo.

**Clawd dentro de la historia:** es un testigo imaginario y el relato no cambia. No habla con nadie, no toca el frasco, no defiende a María, no mira mal a Judas. Está sentado en la hornacina del fondo, a la izquierda de la ventana, entre las lámparas, a la altura de las cabezas de los que cenan. Mira, se inclina, respira el perfume y cuenta. En los momentos solemnes (S7, S9, S10, S11) se queda **quieto, a un lado, con los brazos abajo**. En S10, mientras Jesús habla de su sepultura, ni siquiera gira la cabeza.

## 3. Referencias

- **Las siluetas de Lotte Reiniger y de Michel Ocelot.**
  - *Aprender:* lectura por silueta, un solo gesto por personaje, figuras arrodilladas que se leen con dignidad.
  - *No tomar:* personajes, diseños, encuadres ni música concretos.
- **Los interiores a la luz de una sola llama de Georges de La Tour.**
  - *Aprender:* una fuente de luz pequeña y baja que ordena a todos los personajes a su alrededor; sombras largas en la pared; caras y manos que salen de la oscuridad solo donde llega la llama.
  - *No tomar:* ninguna composición ni figura concreta (aquí no hay caras: son siluetas).
- **Lámparas de papel recortado (shadow box)** con ventanas encendidas.
  - *Aprender:* la ventana como hueco emisivo; capas que se encienden en escalera.
  - *No tomar:* ningún diseño de lámpara concreto.

## 4. Guion (borrador, unas 110 palabras)

Ninguna línea empieza por J: «Jesús» y «Judas» van siempre en medio. Las palabras de Judas y de Jesús van entre comillas en los subtítulos; Clawd las cita sin cambiarlas.

| # | Texto | Pausa después | Referencia |
|---|---|---|---|
| l01 | Este frasco valía casi un año de trabajo… | .15 | gancho; Jn 12:5 + Mt 20:2 |
| l01b | y ella lo rompió. | .35 | gancho; Mc 14:3 |
| l02 | Estoy en Betania, seis días antes de la Pascua. | .3 | 12:1 |
| l03 | Cenan con Jesús. Marta sirve. Lázaro está a la mesa. | .3 | 12:2 |
| l04 | María rompe un frasco de nardo puro… | .2 | 12:3; Mc 14:3 |
| l05 | lo derrama sobre él, y con su cabello le seca los pies. | .3 | 12:3; Mc 14:3 |
| l06 | La casa se llena del perfume. | **1.5 (silencio 1)** | 12:3 |
| l07 | Pero Judas protesta: | .1 | 12:4 |
| l08 | «¿Por qué no se vendió por trescientos denarios, para los pobres?» | .3 | 12:5 |
| l09 | Lo decía porque tenía la bolsa… y robaba. | **1.6 (silencio 2)** | 12:6 |
| l10 | «Déjala. Lo ha guardado para el día de mi sepultura». | .45 | 12:7 |
| l11 | «A los pobres siempre los tendrán. A mí, no siempre». | .5 | 12:8 |
| l12 | «Dondequiera que se predique el evangelio, se contará lo que ella hizo». | .4 | Mc 14:9 (clímax en «se contará») |
| l13 | ¿Qué le darías tú a Jesús? Dilo en una palabra. | hasta el final | CTA de una palabra (experimento vigente) |

- **Gancho:** l01 + l01b terminan hacia 3,2 s, con la cifra en la primera frase. «Casi un año» se basa en 300 denarios (Jn 12:5; Mc 14:5 dice «más de trescientos») por un denario el jornal de un día (Mt 20:2). La cifra exacta va en l08, en los subtítulos y en la descripción.
- **«Lo rompió»:** quebrar el frasco es un detalle de Marcos 14:3. Unir el frasco quebrado (Marcos) con los pies y los cabellos (Juan) es la armonía habitual de los relatos. «Lo derrama sobre él» cubre la cabeza (Mc, Mt) y los pies (Jn) sin contradecir a ninguno. La descripción cita los tres pasajes.
- **l09:** Juan lo dice tal cual (12:6). Se dice una vez, en voz baja, sin adjetivos ni burla.
- **Duración:** unas 110 palabras, cerca de las 112 de mujer-samaritana. Si la voz pasa de 48 s, se quita «Cenan con Jesús.» de l03 (la imagen ya lo muestra) y después «Estoy en» de l02. Los silencios no se acortan y la voz no se acelera.
- **Título de YouTube** (personaje famoso + cifra + pregunta): «María rompió un perfume de casi un año de sueldo. ¿Por qué? | María de Betania #shorts». Alternativa: «300 denarios en perfume… ¿por qué Jesús la defendió? | María de Betania #shorts».
- **Descripción:** Juan 12:1–8; Marcos 14:3–9; Mateo 26:6–13; Mateo 20:2. Hay que aclarar que es María de Betania, hermana de Marta y de Lázaro, y no la mujer de Lucas 7 ni María Magdalena; que Clawd es un testigo imaginario que no cambia el relato; y que el video se hizo con IA.
- **Whisper:** posibles confusiones son «Betania/Betanía», «nardo/nardos», «denarios/de narios», «Lázaro/Lazaro», «sepultura/sepultura.», «Déjala/Dejala». Si el resto coincide, se pone lo que oyó en `asr`. Un nombre mal pronunciado se corrige.

## 5. Lista de planos (tiempos estimados; los definitivos salen de la voz en `timeline.py`)

Las capas de cada plano van entre paréntesis (máximo 9, contando el cielo, las figuras y a Clawd). **La hornacina** es un hueco arqueado en la pared del fondo, a la izquierda de la ventana. Dentro hay tres lámparas de aceite, y allí está Clawd. Es el mismo lugar en todos los planos de interior.

| # | Tiempo | Plano | Encuadre y cámara | Clawd: dónde está y qué hace | Por qué |
|---|---|---|---|---|---|
| S1 | 0–3,2 | **El frasco junto a las lámparas.** En el borde de la hornacina, dos manos de silueta (María, solo antebrazos y manos) sostienen un frasco de alabastro alto y de cuello fino. El alabastro es crema translúcido y brilla un poco con la luz de las tres llamas que tiene detrás. Arriba, la tira de papel del título «MARÍA DE BETANIA / Juan 12:1–8» crece del borde entre 0,3 y 3,0 s, colocada en función de la cámara. En «rompió», una grieta de luz dorada cruza el alabastro de lado a lado (corte emisivo que se dibuja en .25 s) y las llamas se inclinan. (7: pared, hornacina, lámparas, llamas, manos, frasco, Clawd) | Plano detalle, *dolly* lento hacia dentro, frontal | Sentado dentro de la hornacina, a la derecha de las lámparas y grande (u .0032). Mira el frasco. En «año de trabajo» levanta un poco las cejas, y en «rompió» se echa atrás medio paso, con los brazos abajo | El gancho: la cifra y el objeto, legibles a tamaño de miniatura. La grieta siembra la luz del clímax |
| S2 | 3,2–6,9 | **La ventana y la sombra.** La cámara se retira de la hornacina hacia la ventana de al lado. Fuera, la noche: montes ciruela, una luna gibosa, y abajo un camino que baja hacia los muros pálidos y lejanos de Jerusalén. Dentro, la luz de las lámparas proyecta en la pared el travesaño de la ventana: una **sombra en cruz** grande y suave. (8: cielo con luna, tres montes, muros lejanos, pared con ventana, hornacina con lámparas, Clawd) | *Dolly* hacia atrás y paneo corto a la derecha, de la hornacina a la ventana | En la hornacina, ahora más pequeño (u .0026). Gira la cabeza hacia la ventana en «seis días»; no ve la sombra en cruz | Dice «seis días antes de la Pascua» y la cruz cercana sin texto: la sombra es la del propio papel |
| S3 | 6,9–9,7 | **La cena.** Una mesa baja a lo largo del cuadro, con lámparas sobre ella. A la derecha, Marta de pie (`stand`, `veil`) sirve una jarra. En el centro está Lázaro sentado (`sit`) y, junto a él, Jesús sentado, sereno, con un borde de luz algo más cálido. Detrás, en una segunda lámina, tres discípulos sentados. (8: pared con hornacina, discípulos, mesa, Lázaro, Jesús, Marta, jarra, Clawd) | Viaje lateral corto de derecha a izquierda, con paralaje: la pared del fondo se mueve más despacio | En la hornacina del fondo, pequeño (u .0022). Gracias al paralaje no sale del cuadro. Mira la mesa | Presenta la casa y a los anfitriones en un solo gesto: Marta sirve, Lázaro está vivo y a la mesa |
| S4 | 9,7–12,6 | **Entra María.** Por la puerta oscura de la derecha entra una figura con manto (`stand`, `veil`) y el frasco en las manos. Se arrodilla (`kneel`, con transición suave) junto a los pies de Jesús. En «rompe», ella quiebra el cuello del frasco: la grieta de S1 se completa, el cuello se separa y sale un hilo de luz dorada. (7: pared con hornacina, discípulos, mesa, Jesús, María, frasco, Clawd) | Plano medio, *rack focus* de Jesús a María | En la hornacina, se inclina hacia delante con las manos en el borde (aL y aR ~.6) | La acción clave del gancho, ahora completa. La atención baja en profundidad de él a ella |
| S5 | 12,6–17,3 | **Los pies y el cabello.** Cámara a ras del suelo. María arrodillada, con la cabeza inclinada; el cabello cae del manto como **una sola lámina larga y recta**, sin ondas, que gira despacio alrededor de la nuca hasta quedar junto a los pies. De Jesús se ven los pies y la figura sentada arriba, inmóvil y serena. Un chorro fino de luz cálida sale del frasco (tira emisiva). (6: pared, mesa, Jesús, María, cabello, frasco + Clawd) | Primer plano bajo, *dolly* muy lento hacia dentro, casi frontal | Al fondo, en la hornacina, desenfocado pero reconocible (u .0024), quieto, con los brazos abajo | El gesto con dignidad: arrodillada, sin sensualidad. El cabello es un objeto de papel, no un efecto |
| S6 | 17,3–20,4 | **La casa se llena.** El perfume como luz: la fuente (`uLight`) nace en el frasco, en el suelo, y sube capa por capa. Primero el suelo, después la mesa y después la pared del fondo se vuelven translúcidas y doradas (`uTrans` .05 → .5, .35 s por capa). Las capas del frente siguen oscuras. Las llamas de las lámparas se avivan. (8: pared, hornacina, discípulos, mesa, figuras, María, frasco, Clawd) | Grúa lenta hacia arriba, del suelo a las vigas | En la hornacina, levanta la cara y respira hondo (el cuerpo sube un poco y los brazos se abren a .4). El oro lo alcanza | Primer paso del movimiento propio del medio: el olor que llena la casa, visible |
| S7 | 20,4–21,9 | **Silencio 1.** Plano general de la habitación, fijo. Todo quieto; solo tiemblan las llamas. El oro sigue ahí | Plano fijo, solo cambia la luz | Quieto en la hornacina, con los brazos abajo | Contiene el aire antes de la crítica |
| S8 | 21,9–30,6 | **La protesta.** En la capa más cercana a la cámara, la más oscura, se levanta un discípulo (Judas, `stand`): una silueta grande, de espaldas a cámara y de perfil, con una **bolsa pequeña** en el cinturón. Extiende el brazo hacia el frasco en «trescientos denarios». Mientras habla, el oro se repliega de las capas de atrás hacia delante hasta quedar solo alrededor de María, y el grade se enfría a ciruela. En «la bolsa», su mano se cierra sobre ella. (8: pared con hornacina, discípulos, mesa, Jesús, María, frasco, Judas, Clawd) | *Rack focus* de María (atrás) a Judas (delante) y un *dolly* corto hacia él. Al final, vuelve el foco a María | En la hornacina: en «protesta» deja de inclinarse y se queda recto; mira a Judas y después a María. No hace ningún gesto contra él | Lo oscuro de la película. La luz misma se encoge. Judas, sin caricatura: una silueta seria más |
| S9 | 30,6–32,2 | **Silencio 2.** Plano medio frontal: María arrodillada, con la cabeza baja y el frasco quebrado en el suelo. Detrás, en la pared, la sombra en cruz de la ventana se ve nítida por primera vez desde S2, porque las llamas se han quedado quietas. (6: pared con sombra, hornacina, Jesús, María, frasco, Clawd) | Plano fijo, frontal | Quieto en la hornacina, a un lado del cuadro, con los brazos abajo | Deja el centro libre para lo que va a decir Jesús |
| S10 | 32,2–39,4 | **«Déjala».** Jesús sentado, en plano medio, con María a sus pies. En «Déjala» levanta un brazo despacio, la palma abierta, hacia el frente, hacia donde estaba Judas (a ~1.0). En «sepultura» las llamas bajan un poco y la sombra en cruz queda detrás de él. En «A mí, no siempre» baja la mano. (7: pared con sombra, hornacina, mesa, Jesús, María, frasco, Clawd) | *Dolly* muy lento hacia dentro, de plano medio a plano medio corto | **Quieto a un lado**, en la hornacina, al borde izquierdo del cuadro, con los brazos abajo y la cabeza baja. No se mueve en todo el plano | El momento solemne. La sombra en cruz y la palabra «sepultura» coinciden sin ningún texto |
| S11 | 39,4–44,4 | **Plano firma: la luz sale de la casa.** En «Dondequiera», la luz vuelve a nacer en el frasco quebrado y sube por **todas** las capas, de delante hacia atrás: suelo, mesa, figuras (que ganan bordes de oro), pared, vigas (`uTrans` .05 → .7, .3 s por capa). En «evangelio» llega a la ventana y estalla: el único `burst()` de la película, en el hueco de la ventana. La cámara sigue la luz, pasa junto a la hornacina y **sale por la ventana** a la noche. Afuera, la luz se derrama por los montes capa por capa hacia el horizonte. En «se contará», las ventanas de aldeas lejanas se encienden una a una (emisivas), hasta los muros de Jerusalén. El cielo pasa de ciruela a oro crema. (9: cielo, tres montes, aldeas con ventanas, pared con ventana, hornacina, Clawd, `burst`) | *Dolly* hacia la ventana y a través de ella (empujar la caja hacia fuera), y después una grúa suave hacia arriba sobre los montes | En la hornacina junto a la ventana, quieto, con los brazos abajo y la cara hacia la luz. La cámara pasa muy cerca de él (u .0034) al cruzar la ventana, y él se queda dentro | El clímax con el movimiento propio del medio: la luz atraviesa el papel y sale de la caja al mundo. Lo que hizo ella se cuenta «en todo el mundo». Dios solo como luz |
| S12 | 44,4–48,0 | **La casa encendida.** Desde fuera, de noche ya dorada: la casa de Betania en su monte, con todas sus ventanas en oro y un camino de luz que baja hacia los muros lejanos. La cámara vuelve hacia la ventana, donde Clawd se ve sentado junto a las lámparas, en la hornacina, ahora sin frasco. (8: cielo dorado, montes, aldeas, camino, casa, ventana, hornacina, Clawd) | Plano general y *dolly* hacia dentro hasta plano medio de Clawd en la ventana | En la ventana, grande (u .0034). En «¿Qué le darías tú?» se gira a cámara; en «una palabra» queda quieto mirando al espectador | El eco: la hornacina del gancho, ahora llena de oro. El CTA sale de la imagen, sin ningún gráfico |

**Contraste de ritmo:**
- S1 a S5 son planos de 3–5 s con un cambio visual en la palabra.
- S6 y S11 son los dos movimientos largos de luz.
- S7 y S9 son planos fijos con silencio.
- S8 es el plano más largo y más cerrado, la tensión.
- S11 es la aceleración: la luz y la cámara salen juntas.
- S12 se calma.

**Movimientos de cámara:** *dolly* hacia dentro, *dolly* hacia atrás con paneo, viaje lateral con paralaje, *rack focus*, grúa hacia arriba, planos fijos y *dolly* a través de la ventana (empujar la caja hacia fuera).

## 6. Mapa de ritmo, música y sonido

**Rejilla:** 60 bpm (negra 1 s), compás de 4/4 = 4 s. Los cortes y los golpes caen en la palabra, no en cada tiempo.

**Tonalidad:** **sol eólico** (sol–la–si♭–do–re–mi♭–fa) en la noche y **sol mayor** desde el clímax.

**Instrumentos nuevos para la marca:**
- `clarinet` en registro grave: la voz de la noche y el motivo sol–si♭–la–re.
- `strumstick`: una cuerda pulsada como lira.
- `glass`, cristal frotado: el motivo del perfume. Suena cada vez que el alabastro brilla.

Base de `cellos` y `contrabass`. Sin batería: un solo golpe de `frame_drum` en «rompe».

| Sección | Tiempo | Música | Ambiente | Foley |
|---|---|---|---|---|
| Gancho (S1) | 0–3,2 | Desde 0 s: pedal de `contrabass` en sol y una nota de `glass` (re5) en «frasco» | Grillos de noche, lejanos; chisporroteo de las lámparas | Roce de papel al entrar el título; en «rompió», **un chasquido de piedra fina** (alabastro) seco y corto, y el siseo de las llamas que se inclinan |
| Ventana (S2) | 3,2–6,9 | El `clarinet` dice el motivo (sol–si♭–la–re), sin resolver | Los grillos suben al acercarnos a la ventana (entran .4 s antes del corte: J-cut); viento suave | Madera de la ventana |
| Cena (S3–S4) | 6,9–12,6 | Punteo escaso de `strumstick` | Murmullo bajo e ininteligible de la cena (pasa por encima del corte a S4: L-cut); grillos a la mitad | Copas de barro sobre la madera; la jarra de Marta que vierte; pies descalzos en piedra cuando entra María; tela al arrodillarse; en «rompe», el cuello del frasco que se quiebra y un golpe de `frame_drum` (`small`) |
| Gesto (S5) | 12,6–17,3 | `cellos` suaves en sol; el `glass` sostiene re | El murmullo se apaga: todos miran | Hilo de líquido que cae; roce de cabello y tela, muy bajo |
| La casa se llena (S6) | 17,3–20,4 | `glass` y `hand_chimes` en escalera, una nota por capa que se enciende (sol–si♭–re–sol), sobre `violas` en sol menor | Llamas que se avivan | *Shimmer* (brillo que sube) con cada capa |
| **Silencio 1** | 20,4–21,9 | **Nada** (meta: −55 dB o menos) | Solo un tono de sala muy bajo; los grillos se cortan en seco | Ninguno |
| Protesta (S8) | 21,9–30,6 | El primer sonido tras el silencio es **un banco de madera que se arrastra** cuando Judas se levanta, y después la voz. Luego `cellos` graves en trémolo muy suave y el `clarinet` en mi♭ (la nota oscura); la escalera de `glass` desciende mientras el oro se repliega | Vuelve el murmullo, tenso, a la mitad | En «la bolsa», **un tintineo corto de monedas**; tela |
| **Silencio 2** | 30,6–32,2 | **Nada** (meta: −55 dB o menos) | Tono de sala | Ninguno |
| Defensa (S10) | 32,2–39,4 | El primer sonido es la voz sola en «Déjala». Después, una nota grave de `strumstick` (sol2) y el `clarinet` muy bajo; en «sepultura», `cellos` en sol sin tercera (ni mayor ni menor) | Llamas quietas, grillos lejanos que vuelven | Tela cuando Jesús levanta y baja la mano |
| **Clímax (S11)** | 39,4–44,4 | En «Dondequiera», el `glass` y los `hand_chimes` suben la escalera completa (una nota por capa); en «evangelio», con el `burst`, `violins`, `violas`, `cellos` y `horn` abren en **sol mayor**; el `clarinet` dice el motivo resuelto (sol–si–la–re) | Afuera, el viento de los montes entra al cruzar la ventana | Un chasquido de luz en la ventana con el `burst` y un brillo largo; un `hand_chimes` por cada aldea que se enciende |
| CTA (S12) | 44,4–48,0 | Cuerdas bajas sostenidas en sol mayor; `strumstick` solo bajo el CTA; última nota de `glass` al final | Grillos y viento templado, ya tranquilos | Golpecito de cartulina cuando Clawd se gira |

- **Mezcla:** voz al frente (RMS ~−18 dB), música 5–6 dB por debajo bajo la voz, foley entre −24 y −34 dB, final a −14 LUFS.
- **Transiciones sonoras:** los grillos de la ventana entran antes de S2 (J-cut); el murmullo de la cena pasa por encima del corte a S4 (L-cut); el viento de los montes entra antes de que la cámara cruce la ventana en S11 (J-cut).
- **Instrumentos:** `timpani` no se usa; si hiciera falta, con nota (`'G2'`). `celesta` suena como glockenspiel, así que aquí se usa `hand_chimes`; `french_horn` = `horn`.
- **Comprobar** por tramos en `out/mix.wav` que los dos silencios existen de verdad (meta −55 dB o menos) antes de entregar.

## 7. Subtítulos y título

- Blanco cálido, serif grande para móvil, en la banda oscura inferior (`bottom: 350px`). En todos los planos de interior, la capa del frente (suelo en sombra `#07050a`) llega hasta abajo. En S11 y S12, el oro del paisaje queda por encima de la banda y el frente es un monte oscuro; si no alcanza, se pone una banda oscura tenue detrás del texto. Nunca sobre la ventana encendida, el `burst` o el frasco.
- Palabras clave en oro: *un año de trabajo*, *lo rompió*, *Betania*, *seis días*, *Pascua*, *Lázaro*, *nardo puro*, *cabello*, *perfume*, *trescientos denarios*, *la bolsa*, *Déjala*, *sepultura*, *no siempre*, *se contará*, *una palabra*.
- Título solo al principio: tira de papel «MARÍA DE BETANIA» (Cinzel 800) y «Juan 12:1–8» (Playfair cursiva), colocada en función de la cámara. Esas palabras no se repiten en los subtítulos.
- Ningún otro texto en pantalla: sin tarjetas, contadores, iconos, globos, cifras dibujadas ni CTA gráfico. La cifra vive solo en la voz, los subtítulos y la descripción. El último subtítulo (el CTA) dura hasta el final.

## 8. Qué hay que construir (sin motor nuevo)

**`actors.js`** (de la plantilla y de mujer-samaritana):
- `frasco()`: alabastro crema translúcido (`trans` .35), cuello fino, con una capa emisiva para la grieta (se revela de 0 a 1) y el cuello como lámina aparte que se separa en S4. Se puede partir del `cantaro()` de mujer-samaritana.
- `lampara()`: lámpara de aceite de barro oscuro con una llama emisiva que tiembla (`1 + .06·sin(7.3t)·sin(3.1t)`) y se inclina.
- `human()` con `veil` (Marta y María) y una opción `bolsa` (Judas).
- La pose `kneel` con una lámina `cabello` anclada en la nuca. Es una forma larga y recta, sin ondas ni volumen, que solo gira.
- Una `jarra` para Marta.

**`shots.js`:**
- `casa(S, o)`: pared del fondo con la hornacina arqueada, tres lámparas, la ventana con travesaño en cruz (`cut`), la puerta oscura a la derecha, las vigas, la mesa baja y el suelo frontal. Los colores van por parámetro: noche, enfriado y oro.
- `afuera(S, o)`: cielo con luna gibosa, tres montes, el camino, los muros lejanos de Jerusalén y aldeas con ventanas emisivas. Lo usan S2, S11 y S12.
- `casaFuera(S, o)`: la casa en su monte, para S12.

**Sombra en cruz:** es la sombra real del travesaño de la ventana proyectada por la luz de las lámparas, colocada por delante de la pared del fondo. No es una cruz dibujada. Se refuerza bajando el radio de la sombra en S9 y S10.

**Clímax:**
- En S6 (parcial) y en S11 (completo), animar el `uTrans` de cada capa y mover `uLight` desde el frasco con un escalonado de .3–.35 s.
- Un solo `burst(…, '#ffd79a')` en el hueco de la ventana, en «evangelio».
- Las ventanas de las aldeas se encienden con su interruptor 0→1 una a una.
- Bloom .45 solo en S11; en el resto, .25–.38. `maxCoc` 6–8 en todos.
- El grade de cada plano vuelve a sus valores por defecto en cada cuadro, para no arrastrar el enfriamiento de S8.

**`timeline.py`:** momentos clave `trabajo`, `rompio`, `seis`, `marta`, `lazaro`, `rompe`, `cabello`, `perfume`, `sil1`, `protesta`, `denarios`, `bolsa`, `sil2`, `dejala`, `sepultura`, `siempre`, `dondequiera`, `evangelio`, `contara`, `cta`.

**`voices/lines.json`:** voz `ef_dora`, `lang: es-419`, speed 1.0, **sin post-proceso**.

## 9. Portada

- **Imagen:** el instante del gesto, en vertical. Clawd grande en la hornacina, a la izquierda y en el centro (u ~.0036), junto a las tres lámparas, mirando abajo. En el centro y la parte baja, María arrodillada en silueta digna, con el frasco de alabastro recién quebrado en las manos; de la grieta sale luz dorada que sube y empieza a llenar la pared. A la derecha, Jesús sentado, sereno, con un borde de luz. En la pared del fondo, la sombra en cruz, apenas visible. La parte de arriba es noche ciruela oscurecida con viñeta (ahí va el texto); el oro nace abajo, en el frasco.
- **Gancho (5 palabras):** «UN AÑO DE SUELDO… ROTO», en Cinzel crema, entre 270 y 700 px desde arriba, sobre la parte oscura (nunca sobre el oro). El 20 % inferior queda vacío.

## 10. Reglas de fidelidad

- **Solo los hechos del texto:**
  - Betania, seis días antes de la Pascua, una cena en honor de Jesús.
  - Marta sirve y Lázaro, a quien Jesús resucitó, está a la mesa.
  - María toma una libra de nardo puro, muy caro, unge los pies de Jesús y los seca con sus cabellos, y la casa se llena del olor.
  - Judas protesta por los 300 denarios y los pobres; Juan aclara que era ladrón y tenía la bolsa.
  - «Déjala; para el día de mi sepultura ha guardado esto»; «a los pobres siempre los tendréis, mas a mí no siempre me tendréis».
  - Del paralelo de Marcos 14: el frasco de alabastro que ella quiebra y «se contará lo que ésta ha hecho, para memoria de ella».
- **La mujer correcta:**
  - Es **María de Betania**, hermana de Marta y de Lázaro. **No** es la pecadora de Lucas 7 ni María Magdalena: nada en el guion, la imagen o la descripción las mezcla. Sin lágrimas en los pies (eso es Lucas 7).
  - Marcos y Mateo no la nombran, y Simón el leproso no se menciona en la voz: así no se abre la discusión sobre la casa.
- **Cifras:**
  - 300 denarios (Jn 12:5).
  - Un denario = el jornal de un día (Mt 20:2), así que se dice «casi un año de trabajo», no «un año exacto».
  - Una libra (~327 g, casi medio litro); va en la descripción, no en la voz.
  - Seis días.
  - No se inventan precios de hoy.
- **Con dignidad y sin sensualidad:**
  - María está arrodillada, con la cabeza inclinada y el manto puesto.
  - El cabello es una sola lámina de papel, recta.
  - No se dibujan caras ni piel.
  - Jesús es una silueta serena, sin gestos teatrales: solo levanta una mano en «Déjala».
  - Dios no aparece como figura: solo luz.
- **Judas:**
  - Una silueta seria, sin rasgos de villano ni caricatura.
  - El robo se dice una vez, con las palabras de Juan.
  - No se anticipa la traición, porque el texto de esta escena no la cuenta.
- **La cruz:** solo una sombra suave de la ventana. No hay ninguna cruz dibujada, ninguna crucifixión ni imágenes de la pasión.
- **Clawd** es un recurso narrativo: no habla con los personajes, no interviene, no cambia los hechos. La descripción lo aclara y declara que el contenido se hizo con IA.
- **El cierre:** sin promesas de milagros ni chantaje espiritual. El CTA es una pregunta de una palabra sobre la vida del espectador. Sin «Etiqueta», sin «SÍ o NO», sin «AMÉN».
