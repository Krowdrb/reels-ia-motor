# La cuenta de Matusalén — Tratamiento

**Estilo:** `clawd-papel` sobre Paper-cut Lightbox (`styles/paper-lantern`). **Formato:** vertical 1080×1920, 30 fps, objetivo 44–47 s (tope 50 s), −14 LUFS.
**Idioma:** español latino, voz Kokoro `ef_dora`, `lang: es-419`, velocidad 1.0, limpia y sin efectos; subtítulos quemados con palabras clave en oro y `.srt`.
**Subnicho:** Biblia: datos, personaje famoso + máximo 3 cifras (187, 182 y 600, y su suma, 969). **SLUG:** `matusalen-y-el-diluvio`. Mantiene el CTA de una palabra.
**Fuente:** Génesis 5:25 (187 y Lamec), 5:27 (969 años), 5:28–29 (182, Noé, «este nos consolará»), 7:6 (Noé, 600 años, el diluvio); 1 Pedro 3:20 (la paciencia de Dios esperaba mientras se preparaba el arca); 2 Pedro 3:9 (de fondo para «te espera»). Reina-Valera 1960 como texto de control.

**Render en CPU** (SwiftShader, `SSAA=1`): máximo 9 capas por plano, sin partículas. La lluvia son 3 hojas grandes rayadas que se deslizan, no gotas sueltas. Las tablas del arca son 8 tiras, y hay **un solo `burst()`** en toda la película (S9). `maxCoc` ≤ 8 y bloom ≤ .45.

**Qué no repetir:**
- De *edades-en-la-biblia* no se toma la comparación de edades de muchos personajes: aquí hay una sola cuenta.
- De *arca-de-noe* no se toman la construcción vista de cerca, la puerta que se cierra, la paloma ni el arcoíris.

## 1. Tres estructuras posibles

1. **Cronológica por generaciones:** Enoc → Matusalén → Lamec → Noé → diluvio, un personaje por plano.
   - Es clara, pero se queda en una lista de nombres.
   - El gancho («murió el año del diluvio») llegaría al final sin promesa previa.
   - Clawd tendría que cambiar de sitio en cada plano.
2. **Cuenta atrás desde el diluvio:** abre con la lluvia ya cayendo y retrocede generación por generación.
   - El gancho es fuerte, pero el primer plano sería oscuro y gris, justo lo que las métricas castigan.
   - La suma va al revés (600 → 182 → 187) y cuesta seguirla de oído.
3. **Una vida en una sola lámpara (elegida):** el primer plano es Matusalén anciano a la puerta de su tienda, al atardecer, con Clawd sentado a su lado. La pregunta queda abierta: «¿Sabes qué pasó el año en que murió?».
   - La luz **retrocede** (el sol vuelve a subir) y la película recorre un **camino de generaciones** con un viaje lateral: Matusalén con Lamec en brazos, Lamec con Noé, Noé con el arca a lo lejos.
   - En la suma la cámara se aleja y se ven los tres lugares a la vez. Cada cifra enciende uno de ellos, con Clawd señalando.
   - El mismo encuadre del principio vuelve dos veces: con la piedra vacía bajo la tormenta y, al final, al amanecer de oro.

**Por qué la 3:**
- El personaje y la cifra se oyen antes de los 2 s, y la pregunta deja abierto un hueco que se cierra a los 23 s.
- Clawd está en la escena desde el primer cuadro y es **el punto fijo**: el tiempo pasa a su alrededor (la luz retrocede, crecen hijo y nieto, el cielo se nubla) y él sigue ahí.
- La suma se **ve** sin números: tres luces que se encienden en orden.
- El color sigue el arco que pide la marca: el dorado del atardecer de Matusalén pasa a la tormenta gris y termina en un amanecer de oro.

