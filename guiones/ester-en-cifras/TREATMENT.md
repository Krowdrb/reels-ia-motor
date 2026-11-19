# Ester en cifras — Tratamiento

**Estilo:** `clawd-papel` sobre Paper-cut Lightbox (`styles/paper-lantern`). **Formato:** vertical 1080×1920, 30 fps, objetivo 45–48 s (tope 50 s), −14 LUFS.
**Idioma:** español latino, voz Kokoro `ef_dora`, `lang: es-419`, velocidad 1.0, limpia y sin efectos; subtítulos quemados con palabras clave en oro y `.srt`.
**Subnicho:** Biblia: datos, tipo «personaje famoso + máximo 3 cifras» (127, 30 y 3), y 2.º video del candidato en prueba «Mujeres de la Biblia». **SLUG:** `ester-en-cifras`.
**Experimento en curso (única variable):** la primera palabra de la voz es el nombre famoso: «Ester». La cifra (127) llega antes de los 2,5 s y el giro («y no puede ver al rey») antes de los 5 s.
**Fuente:** Ester 1:1 (Asuero reina sobre 127 provincias), 3:13 (el decreto contra los judíos), 4:11 (la ley del patio interior y los 30 días), 4:14 (Mardoqueo: «¿quién sabe si para esta hora…?»), 4:16 (3 días de ayuno, «si perezco, que perezca»), 5:1–3 (al tercer día entra, el cetro de oro, ella toca la punta). Reina-Valera 1960 como texto de control (ver §10 sobre las Biblias católicas).

**Render en CPU** (SwiftShader, `SSAA=1`): máximo 9 capas por plano y sin partículas. Las «127 provincias» son **cordilleras en profundidad con 10–12 ventanas** en total, nunca 127 figuras ni 127 luces. Las columnas son 6 tiras repetidas por plano como mucho. Hay **un solo `burst()`** en toda la película (S10). `maxCoc` ≤ 8, bloom ≤ .45. Nunca más de 4 figuras humanas en un plano.

**Qué no repetir:**
- De *Jonás* (la plantilla): el arranque a oscuras con un punto de luz, el vientre, el mar, la tormenta y la playa. Las «costillas que se abren» se reutilizan solo como técnica (`belly().parts`), aplicada a cortinas y columnas.
- De *matusalen-y-el-diluvio*: la luz que retrocede, el camino de generaciones, las tres ventanas de la suma, las nubes que se abren y la piedra vacía.
- De *mefiboset-mesa-del-rey* (otro rey y otro palacio): la mesa y el banquete. Aquí no hay mesa.

## 1. Tres estructuras posibles

1. **Cronológica:** el banquete de Asuero (cap. 1), Ester elegida reina (cap. 2), el decreto de Amán (cap. 3), Mardoqueo (cap. 4) y la entrada (cap. 5).
   - Es clara, pero el gancho («puede morir si entra») llega a mitad del video.
   - Tres capítulos de contexto se comen las cifras, y aparecen Vasti y Amán, que no hacen falta.
2. ***In medias res* en la puerta:** abre con Ester ya vestida de reina ante las puertas del patio interior, al tercer día, y retrocede para contar por qué.
   - El gancho es fuerte, pero obliga a un *flashback* que en 45 s se confunde.
   - La puerta se vería dos veces igual y el clímax perdería la sorpresa del primer encuadre.
3. **La cuenta que se achica (elegida):** las cifras bajan, 127 → 30 → 3 → **1** (un solo gesto: el cetro), y el encuadre se estrecha con ellas.
   - 127 es el imperio entero visto desde la terraza de Susa; 30 es un solo cuarto con una puerta que no se abre; 3 son tres lámparas junto a ella; 1 es la punta del cetro que su mano toca.
   - La tensión sube mientras el espacio se cierra: del horizonte al pasillo, del pasillo al cuarto y del cuarto a dos manos.
   - En el clímax todo se abre de golpe (capas que se separan) y la película vuelve a la terraza del principio, ahora en oro.

**Por qué la 3:**
- El nombre, la cifra y el peligro se oyen en los primeros 5 s, y la imagen lo cuenta a la vez: una reina, un imperio y una puerta cerrada.
- Cada cifra tiene **un lugar** que Clawd recorre: la terraza (127), el aposento (30) y el rincón de las lámparas (3). Es el molde «una escena de Clawd por cifra» de los datos.
- La cuenta que baja hace sentir la presión sin contadores en pantalla: el mundo se hace pequeño hasta que solo queda una mano y un cetro.
- El color sigue el arco de la marca: crepúsculo violeta, noche de ciruela, la corte casi negra en el silencio y el oro del cetro que lo llena todo.