**Diferencias con la plantilla (Jonás), la demo del estilo (el tren) y arca-de-noe:**
- **Estructura:** una cuenta que avanza por generaciones con una luz que retrocede. No es *in medias res* ni una escala vivida.
- **Apertura:** un anciano y Clawd sentados al atardecer. No es la oscuridad con un punto de luz ni el pie de un casco.
- **Plano firma:** el camino de generaciones que se ve entero en profundidad, con tres luces que se encienden con la suma. El clímax son nubes en pares que se abren y no costillas.
- **Cámara:** luz que retrocede con la cámara fija, viaje lateral, grúa hacia atrás y un espejo de encuadre (S1, S7 y S11).
- **Música:** un motivo de oboe de tres notas que sube con la suma y se queda sin resolver; la campana solo suena en «969».
- **Final:** la misma piedra del principio, ahora al amanecer. No hay playa, cima ni arcoíris.

## 2. Idea y arco

**Logline:** Clawd, sentado junto a Matusalén, hace con el espectador la cuenta de tres generaciones (187 + 182 + 600) y descubre que el hombre que más vivió en la Biblia murió el mismo año del diluvio: Dios esperó una vida entera.

- **Planteamiento (0–13,8 s):** Matusalén y su cifra, y la pregunta. La luz retrocede a su juventud: 187, Lamec. Viaje lateral: 182, Noé, «este nos consolará».
- **Giro (13,8–31,3 s):** 600, el diluvio. La suma con tres luces. **Silencio 1.** «969. El mismo año». La piedra vacía, la tormenta, «la Biblia no dice cómo». **Silencio 2.**
- **Final (31,3–44,5 s):** las nubes se abren y el oro atraviesa todas las capas. «Dios esperó una vida entera.» El arca en paz, y el mismo encuadre del principio al amanecer, con la pregunta.

**Eco:**
- S1: atardecer, Matusalén sentado en su piedra y Clawd en la piedra baja de al lado; el sol se pone a la derecha.
- S7: el mismo encuadre bajo la tormenta, con la piedra vacía.
- S11: el mismo encuadre al amanecer de oro. El sol sale donde se puso, y el arca en reposo se ve diminuta en el horizonte.

**Motivo de luz:** la ventana ámbar de la tienda de Matusalén se enciende en S1, es la primera de las tres luces de la suma (S6) y la última que queda en el silencio 1. En S7 está apagada. En el silencio 2, la única luz es la ventana del arca, del mismo ámbar. La luz pasa de una casa a la otra sin decir cuándo ni cómo.

**Color:**
- **Atardecer de Matusalén (S1):** cielo con degradado `#f3d9a4` (horizonte) → `#8a7aa0` (arriba), montes lejanos `#9d86a6`, montes medios `#5e4a6a`, tierra `#2a1f30`, frente `#120c16`; sol `#ffd38a`, ventana `#ffb862`.
- **Mañana y mediodía (S2–S4):** `#f1e6c8` → `#cdb98e` → `#86705a` → `#3a2a22` → `#140e0c`. Es un crema cálido sin azul (junto al oro daría verde) y sin terracota detrás de Clawd.
- **Gris que llega (S5–S6):** `#c2b8b8` → `#918690` → `#57505a` → `#2a242c` → `#100c12`.
- **Tormenta (S7–S8):** `#4c4656` → `#38323f` → `#25202b` → `#0c0a0e`; hojas de lluvia `#7a7484` al 35 %.
- **Oro (S9–S11):** `#f8e6b4` → `#ecc77e` → `#c0904a` → `#604020` → `#1f140a`; luz `#ffd98a`. Cada capa se calienta con `tint` al recibir la luz, para que el oro no dé verde.
- **Un solo acento:** el ámbar de las ventanas (Matusalén y luego el arca). Clawd es el único naranja fuerte.

**Clawd dentro de la historia:** es un testigo imaginario. No habla con Matusalén, Lamec ni Noé, no los toca, no ayuda a construir y no cambia el relato.
- Se sienta, camina, señala las luces y mira.
- En los momentos solemnes (S7, la piedra vacía; S8, la lluvia y el silencio 2) queda quieto, encogido (`tuck`) y con su brillo bajado (`k` ≈ .5).

## 3. Referencias

- **Las siluetas de Lotte Reiniger y de Michel Ocelot.**
  - *Aprender:* lectura por silueta, edad dicha con la postura (erguido, con cayado, sentado), gestos mínimos.
  - *No tomar:* personajes, diseños ni planos concretos.
- **Los planos fijos de «una vida en un mismo lugar»** del cine que cuenta décadas con un solo encuadre y cambios de luz.
  - *Aprender:* el encuadre que se repite, de modo que el espectador ve el paso del tiempo sin rótulos.
  - *No tomar:* ningún encuadre concreto.
- **Lámparas de papel recortado (shadow box).**
  - *Aprender:* escalera de valores por capa, montes como bastidores, ventanas que arden.
  - *No tomar:* ningún diseño concreto.

## 4. Guion (unas 108 palabras; se decide con la duración real de la voz)

> **Nota del guionista (2026-11-18): el guion final cambia los ids.** Mandan `voices/lines.json` y `SCRIPT` de `tools/timeline.py` (22 líneas, 114 palabras), no la tabla de abajo. Cambios: nueva `l01b` «Estoy sentada a su lado» (Clawd dentro de la escena; narradora en femenino); la pregunta pasa a `l02`; 187/Lamec = `l03`+`l03b`; 182/Noé = `l04`+`l04b`+`l04c` («este nos consolará»); 600/diluvio = `l05`+`l05b`; la suma = `l06` («Suma conmigo, con las cifras del texto:») + `l06b` (187 + 182) + `l06c` (+ 600) y **silencio 1 (1,6 s) tras `l06c`**; 969 = `l07`+`l07b`; «La Biblia no dice cómo» = `l08` (se quitó «Solo nos deja la cuenta») y **silencio 2 (1,5 s) tras `l08`**; clímax `l09`+`l09b`+`l09c`; `l10` «te espera»; CTA `l11`+`l11b`. En `timeline.py` quedan los momentos clave de §8 con los nombres del tratamiento (por ahora en el inicio de cada línea: el animador los afina con los onsets reales) y `SHOTS` reasignado a los ids nuevos con el mismo reparto de planos. `src/shots.js` y `mix.py` siguen con los ids de Jonás. Si la voz real pasa de 50 s, se recorta primero `l04b`+`l04c` (fusionando en «tuvo a Noé.»), luego `l09b`+`l09c`; `l01b` no se quita (pone a Clawd en la escena), y no se acelera la voz.

Ninguna línea empieza con J ni con «Ge» (el recorte de silencio se come la consonante). En `voices/lines.json` las cifras van **en palabras**, y en `timeline.py` los subtítulos van **en dígitos**, en oro, para que la suma se lea. Si el render pasa de 48 s, se recorta en este orden:
1. la línea 4b («Y lo llamó Noé…»);
2. «Solo nos deja la cuenta» (la línea 8 queda en «La Biblia no dice cómo»).

| # | Voz | Subtítulo (*oro*) | Pausa después | Referencia |
|---|---|---|---|---|
| 1 | Matusalén vivió novecientos sesenta y nueve años. | *Matusalén* vivió *969 años*. | .15 | gancho, 5:27 |
| 1b | ¿Sabes qué pasó el año en que murió? | ¿Sabes qué pasó / el *año en que murió*? | .45 | |
| 3 | A los ciento ochenta y siete, tuvo a su hijo Lamec. | A los *187*, / tuvo a su hijo *Lamec*. | .3 | 5:25 |
| 4 | Lamec, a los ciento ochenta y dos, tuvo a Noé. | Lamec, a los *182*, / tuvo a *Noé*. | .15 | 5:28 |
| 4b | Y lo llamó Noé: «este nos consolará». | Y lo llamó Noé: / *«este nos consolará»*. | .4 | 5:29 |
| 5 | Noé tenía seiscientos años cuando llegó el diluvio. | Noé tenía *600 años* / cuando llegó el *diluvio*. | .35 | 7:6 |
| 6 | Suma conmigo: ciento ochenta y siete, más ciento ochenta y dos, más seiscientos… | Suma conmigo: / *187 + 182* · *+ 600*… | **1.6 (silencio 1)** | |
| 7 | Novecientos sesenta y nueve. | *969*. | .35 | 5:27 |
| 7b | Murió el mismo año del diluvio. | Murió *el mismo año* / del diluvio. | .45 | 5:27 + 7:6 |
| 8 | La Biblia no dice cómo. Solo nos deja la cuenta. | La Biblia *no dice cómo*. / Solo nos deja la cuenta. | **1.8 (silencio 2)** | |
| 9 | Dios esperó una vida entera. | *Dios esperó* / *una vida entera*. | .35 | |
| 9b | Su paciencia esperaba mientras se preparaba el arca. | Su *paciencia* esperaba / mientras se preparaba el arca. | .45 | 1 Pe 3:20 |
| 10 | Y hoy también te espera a ti. | Y hoy también *te espera* a ti. | .4 | 2 Pe 3:9 |
| 11 | ¿Qué le dirías? Dilo en una palabra. | ¿Qué le dirías? / Dilo en *una palabra*. | hasta el final | CTA de una palabra |