**Diferencias con la plantilla (Jonás), la demo del estilo (el tren) y matusalen-y-el-diluvio:**
- **Estructura:** una cuenta que baja y un espacio que se estrecha. No es *in medias res* ni una suma de generaciones.
- **Apertura:** una reina de pie en una terraza al crepúsculo, con Clawd sobre la baranda y el imperio en profundidad. No es oscuridad ni un anciano sentado.
- **Plano firma:** la corte vista de punta a punta, con Ester diminuta en un extremo y el trono en el otro, en silencio (S9). El clímax es un **cetro que gira hacia ella** y abre las capas de la corte a su paso; no son costillas ni nubes.
- **Cámara:** *dolly* hacia atrás de escala, viaje lateral por columnas, empuje a través de una rendija (marco dentro del marco), cámara fija con luz que pasa, inclinación hacia abajo, *rack focus* entre dos alturas, seguimiento por la espalda y *dolly* a través de capas que se abren.
- **Música:** un modo de color persa (re frigio dominante: re–mi♭–fa#–sol–la) en arpa y oboe que se resuelve a re mayor solo cuando ella toca el cetro. Un único golpe de campana, en «cetro».
- **Final:** la terraza del principio al amanecer, con todas las ventanas del imperio encendidas. No hay playa, arca ni piedra.

## 2. Idea y arco

**Logline:** Clawd, testigo dentro del palacio de Susa, acompaña a Ester mientras su mundo se encoge de 127 provincias a 30 días sin ser llamada y a 3 días de ayuno, hasta que todo depende de un solo gesto: el cetro de oro extendido hacia ella.

- **Planteamiento (0–13,8 s):** Ester, la reina de 127 provincias que no puede ver al rey. Clawd en Susa. La ley: quien entra sin ser llamado, muere, salvo el cetro de oro.
- **Presión (13,8–32,2 s):** 30 días sin ser llamada. El decreto contra su pueblo. Mardoqueo: «¿quién sabe si para esta hora…?». 3 días de ayuno. «Si perezco, que perezca.» **Silencio 1.**
- **Giro y clímax (32,2–40,4 s):** al tercer día entra. **Silencio 2** en la corte. El rey extiende el cetro de oro y Ester lo toca: las capas se abren y el oro atraviesa la caja.
- **Final (40,4–48 s):** la terraza en oro, la lección («para esta hora») y la pregunta de una palabra.

**Eco:**
- S1: crepúsculo violeta en la terraza. Ester de pie en la baranda y Clawd sobre ella; el imperio en profundidad con pocas ventanas encendidas, frías y lejanas.
- S11: el mismo encuadre al amanecer de oro. Todas las ventanas del imperio arden, y Ester ya no mira hacia fuera, sino al frente.

**Motivo de luz (el oro del cetro):**
- S2: una **rendija de oro** bajo las puertas cerradas del patio interior.
- S3: a través de la rendija, el destello del cetro sobre las rodillas del rey.
- S4 y S7: el oro desaparece (luz de día crema y luna pálida, lámparas ámbar que se apagan).
- S9: en el silencio, el único brillo de la corte es la punta del cetro.
- S10: ese punto crece hasta llenar toda la caja.
El cetro es **el único acento** de la película; la corona de Ester es de papel oscuro con borde de luz, no dorada, para no competir con él.

**Color (sin azul puro, para que el oro no dé verde; sin terracota detrás de Clawd):**
- **Crepúsculo de Susa (S1):** cielo `#e9c9a0` (horizonte) → `#7d6a92` (arriba), cordilleras lejanas `#8f7aa0`, medias `#5a4870`, terraza `#2a1d36`, frente `#110b18`; ventanas `#ffb862`.
- **Interior del palacio (S2, S3, S8):** muro del fondo `#b9a5b8` → columnas `#7a6480` → `#46344e` → frente `#1c1224`; rendija `#ffd98a`.
- **Aposento de Ester (S4, S7):** `#a99cb6` → `#6c5a80` → `#3a2c4a` → `#140c1c`; luz de día por la ventana `#f3dfb0`, luna `#d8cce0`, lámparas `#ffb862`.
- **Ciudad del decreto (S5–S6):** `#5a5068` → `#3c3248` → `#251c30` → `#0d0912`; ventanas ámbar débiles.
- **La corte en silencio (S9):** `#4a3c52` → `#2e2436` → `#18101e` → `#0c0810`; la punta del cetro `#ffd98a`.
- **Oro (S10–S11):** `#f8e6b4` → `#ecc77e` → `#c0904a` → `#604020` → `#1f140a`; luz `#ffd98a`. Cada capa se calienta con `tint` al recibir la luz.

**Clawd dentro de la historia:** es un testigo imaginario. Está en Susa desde el primer cuadro, no habla con Ester, Mardoqueo ni el rey, no los toca, no abre puertas y no cambia el relato.
- En los planos de cifras **recorre el lugar del dato**: señala el imperio desde la baranda (127), espera junto a la puerta del aposento (30) y se queda junto a las lámparas (3).
- En el ayuno (S7) y en la corte en silencio (S9) queda **quieto a un lado**, encogido (`tuck` .7–.8) y con el brillo bajado (`k` ≈ .5).
- Nunca cruza el umbral de la corte antes que Ester: se queda en la puerta.

## 3. Referencias

- **Las siluetas de Lotte Reiniger (las arquitecturas de arcos y cúpulas) y de Michel Ocelot.**
  - *Aprender:* lectura por silueta, la realeza dicha con la postura (erguida, el manto largo), los gestos mínimos y lentos, arcos en capas como bastidores.
  - *No tomar:* personajes, diseños, planos ni ningún palacio concreto.
- **Los relieves y columnas de la Persia aqueménida (Susa, Persépolis)** como referencia arqueológica.
  - *Aprender:* columnas altas y finas, escalinatas, la idea del patio interior y la sala del trono.
  - *No tomar:* copias de relieves; se recortan formas simples (fuste, capitel de doble remate sin detalle).
- **Lámparas de papel recortado (shadow box).**
  - *Aprender:* escalera de valores por capa, ventanas que arden y la rendija de luz bajo una puerta.
  - *No tomar:* ningún diseño concreto.

## 4. Guion (16 líneas, unas 105 palabras; se decide con la duración real de la voz)

Ninguna línea empieza con J ni con «Ge». La primera palabra es «Ester»: si el recorte de silencio se come la «E» inicial, se deja un margen previo de 80 ms en esa línea (no se cambia la palabra). En `voices/lines.json` las cifras van **en palabras**; en `timeline.py` los subtítulos van **en dígitos** y en oro.

| # | Voz | Subtítulo (*oro*) | Pausa después | Referencia |
|---|---|---|---|---|
| l01 | Ester es reina de un imperio de ciento veintisiete provincias… | *Ester* es reina de un imperio / de *127 provincias*… | .1 | gancho, 1:1 |
| l01b | y no puede ver al rey. | y *no puede ver al rey*. | .4 | 4:11 |
| l02 | Estoy con ella en Susa. | Estoy con ella en *Susa*. | .25 | 1:2 |
| l03 | Quien entra sin ser llamado, muere… | Quien entra *sin ser llamado*, / *muere*… | .15 | 4:11 |
| l03b | salvo que el rey extienda el cetro de oro. | salvo que el rey extienda / el *cetro de oro*. | .45 | 4:11 |
| l04 | Y a ella no la llaman hace treinta días. | Y a ella no la llaman / hace *30 días*. | .4 | 4:11 |
| l05 | Y hay un decreto contra todo su pueblo. | Y hay un *decreto* / contra *todo su pueblo*. | .35 | 3:13 |
| l06 | Mardoqueo le manda decir: | *Mardoqueo* le manda decir: | .1 | 4:13 |
| l06b | ¿quién sabe si para esta hora llegaste al reino? | ¿quién sabe si *para esta hora* / llegaste al reino? | .45 | 4:14 |
| l07 | Ella pide tres días de ayuno. | Ella pide *3 días de ayuno*. | .3 | 4:16 |
| l07b | «Y si perezco, que perezca.» | *«Y si perezco, que perezca.»* | **1.6 (silencio 1)** | 4:16 |
| l08 | Al tercer día, entra. | Al *tercer día*, *entra*. | **1.8 (silencio 2)** | 5:1 |
| l09 | El rey extiende el cetro de oro… | El rey extiende / el *cetro de oro*… | .2 | 5:2 |
| l09b | y Ester lo toca. | y *Ester lo toca*. | .5 | 5:2 |
| l10 | Quizás tú también llegaste para esta hora. | Quizás tú también llegaste / *para esta hora*. | .4 | eco de 4:14 |
| l11 | ¿Cuál es tu hora? Dilo en una palabra. | ¿Cuál es *tu hora*? / Dilo en *una palabra*. | hasta el final | CTA de una palabra |

- **Gancho que se entiende en 3 s:** «Ester» a los 0,3 s, «ciento veintisiete» hacia los 1,6–2,6 s y el giro «y no puede ver al rey» a los ~4 s. La imagen lo dice a la vez: una reina de pie con corona en una terraza, un imperio de cordilleras con ventanas, y Clawd en la baranda señalando lejos. Voz desde 0,3 s y música desde el 0.
- **Recorte si el render pasa de 48 s**, en este orden:
  1. l02 se funde con l03: «Aquí en Susa, quien entra sin ser llamado, muere…» (se mantiene el «aquí» que pone a Clawd en la escena).
  2. l05 → «Y hay un decreto contra su pueblo.»
  3. l06 desaparece y l06b queda como «Mardoqueo: ¿quién sabe si para esta hora llegaste al reino?».
  No se acelera la voz.
- **Whisper:** «Ester» puede salir «Esther»; «Mardoqueo» puede salir partido («Mardo queo»); «Susa» puede salir «Suza». Si el resto coincide, lo que oyó va en `asr`. «Perezco» puede salir «parezco»: **ese sí se corrige** escuchándolo; si la voz de verdad dice «parezco», se cambia el texto de la voz a «si yo perezco».
- **Título de YouTube:** «Ester llevaba 30 días sin ser llamada… ¿por qué entró igual? | Ester en cifras #shorts».
- **Descripción:** las referencias completas (Ester 1:1; 3:13; 4:11, 14, 16; 5:1–3), las tres cifras escritas, la nota de que en las Biblias católicas el libro trae además secciones griegas y otra numeración en algunos pasajes, y la aclaración de que Clawd es un testigo imaginario y de que el contenido se hizo con IA.

## 5. Lista de planos

Los tiempos son estimados; los definitivos salen de `tools/timeline.py` con la voz. Hay 11 planos y un cambio visual cada 3–4 s (S4 y S7 cambian de luz dentro del plano).

| # | Tiempo | Plano y acción | Cámara | Luz y color | Clawd | Por qué |
|---|---|---|---|---|---|---|
| 1 | 0–5,9 | **La terraza de Susa (127).** Ester de pie (`stand`, corona de papel oscuro con borde de luz, manto largo hasta el suelo) junto a una baranda de arcos, de perfil hacia el horizonte. Detrás, cuatro cordilleras en profundidad con 10–12 ventanas pequeñas repartidas (las provincias), las lejanas más pálidas. A la derecha, alta y lejana, la sala del trono con una ventana cerrada. La tira del título crece arriba a la izquierda: «ESTER EN CIFRAS» y, debajo, «Ester 1 · 4 · 5»; se retira a los 3,4 s. | Plano medio de Ester y Clawd que abre a plano general: *dolly* hacia atrás de escala; en «no puede ver al rey», *rack focus* a la sala del trono | Crepúsculo violeta; ventanas ámbar frías y lejanas | De pie sobre la baranda, a la izquierda de Ester (u ≈ .0030). En «ciento veintisiete» extiende un brazo y lo **barre** de la cordillera cercana a la lejana (el gesto de contar lo inabarcable). En «no puede ver al rey» baja el brazo y gira la cabeza hacia la sala del trono. | Gancho: nombre, cifra y escala desde el primer cuadro; el giro se ve como distancia entre la reina y el trono. El título es lo único escrito y no se subtitula. |
| 2 | 5,9–10,2 | **El pasillo de columnas.** Una tira larga de columnas finas (6 repetidas) en tres profundidades; al fondo, dos guardias en silueta, quietos, con lanzas verticales, a los lados de las grandes puertas del patio interior, cerradas. Bajo las puertas, una **rendija de oro**. En «muere», las lámparas del pasillo bajan un punto. | Viaje lateral a la derecha con paralaje, que termina frente a las puertas | Interior ciruela; la rendija es la única luz cálida | Camina por el primer término a la par de la cámara (posición fija respecto a ella), de la terraza hacia las puertas. En «Susa» mira arriba, a las columnas. En «muere» se detiene en seco y se encoge un poco (`tuck` .4). | Clawd en el palacio; la ley se ve como una puerta custodiada. |
| 3 | 10,2–13,8 | **La rendija.** Las dos hojas de la puerta llenan el cuadro, con un hueco vertical de luz entre ellas. A través del hueco, lejos: el rey sentado en su trono (`sit`) y, sobre sus rodillas, el **cetro de oro** (tira fina con remate) que destella en «cetro de oro». | Empuje lento hacia el hueco: marco dentro del marco | Las hojas casi negras; detrás, la sala templada y el destello del cetro | En primer término, pequeño, de espaldas a tres cuartos, asomado al hueco con una mano apoyada en la hoja (sin empujarla). | Siembra el cetro: el espectador lo ve antes de que importe. |
| 4 | 13,8–17,5 | **El aposento (30).** Ester sentada (`sit`) junto a una ventana alta; enfrente, la puerta del aposento, cerrada. Por la ventana, la luz **pasa** de día a noche varias veces seguidas (crema → luna pálida, unas 6 veces en 3 s, cada vez más rápido): el tiempo corre sin rótulos. Las sombras de los barrotes barren el suelo. | Cámara fija; solo cambia la luz (micro-deriva) | Aposento lila; la luz crema y luna alternan | Sentado en el suelo junto a la puerta, con la barbilla apoyada en los brazos. Con cada día que pasa **gira la cabeza hacia la puerta**: nadie entra. En «treinta» levanta las dos manos abiertas y las deja caer. | Cifra 2 vivida como espera: los días se ven pasar y la puerta no se abre. |
| 5 | 17,5–20,4 | **El decreto en la ciudad.** Desde las torres del palacio la cámara baja a la ciudad de Susa: casas en dos hileras con ventanas ámbar. En la plaza, un pregonero (silueta, `stand`) sostiene un rollo abierto **sin letras**. En «todo su pueblo» las ventanas de las casas se apagan una a una (5 ventanas, 0,2 s de desfase). | Inclinación hacia abajo, de las torres a la plaza | Ciudad del decreto: el tramo más oscuro | En la plaza, en primer término a la izquierda, mira el rollo y luego las ventanas que se apagan, brazos abajo. | La amenaza como luz que se retira, sin violencia y sin Amán. |
| 6 | 20,4–25,8 | **Dos alturas, una hora.** Un solo cuadro en dos profundidades: abajo y cerca, Mardoqueo sentado junto a la puerta del rey (`sit`, manto de cilicio sin detalle, 4:1–2); arriba y lejos, Ester en una ventana encendida del palacio. Entre los dos, un mensajero (`stand`, pequeño) sube una escalinata. En «para esta hora», la ventana de Ester se aviva. | *Rack focus* de Mardoqueo (cerca) a la ventana de Ester (lejos), con una leve inclinación hacia arriba | Ciudad nocturna; la ventana de Ester, ámbar | En la escalinata, a mitad de camino, mirando abajo a Mardoqueo y luego arriba a Ester. No lleva el mensaje: el mensajero lo lleva. | La frase central dicha con la puesta en escena: abajo el que pide, arriba la que puede ir. |
| 7 | 25,8–32,2 | **El ayuno (3).** El aposento de noche. Ester sentada con la cabeza baja; detrás, dos doncellas sentadas (4:16), más pequeñas. En el alféizar, **tres lámparas de aceite** encendidas. Pasan tres noches y días: con cada uno se apaga una lámpara (una por día). **Silencio 1:** tras «que perezca», se apaga la última y queda solo la luna en la ventana. | *Dolly* lento hacia atrás, luego fijo en el silencio | Aposento nocturno; tres llamas ámbar que se van | Sentado aparte, a la derecha, junto a las lámparas, **quieto**, `tuck` .8 y brillo `k` .5. No mira a Ester: mira las llamas. | Cifra 3 en la propia escena, sin contadores. El silencio cae justo antes de que ella decida entrar. |
| 8 | 32,2–33,8 | **Al tercer día, entra.** Las puertas de S2, ahora desde dentro del pasillo y por la espalda de Ester: de pie, con el manto real largo (5:1), avanza; las dos hojas se abren hacia los lados (cortina de primer término) y entra la luz templada de la corte. | Seguimiento por la espalda, a la altura del hombro, hasta el umbral | Primera luz del día en el pasillo; la corte templada al otro lado | Un paso detrás de ella, a la izquierda; **se detiene en el umbral** y no entra. | La acción decisiva corta y frontal; Clawd no cruza antes que ella. |
| 9 | 33,8–35,6 | **Silencio 2: la corte (plano firma).** La corte vista de punta a punta en una sola pila: el suelo en franjas que se alejan, columnas a los lados, Ester diminuta en el extremo cercano y el rey sentado en el trono al fondo. Nada se mueve. El único brillo es la **punta del cetro**. | Cámara fija, simétrica, plano general | Corte casi negra; un solo punto de oro | En el umbral, en el borde inferior izquierdo del cuadro, quieto, `tuck` .8, brillo `k` .5. | La distancia que puede matarla, sostenida en silencio total; el espectador espera con ella. |
| 10 | 35,6–40,4 | **Clímax: el cetro.** El rey alza la cabeza; el cetro **gira desde su rodilla hacia Ester** (lámina rígida que rota sobre la mano, como papel en un palo). A su paso, las capas de la corte (cuatro pares de columnas y cortinas, cortadas en mitades) se separan de atrás hacia delante con 0,25 s de desfase y el oro atraviesa la pila. Ester se acerca y su mano toca la punta: un solo `burst()` en «toca». | *Dolly* hacia dentro a través de las capas que se abren, hasta el plano detalle de la mano y la punta del cetro | De corte oscura a oro en 1,5 s; `tint` cálido capa a capa | Abajo a la izquierda, en primer término: alza la cabeza y levanta los brazos despacio cuando le llega la luz (anticipación, acción, reposo); brillo de vuelta a `k` 1. | El movimiento propio del papel en el pico emocional: la luz entra por un gesto, no por una figura. |
| 11 | 40,4–48,0 | **El eco: la terraza en oro.** El encuadre de S1 al amanecer: la misma baranda, Ester de pie ya de frente y, en las cuatro cordilleras, **todas las ventanas encendidas**. | Plano general que se cierra: *dolly* hacia dentro hasta el plano medio de Clawd | Oro de amanecer; cielo crema con el borde superior lila claro | Sobre la baranda, como en S1. En «tú» **se gira a cámara**; en «una palabra» levanta un brazo. | Cierre que hace eco del principio: el imperio de la cifra 127 ahora iluminado. El último subtítulo dura hasta el final. |

**Movimientos de cámara usados:** *dolly* hacia atrás de escala, viaje lateral, empuje a través de una rendija, cámara fija con solo luz, inclinación hacia abajo, *rack focus* entre alturas, seguimiento por la espalda, plano simétrico fijo y *dolly* a través de capas que se abren.

**Transiciones dentro del medio:** fundidos de luz (crepúsculo → pasillo, aposento → ciudad), una cortina de primer término (las puertas que se abren, S7 → S8 → S9), el apagado de las lámparas del silencio 1 y las capas que se separan en el clímax. Nada de barridos.

**Encuadre vertical:**
- La banda inferior (350 px) queda oscura en todos los planos: suelo o baranda casi negra en primer término. En S10–S11 se añade una banda tenue detrás del texto si hace falta.
- Ninguna ventana, lámpara, rendija ni la punta del cetro cae en la banda de subtítulos ni sobre la tira del título. En S10 la mano y el cetro quedan por encima del 60 % de la altura.
- Hay que comprobar que Clawd no sale del cuadro en el *dolly* de S10 y en el de S11, y que en S9 sigue legible (cabeza visible, u ≥ .0022).

## 6. Mapa de música y sonido

**Tempo:** 60 bpm (1 s por tiempo) en S1–S6 y en S11; tempo libre de S7 a S10. Sin batería: solo golpes sueltos.

**Paleta:**
- `oboe`: el motivo de Ester, tres notas descendentes en modo frigio dominante (la–sol–fa#), que suena a corte persa sin imitar una melodía concreta.
- `harp`: ostinato en re frigio dominante (re–mi♭–fa#–sol–la).
- Cuerdas graves y `cello`: dron.
- `celesta`: usa los sonidos de glockenspiel.
- `tubular_bells`: un solo golpe.
- `french_horn`: suena con el sonido `horn`.
- `timpani`: siempre con nota (`'D3'`), como tambor de marco suave.

| Sección | Planos | Música | Ambiente | Foley |
|---|---|---|---|---|
| La terraza (127) | 1 | Ostinato de arpa desde el segundo 0; el motivo de oboe entra con «ciento veintisiete» | Viento de crepúsculo, golondrinas lejanas | Roce de papel del título; tela del manto |
| El pasillo | 2 | Arpa y un `timpani` `'D3'` suave por cada dos columnas | Eco de sala grande (cola larga) | Pasos de Clawd sobre piedra; un tintineo metálico leve de las lanzas en «muere» |
| La rendija | 3 | El arpa se detiene; nota larga de cuerdas | La sala del trono, un murmullo lejano, sin voces | Brillo de `celesta` en «cetro de oro» |
| El aposento (30) | 4 | El motivo de oboe se repite cada vez más rápido con las luces | Pájaros de día y grillos de noche que se alternan con la luz (J-cut: cada uno entra 0,2 s antes de su luz) | Roce de los barrotes de sombra |
| El decreto | 5 | Dron grave de `cello` que entra por debajo | Ciudad nocturna, perros lejanos | Papel del rollo que se abre; un click apagado por cada ventana que se apaga |
| Dos alturas | 6 | Arpa sola con el motivo una tercera más arriba en «para esta hora» | Ciudad nocturna | Pasos del mensajero en la escalinata |
| El ayuno (3) | 7 | Solo dron, que adelgaza | Grillos; viento suave en la ventana | **Un soplo de llama por cada lámpara que se apaga** |
| **Silencio 1** | final del 7 | **Nada** (≤ −55 dB) durante ~1,6 s; los grillos mueren dentro (L-cut) | Tono de sala | — |
| Al tercer día | 8 | Primer sonido tras el silencio: **el roce grave de las puertas al abrirse** con un `timpani` `'D3'` | Eco de la corte que entra antes de verla (J-cut) | Tela del manto, pasos de Ester |
| **Silencio 2** | 9 | **Nada** (≤ −55 dB) durante ~1,8 s | Tono de sala | — |
| **Clímax** | 10 | Primer sonido tras el silencio: **un golpe de `tubular_bells` (re) con un re grave de cuerdas** en «cetro». Arpegio de arpa, cuerdas y `horn` que crecen; el modo se **resuelve a re mayor** en «toca» | — | Un roce de papel por cada par de capas que se abre, escalonado; brillo ascendente de la lámpara en «toca» |
| El eco | 11 | El motivo de oboe del principio, ahora **ascendente y resuelto** (re–fa#–la); arpa sostenida bajo el CTA | Viento de amanecer y golondrinas | Un roce cuando Clawd se gira |

**Puntos de sincronía:**
- El barrido del brazo de Clawd en S1 empieza en «ciento».
- Clawd se detiene en «muere» (S2).
- El destello del cetro en S3 cae en «oro».
- Las luces de S4 se aceleran hasta «treinta».
- Cada ventana de S5 se apaga a partir de «todo».
- La ventana de Ester se aviva en «hora» (S6).
- La última lámpara de S7 se apaga en la última sílaba de «perezca».
- La campana cae en «ce-» de «cetro» (S10); el `burst()` y el acorde mayor, en «toca».
- Clawd se gira en «tú» (S11).

**Transiciones sonoras:**
- El eco del pasillo entra antes del corte de S1 a S2 (J-cut).
- Los grillos mueren dentro del silencio 1 (L-cut).
- El eco de la corte entra antes de que se abran las puertas (J-cut, S8).
- El viento de amanecer entra 0,5 s antes de S11 (J-cut).

**Comprobación:** hay que medir por tramos que los dos silencios existen de verdad en la mezcla final, los dos por debajo de −55 dB.

**Mezcla:** voz al frente (RMS ~−18 dB), música 5–6 dB por debajo bajo la voz, foley entre −24 y −34 dB, final a −14 LUFS.

## 7. Subtítulos y título

- Serif blanco cálido, grande para móvil, sobre la banda oscura inferior (`bottom: 350px`), sin tapar figuras, ventanas, la rendija ni el cetro.
- Palabras clave en oro: *Ester*, *127 provincias*, *no puede ver al rey*, *Susa*, *sin ser llamado*, *muere*, *cetro de oro*, *30 días*, *decreto*, *todo su pueblo*, *Mardoqueo*, *para esta hora*, *3 días de ayuno*, *«Y si perezco, que perezca.»*, *tercer día*, *entra*, *Ester lo toca*, *tu hora* y *una palabra*.
- Título solo al principio: tira de papel «ESTER EN CIFRAS» (Cinzel 800) con «Ester 1 · 4 · 5» (Playfair cursiva) debajo, colocada en función de la cámara, de 0,2 a 3,4 s. Esas palabras no se dicen ni se subtitulan.
- **Ningún otro texto ni número en pantalla:** el rollo del decreto no lleva letras, no hay calendario, marcas de días, contadores, mapas rotulados, tarjetas, iconos ni CTA gráfico. Las cifras viven en la voz, los subtítulos, las luces de S4, las tres lámparas de S7 y la descripción.
- Máximo ~26 caracteres por línea y dos líneas. El último subtítulo (el CTA) dura hasta el final.

## 8. Qué hay que construir (sin motor nuevo)

**`actors.js`** (de la plantilla y de los videos anteriores):
- `human()` con `stand`, `sit` y una opción nueva `crown` (corona de papel oscuro de tres puntas sobre la cabeza, con borde de luz) y otra `robe` (manto largo hasta el suelo, para Ester y para el rey).
- `cetro()`: tira fina dorada con un remate redondo, en una lámina aparte con su pivote en la mano del rey; es la única lámina dorada de la película y lleva su propio brillo emisivo.
- `trono()`: respaldo alto y escalón, siempre lejano.
- `columnas()`: fuste fino con capitel de doble remate, repetido en tiras (máx. 6 por capa).
- `puertas()`: dos hojas altas con la rendija emisiva entre ellas y debajo; se abren como cortina de primer término.
- `lampara()`: lámpara de aceite con una llama emisiva que se apaga por separado (×3).
- `rollo()`: rollo de papel liso, sin letras.

**`shots.js`** (se quitan `belly`, el mar y la playa de Jonás):
- `terraza(S, o)`: cielo, cuatro cordilleras con 10–12 ventanas, baranda de arcos y la sala del trono a lo lejos. Colores por parámetro (crepúsculo y amanecer). La usan S1 y S11.
- `pasillo(S, o)`: tira larga de columnas y las puertas con la rendija. La usan S2 y S8 (desde el otro lado).
- `aposento(S, o)`: ventana alta con barrotes, puerta y alféizar; la luz de la ventana por parámetro (ciclo día/noche, luna). La usan S4 y S7.
- `ciudad(S, o)`: torres, dos hileras de casas con ventanas, plaza y escalinata. La usan S5 y S6.
- `corte(S, o)`: suelo en franjas, columnas y cortinas en pares cortados en mitades (técnica de `belly().parts`) y el trono al fondo. La usan S3 (a través de la rendija), S9 y S10.

**`timeline.py`:** momentos clave `nombre`, `ciento27`, `no_puede`, `susa`, `muere`, `cetro1`, `treinta`, `decreto`, `pueblo`, `mardoqueo`, `hora`, `ayuno`, `perezca`, `sil1`, `entra`, `sil2`, `cetro`, `toca`, `tu`, `cta`.

**`voices/lines.json`:** se reemplazan todas las líneas de Jonás; las cifras van en palabras.

**Grade:** cada plano vuelve a sus valores por defecto en cada cuadro, para que la oscuridad de S7–S9 no se arrastre.

## 9. Portada

- **Imagen:** el umbral de S8–S9 a escala de portada. Clawd grande (u ≈ .0036) en primer término abajo a la izquierda, de pie en el umbral, mirando al espectador con un brazo señalando hacia dentro de la corte.
  - Detrás, Ester en silueta con corona y manto largo, de espaldas, a punto de entrar; al fondo, el trono y el **cetro de oro extendido** hacia ella, que es el punto más brillante del cuadro y une a los dos.
  - Arriba, una zona oscura de columnas en ciruela casi negro para el texto (nada de fondo claro detrás de las letras).
- **Gancho (5 palabras, Cinzel, entre 270 y 700 px desde arriba):** «ESTER: 30 DÍAS SIN LLAMARLA», con «30» en oro y el resto en crema.
- El 20 % inferior queda vacío (suelo oscuro).

## 10. Reglas de fidelidad

- **Solo los hechos del texto:**
  - Asuero (Jerjes) reina desde la India hasta Etiopía sobre **127 provincias** (1:1). Ester es su reina (2:17). La voz dice «reina de un imperio de 127 provincias»: el que reina sobre ellas es el rey, y la imagen lo deja claro (el trono lejano).
  - La ley: quien entra al patio interior sin ser llamado muere, salvo que el rey extienda el cetro de oro; Ester **no ha sido llamada hace 30 días** (4:11). Esto lo dice Ester en el texto; Clawd lo resume.
  - Hay un decreto para destruir a los judíos (3:13). Se nombra solo como «un decreto contra todo su pueblo», sin fechas ni cifras de muertos.
  - Mardoqueo le manda decir «¿Y quién sabe si para esta hora has llegado al reino?» (4:14). La voz lo parafrasea **como pregunta**, nunca como afirmación.
  - Ester pide que ayunen por ella **3 días**, noche y día; ella y sus doncellas también; «y si perezco, que perezca» (4:16).
  - Al tercer día se viste el vestido real y entra al patio interior; el rey la ve, extiende el cetro de oro y Ester toca la punta (5:1–2). La oferta de «hasta la mitad del reino» (5:3) va solo en la descripción.
- **Sin oración inventada:** el texto hebreo habla de ayuno, no de oración. Ni la voz ni la imagen dicen que oró; en S7 está sentada con la cabeza baja, no de rodillas con las manos alzadas.
- **Dios en el libro de Ester:** **no se dice** «Dios no aparece en Ester» ni ningún dato sobre su nombre. Es exacto para el texto hebreo, pero las Biblias católicas (las de buena parte del público) incluyen las secciones griegas, donde Dios sí se nombra y Ester ora. Por la misma razón, las referencias van según la RVR1960 y la descripción avisa que en algunas Biblias católicas la numeración de los capítulos 4–5 incluye esas secciones.
- **Dios no se dibuja como persona:** la luz del clímax nace del cetro y de las capas que se abren; no hay figura en el cielo ni rayos desde arriba sobre Ester.
- **Sin violencia:** Amán no aparece (ni su caída ni la horca). El decreto es un rollo sin letras y ventanas que se apagan. Los guardias están quietos y no amenazan a nadie.
- **Personajes:** Ester, el rey, Mardoqueo, el mensajero, las doncellas, el pregonero y los guardias son siluetas serenas, sin caricatura ni sensualidad; Ester siempre con manto largo. El rey no se muestra enojado ni amenazante.
- **Clawd** es un testigo imaginario: no habla con nadie, no lleva mensajes, no abre puertas, no entra antes que Ester y no cambia los hechos. En el ayuno y en la corte queda quieto a un lado. La descripción lo aclara y declara que el contenido se hizo con IA.
- **Las cifras no se interpretan:** sin numerología del 3, del 30 ni del 127. Clawd las dice y las vive en la escena.
- **CTA:** una pregunta de una palabra. Sin «Etiqueta», sin «SÍ o NO» y sin «AMÉN».