- **Gancho que se entiende en 3 s:** a los ~1,2 s ya se oye «Matusalén… novecientos», la cifra termina hacia los 2,4 s y la pregunta llega a los 4,6 s. La imagen lo dice a la vez: un anciano a la puerta al atardecer, Clawd a su lado levantando los brazos y una franja de nube oscura en el horizonte. La voz arranca a 0,3 s y la música desde el 0.
- **La línea 6** se parte en dos subtítulos («Suma conmigo: 187 + 182» / «+ 600…»). El «+» solo aparece en el subtítulo porque la voz dice «más».
- **Whisper:** «Matusalén» puede salir «Matusalem» y «Lamec» puede salir «Lamek». Si el resto coincide, lo que oyó va en `asr`. Hay que revisar también «ciento ochenta y dos» frente a «ciento ochenta y dos más».
- **Título de YouTube:** «Matusalén vivió 969 años… ¿y en qué año murió? | La cuenta que nadie hace #shorts».
- **Descripción:** las referencias completas; la nota «según las cifras del texto hebreo, el que siguen las Biblias católicas y evangélicas en español»; y la aclaración de que Clawd es un testigo imaginario y de que el contenido se hizo con IA.

## 5. Lista de planos

Los tiempos son estimados; los definitivos salen de `tools/timeline.py` con la voz. Hay 11 planos y un cambio visual cada 3–4 s (S6 tiene tres luces internas).

| # | Tiempo | Plano y acción | Cámara | Luz y color | Clawd | Por qué |
|---|---|---|---|---|---|---|
| 1 | 0–5,0 | **La puerta al atardecer.** Matusalén anciano (`sit`, cayado en una lámina aparte) en una piedra ante su tienda de pieles, con la ventana encendida. Sol bajo a la derecha y una franja de nube oscura en el horizonte. La tira del título crece arriba a la izquierda: «LA CUENTA QUE NADIE HACE» y, debajo, «Génesis 5 · 7»; se retira a los 3,4 s. | Plano conjunto, *dolly* lento hacia dentro y micro-deriva | Escalera de atardecer; sol `#ffd38a` | Sentado en una piedra baja, a la derecha de Matusalén (u ≈ .0030, `tuck` .6), mirándolo. En «novecientos» sube los dos brazos despacio (asombro). En la pregunta gira la mirada hacia la nube del horizonte. | Gancho: personaje, cifra y escala desde el primer cuadro. El título es lo único escrito y no se subtitula. |
| 2 | 5,0–8,4 | **La luz retrocede.** Mismo encuadre: el sol **vuelve a subir** por la izquierda del cielo y la luz pasa a mañana. La silueta sentada se funde (0,6 s) con Matusalén de pie, erguido y sin cayado, con un recién nacido envuelto **entre las palmas** (`two: true`). | Cámara fija; solo cambia la luz; *rack focus* de Clawd a Matusalén | De dorado de atardecer a crema de mañana; las sombras giran | En el mismo sitio (es el punto fijo), se pone de pie (`tuck` 1 → 0) y mira el bulto; en «Lamec» sube un brazo. | El movimiento propio de la lámpara al revés: el tiempo vuelve atrás sin rótulos. Cifra 1. |
| 3 | 8,4–11,3 | **El camino de las generaciones.** Una tira larga de camino; la cámara pasa junto a Matusalén (`stand`, ya con cayado) y llega a una segunda tienda donde Lamec (`stand`, `two`) sostiene a un recién nacido. | Viaje lateral a la derecha, con paralaje en 4 profundidades | Mediodía crema; el sol ya alto | Camina por el primer término a la par de la cámara (posición fija respecto a ella), de Matusalén a Lamec. Se detiene en «Noé». | Cifra 2 con el tiempo como distancia recorrida. |
| 4 | 11,3–13,8 | **La lámpara de Lamec.** Inserto: dentro de la tienda de Lamec se enciende una lámpara pequeña junto al niño, en «consolará». | Plano medio; *dolly* corto hacia dentro | Penumbra cálida; lámpara ámbar | En primer término a la derecha, pequeño y de perfil, con la cara iluminada de lado por la lámpara. Quieto. | El nombre de Noé como esperanza, dicho con una luz. |
| 5 | 13,8–16,7 | **El arca a lo lejos.** Noé adulto (`stand`) en el plano medio con un brazo que sube y baja (trabajo). En el horizonte, el casco del arca se levanta **tabla a tabla** (8 tiras que suben con 0,25 s de desfase). Las primeras capas de nube entran por arriba. | Inclinación hacia arriba, de Noé al cielo | La mañana se enfría a gris; nubes `#918690` | En una loma en primer término, pequeño, mira el arca y después el cielo. Su escala la da Noé. | Cifra 3. El arca solo se ve en el tramo de Noé y sin fecha. |
| 6 | 16,7–22,6 | **Plano firma: la suma.** El camino entero en profundidad, en un solo cuadro: la tienda de Matusalén al fondo a la izquierda, la de Lamec en medio a la derecha y el arca terminada en el horizonte. Las tres ventanas, apagadas, se encienden una a una en «187», «182» y «600». **Silencio 1:** todo baja hasta que solo queda la ventana de Matusalén. | Grúa hacia atrás y hacia arriba; cámara fija durante el silencio | Gris que llega; tres puntos ámbar | De pie en el centro del camino. Con cada cifra **señala** la luz que se enciende (brazo izquierdo, derecho y los dos), con anticipación y reposo. En el silencio baja los brazos y mira la última ventana. | Clawd «mide» la cifra en la lámina: la suma se ve como tres luces, sin números. |
| 7 | 22,6–26,6 | **La piedra vacía.** El encuadre de S1: la piedra de Matusalén está vacía, con el cayado apoyado, y la ventana de la tienda, apagada. En «el mismo año» la cámara sube a un cielo cubierto de nubes en capas. | Encuadre de S1; inclinación lenta hacia arriba | Gris violáceo que pasa a tormenta; ninguna luz cálida | Sentado en su piedra baja, como en S1, mira la piedra vacía; brazos abajo, `tuck` .8, brillo `k` .5. | El espejo: el espectador recuerda S1 y ve la ausencia. No muestra cómo murió. |
| 8 | 26,6–31,3 | **La lluvia.** Tres hojas de lluvia rayada se deslizan en diagonal a distinta velocidad. El arca, con su ventana encendida, está en el plano medio sobre una franja de agua que sube. **Silencio 2:** la caja se apaga capa por capa (0,4 s de desfase) hasta que solo quedan la ventana del arca y el leve brillo de Clawd. | Plano general; *dolly* muy lento hacia atrás, luego fijo | Tormenta; la única luz es la ventana del arca, del mismo ámbar que la de Matusalén | En una roca alta en primer término a la izquierda, de espaldas a tres cuartos, quieto y encogido. | Sobriedad: el diluvio como lluvia y agua, sin víctimas. El motivo de luz pasa al arca. |
| 9 | 31,3–34,8 | **Clímax: las nubes se abren.** Del punto de la ventana nace la luz. Las capas de nube (cada una cortada en mitades) se separan de atrás hacia delante con 0,25 s de desfase y el oro atraviesa la pila; un solo `burst()` en «entera». | *Dolly* hacia dentro, a través de las nubes que se abren | De tormenta a oro en 1,5 s; `tint` cálido capa a capa | Abajo en el centro: alza la cabeza y levanta los brazos despacio cuando le llega la luz (anticipación, acción, reposo). | Acción propia del papel en el pico emocional. Dios solo como luz. |
| 10 | 34,8–38,6 | **El arca en oro.** El arca en reposo sobre agua en calma que brilla; la ventana sigue encendida. | *Rack focus* de Clawd (primer término) al arca, luego *dolly* lento hacia atrás | Oro pleno | Sentado al borde de la roca, a la izquierda, mirando el arca; brillo de nuevo a `k` 1. | «Mientras se preparaba el arca»: la paciencia y su fruto en una imagen en calma. |
| 11 | 38,6–44,5 | **El eco.** El encuadre de S1 al amanecer: la piedra grande y la baja, charcos que brillan, el sol saliendo a la derecha y el arca diminuta en el horizonte. | Plano conjunto, *dolly* hacia dentro hasta el plano medio de Clawd | Oro de amanecer; cielo crema con el borde superior lila claro | Sentado en su piedra baja, como en S1. En «te espera a ti» se gira a cámara y en «una palabra» levanta un brazo. | Cierre que hace eco del principio. El último subtítulo dura hasta el final. |

**Movimientos de cámara usados:** *dolly* in y out, cámara fija con solo luz (también hacia atrás en el tiempo), *rack focus*, viaje lateral, inclinación hacia arriba, grúa hacia atrás y *dolly* a través de capas que se abren.

**Transiciones dentro del medio:** fundidos de luz (atardecer → mañana, que es retroceder), el apagado capa por capa del silencio 2 y las nubes que se abren. Nada de barridos.

**Encuadre vertical:**
- La banda inferior (350 px) queda oscura en todos los planos: tierra o roca casi negra en primer término. En S9–S11 se añade una banda tenue detrás del texto si hace falta.
- Ninguna ventana, lámpara ni sol cae en la banda de subtítulos ni sobre la tira del título.
- Hay que comprobar que Clawd no sale del cuadro en los *dolly* in de S1, S4, S9 y S11.

## 6. Mapa de música y sonido

**Tempo:** 66 bpm (0,91 s por tiempo) en el planteamiento y el final; tempo libre de S5 a S8. Sin batería: solo golpes sueltos.

**Paleta:**
- `oboe`: el motivo de Matusalén, tres notas.
- `harp`.
- Cuerdas graves y `cello`: dron.
- `celesta`: usa los sonidos de glockenspiel.
- `tubular_bells`: un solo golpe.
- `french_horn`: suena con el sonido `horn`.
- `timpani`: siempre con nota (`'D3'`).

| Sección | Planos | Música | Ambiente | Foley |
|---|---|---|---|---|
| La puerta | 1 | Motivo de oboe (re–mi–fa#) sobre arpa en ostinato, desde el segundo 0 | Viento suave de tarde, grillos lejanos | Roce de papel del título; tela de la tienda |
| La luz retrocede | 2 | El arpa invierte el ostinato (descendente); celesta suave en el cambio de luz | Pájaros de mañana que entran (J-cut: 0,4 s antes de que suba el sol) | Brillo que sube con el sol; tela del bulto (sin llanto de bebé) |
| Generaciones | 3–4 | Arpa y cuerdas suaves; vuelve el motivo de oboe una tercera más arriba | Viento de mediodía | Pasos de Clawd sobre la tierra; click y brillo de la lámpara en «consolará» |
| El arca | 5 | Dron grave de cuerdas que entra por debajo; el arpa se aclara | El viento sube y cambia de tono | **Un golpe de cartulina por tabla** (8, escalonados) |
| La suma | 6 | Tres notas de arpa que suben (re, fa#, la), una por cifra y sin resolver | Viento | Un click de luz por cada ventana que se enciende |
| **Silencio 1** | final del 6 | **Nada** (≤ −55 dB) durante ~1,6 s; la cola del viento muere dentro (L-cut) | Tono de sala | — |
| 969 | 7 | Primer sonido tras el silencio: **un golpe de `tubular_bells` (re) con un re grave de cuerdas** en «Novecientos». Luego, dron | Trueno lejano y grave en «el mismo año» (J-cut hacia S8) | Ninguno: la piedra vacía no suena |
| La lluvia | 8 | Dron de `cello` y un `timpani` `'D3'` aislado con el trueno | Lluvia sobre papel (siseo suave, tres capas a distinta velocidad); agua que sube | Agua contra el casco |
| **Silencio 2** | final del 8 | **Nada** (≤ −55 dB) durante ~1,8 s mientras la caja se apaga | Tono de sala | — |
| **Clímax** | 9 | Primer sonido tras el silencio: **celesta y el brillo ascendente de la lámpara** en «Dios». Arpegio de arpa, cuerdas y `horn` que crecen hasta el pico en «entera» | — | Un roce de papel por cada par de nubes que se abre, escalonado |
| El arca en oro | 10 | Cuerdas en mayor, suaves, a 66 bpm | Agua en calma que lame la roca (J-cut: entra 0,5 s antes del corte); pájaros | — |
| Eco | 11 | El motivo de oboe del principio, ahora **resuelto** (re–mi–fa#–la); arpa sostenida bajo el CTA | Viento de amanecer, grillos que se van | Un roce cuando Clawd se gira |

**Puntos de sincronía:**
- Los brazos de Clawd en S1 suben en «novecientos».
- El sol de S2 empieza a subir con «A los».
- Cada ventana de S6 se enciende en la sílaba tónica de «siete», «dos» y «seiscientos», con su nota de arpa.
- La campana cae en «No-» de «Novecientos».
- La última nube de S9 se abre y el pico musical llega en «entera».
- Clawd se gira en «te espera».

**Transiciones sonoras:**
- Los pájaros entran antes de la mañana (J-cut, S1 → S2).
- El viento muere dentro del silencio 1 (L-cut).
- El trueno de S7 entra antes de la lluvia (J-cut).
- El agua en calma entra antes de S10 (J-cut).

**Comprobación:** hay que medir por tramos que los dos silencios existen de verdad en la mezcla final, los dos por debajo de −55 dB.

**Mezcla:** voz al frente (RMS ~−18 dB), música 5–6 dB por debajo bajo la voz, foley entre −24 y −34 dB, final a −14 LUFS.

## 7. Subtítulos y título

- Serif blanco cálido, grande para móvil, sobre la banda oscura inferior (`bottom: 350px`), sin tapar figuras, ventanas ni el sol.
- Palabras clave en oro: las cifras en dígitos (*969 años*, *187*, *182*, *600 años*, *187 + 182*, *+ 600*, *969*), *Matusalén*, *Lamec*, *Noé*, *«este nos consolará»*, *diluvio*, *el mismo año*, *no dice cómo*, *Dios esperó*, *una vida entera*, *paciencia*, *te espera* y *una palabra*.
- Título solo al principio: tira de papel «LA CUENTA QUE NADIE HACE» (Cinzel 800) con «Génesis 5 · 7» (Playfair cursiva) debajo, colocada en función de la cámara, de 0,2 a 3,4 s. Esas palabras no se dicen ni se subtitulan.
- **Ningún otro texto ni número en pantalla:** sin contadores, años dibujados, líneas de tiempo rotuladas, tarjetas, iconos ni CTA gráfico. La cuenta vive en la voz, los subtítulos, las tres luces de S6 y la descripción.
- Máximo ~26 caracteres por línea y dos líneas. El último subtítulo (el CTA) dura hasta el final.

## 8. Qué hay que construir (sin motor nuevo)

**`actors.js`** (de la plantilla y de los videos anteriores):
- `human()` con `sit`, `stand` y `two` (para sostener al recién nacido).
- Un `cayado` en una lámina aparte, unido a la mano o apoyado en la piedra.
- `bebe()`: un bulto de tela pequeño, colocado entre las palmas, a una profundidad entre los dos brazos.
- `tienda()`: tienda de pieles con una ventana o abertura emisiva que se enciende y se apaga (se puede partir de `house()` de job-en-cifras).
- `arcaLejana()`: silueta baja del casco con techo, 8 tiras de tabla que suben por separado y una ventana emisiva. Se adapta el `ark()` de arca-de-noe, siempre lejano y pequeño.
- `lluvia()`: 3 hojas grandes con trazos diagonales recortados que se desplazan (sin gotas sueltas).
- `piedra()`: dos piedras, una grande y una baja.

**`shots.js`** (se quitan `belly`, el mar y la playa de Jonás):
- `puerta(S, o)`: cielo, montes, tierra, tienda y piedras. Los colores van por parámetro (atardecer, mañana, tormenta y amanecer). La usan S1, S2, S7 y S11.
- `camino(S, o)`: una tira larga con las dos tiendas y el horizonte del arca. La usan S3, S5 y S6.
- `nubes(S, o)`: pares de láminas de nube que se separan, con la técnica de `belly().parts`.
- `agua(S, o)`: franja con borde dibujado que sube y luego queda en calma.

**`timeline.py`:** momentos clave `nombre`, `novecientos`, `pregunta`, `lamec`, `noe`, `consolara`, `seiscientos`, `suma187`, `suma182`, `suma600`, `sil1`, `campana`, `mismo_ano`, `no_dice`, `sil2`, `dios`, `entera`, `arca`, `espera`, `cta`.

**`voices/lines.json`:** se reemplazan todas las líneas de Jonás; las cifras van en palabras.

**Grade:** cada plano vuelve a sus valores por defecto en cada cuadro, para que el gris de S7–S8 no se arrastre.

## 9. Portada

- **Imagen:** el plano 1 a escala de portada, con Clawd grande (u ≈ .0036) en primer término, sentado en su piedra baja y mirando al espectador con un brazo arriba.
  - A su lado, Matusalén anciano sentado con su cayado, de perfil, con borde de luz dorada, y la ventana ámbar de la tienda encendida.
  - En la mitad superior, la tormenta que llega: capas de nube gris violeta oscuro, y bajo ellas el arca diminuta en el horizonte. El oro del atardecer nace abajo; arriba queda una zona oscura para el texto (nada de fondo claro detrás de las letras).
- **Gancho (5 palabras, Cinzel, entre 270 y 700 px desde arriba):** «MATUSALÉN: 969… ¿Y EL DILUVIO?», con «969» en oro y el resto en crema.
- El 20 % inferior queda vacío (tierra oscura).

## 10. Reglas de fidelidad

- **Solo los hechos del texto:**
  - Matusalén engendró a Lamec a los 187 años (5:25).
  - Lamec engendró a Noé a los 182 y lo llamó Noé, «este nos consolará» (5:28–29).
  - Matusalén vivió 969 años y murió (5:27).
  - Noé tenía 600 años cuando vino el diluvio (7:6).
  - 187 + 182 + 600 = 969: según las cifras del texto hebreo (el de las Biblias en español), murió el mismo año del diluvio. La descripción lo dice así.
- **No se afirma cómo murió, ni si fue antes o durante el diluvio.** La voz lo dice: «La Biblia no dice cómo». En imagen no se le ve morir ni en el agua: solo una piedra vacía y una ventana apagada, mostradas **antes** de la lluvia y sin conexión con ella.
- **No se usa** la etimología «su muerte traerá…» ni se insinúa en imagen.
- **Enoc no aparece.** Gn 5:21–24 queda fuera para no sumar otro personaje.
- **Sin otros datos ni fechas:** no se usan los 120 años de 6:3 ni se sugiere cuándo empezó el arca. El arca aparece solo en el tramo de Noé (S5), sin año, y nunca junto a Matusalén vivo.
- Matusalén puede llamarse «el hombre que más vivió según la Biblia» en la descripción. No se lo compara con otros (eso era *edades-en-la-biblia*).
- **El diluvio con sobriedad:** lluvia, nubes y agua que sube; ninguna figura en el agua, ningún ahogado ni ruina.
- **Dios no aparece como figura:** solo luz (las nubes que se abren y el oro). La puerta del arca no se muestra cerrándose (7:16 no está en el guion).
- **El mensaje sale del texto:** «Su paciencia esperaba mientras se preparaba el arca» (1 Pe 3:20) y «te espera» (2 Pe 3:9, «es paciente… no quiere que nadie se pierda»).
  - No se dice que Dios «demoró el castigo por Matusalén».
  - No hay amenaza de juicio ni chantaje en el cierre.
- **Personajes:** Matusalén, Lamec y Noé son siluetas serenas, sin caricatura. Los recién nacidos son bultos de tela, sin rasgos, y no hay madres ni esposas dibujadas.
- **Clawd** es un testigo imaginario: no habla con los personajes, no interviene y no cambia los hechos. La descripción lo aclara y declara que el contenido se hizo con IA.
- **CTA:** una pregunta de una palabra. Sin «Etiqueta», sin «SÍ o NO» y sin «AMÉN».
