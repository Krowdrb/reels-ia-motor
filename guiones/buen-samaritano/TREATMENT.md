# Pasaron tres — Tratamiento

**Estilo:** Paper-cut Lightbox (`styles/paper-lantern`), marca `clawd-papel`. **Formato:** vertical 1080×1920, 30 fps, unos 49 s (tope 50 s), −14 LUFS.
**Idioma:** español latino, voz Kokoro `ef_dora (voz robótica femenina, robot_voice.py 0.6)`, `lang: es-419`, velocidad 1.0 (si pasa de 50 s, 1.05), subtítulos quemados y `.srt`.
**Fuente:** Lucas 10:25–37. La pregunta del intérprete de la ley (10:25–29), la parábola que Jesús le cuenta (10:30–35), la pregunta de Jesús y la respuesta (10:36–37a), «Ve, y haz tú lo mismo» (10:37b).
**Render:** CPU (SwiftShader, `SSAA=1`). Máximo 9 capas por plano, sin lluvia ni partículas, un solo `burst()` en toda la película, `maxCoc` ≤ 8, bloom ≤ .45.

## 1. Tres estructuras posibles

1. **Cronológica desde el templo:** el maestro de la ley pregunta, Jesús cuenta y la película entra al camino al final de la pregunta. Fiel y clara, pero el gancho (el herido y los tres que pasan) llega a los 10 s.
2. **Tres pasos por el mismo plano:** la cámara queda clavada junto al herido y por el camino pasan sacerdote, levita y samaritano, con la luz cambiando de noche a mañana. Muy limpia, pero no muestra el mesón ni deja claro quién cuenta la historia.
3. **El herido primero, dentro de un marco (elegida):** abre en el camino de noche, con Clawd junto al herido y tres figuras lejanas que bajan. La cámara retrocede y el camino resulta estar dentro de un arco de papel: es la historia que Jesús le cuenta al maestro de la ley. Volvemos a entrar al camino para la parábola y salimos otra vez al marco para la pregunta final. Al cierre, volvemos al mismo camino, ahora de oro.

**Por qué la 3:** el gancho (situación + cifra «tres» + pregunta) se entiende antes de 4 s, Clawd está junto al herido desde el primer cuadro y el marco de papel deja claro, sin texto añadido, que es **una parábola contada por Jesús**. «Salir de la caja» es un movimiento propio del estilo («esto es una historia contada»). Frente a Jonás cambian la estructura (marco, no recuerdo), la apertura (camino de noche, no vientre), el plano firma (luz que atraviesa las rocas, no costillas que se separan), el recorrido de cámara (viaje lateral y salida por el arco), la forma de la música (modo frigio con oboe, sin dron de vientre) y el final (el camino vacío en oro, no una playa).

## 2. Idea y arco

**Logline:** Clawd espera junto a un hombre medio muerto en el camino de Jericó, dentro de la historia que Jesús le cuenta a un maestro de la ley, y ve pasar a tres: solo el que nadie esperaba se detiene.

- **Planteamiento (0–14 s):** el herido y la pregunta del gancho. Salida al marco: Jesús y el maestro de la ley, «¿quién es mi prójimo?». Entrada al relato: el hombre baja de Jerusalén a Jericó.
- **Conflicto (14–24 s):** los ladrones. Pasa el sacerdote, pasa el levita. Silencio.
- **Giro (24–34 s):** llega el samaritano. La luz atraviesa el papel (clímax). Lo venda y lo lleva al mesón.
- **Cierre (34–49 s):** dos denarios. Vuelta al marco: «¿cuál fue el prójimo?», «el que tuvo misericordia». Silencio. «Ve, y haz tú lo mismo». El camino vacío en oro y Clawd pregunta al espectador.

**Color:** de índigo nocturno (gancho, ladrones) a gris azulado de madrugada (sacerdote, levita), al primer ámbar en la cresta (samaritano) y al oro (clímax, mesón, marco final, camino final). Nunca naranja ni terracota detrás de Clawd: el oro de esta película es crema y pajizo (`#f3dca0`, `#e6c27a`) con frentes pardos (`#2a1a0e`).

**Eco:** abre con Clawd junto al herido en un camino oscuro y cierra con Clawd en el mismo encuadre y el mismo camino, ahora de oro y vacío: al herido ya lo cuidaron.

**Clawd dentro de la historia:** es un testigo imaginario y el relato no cambia. No habla con nadie, no detiene al sacerdote, no ayuda al herido, no guía al samaritano. Mira, acompaña y cuenta. En el marco no está junto a Jesús: está **dentro del arco**, en el camino, porque está dentro de la historia que se cuenta.

## 3. Referencias

- **Lotte Reiniger** (siluetas articuladas) y el **narrador que enmarca cuentos** de las películas de siluetas de Michel Ocelot.
  - *Aprender:* lectura por silueta, gesto con un solo brazo, el marco del narrador como puerta a otra lámina.
  - *No tomar:* personajes, diseños, encuadres ni música concretos.
- **Lámparas de papel recortado (shadow box).**
  - *Aprender:* escalera de valores por capa; la luz que enciende capa por capa.
  - *No tomar:* ningún diseño de lámpara concreto.

## 4. Guion (borrador, 116 palabras)

Ninguna línea empieza por J («Jesús», «Jericó» y «Jerusalén» van siempre en medio de la frase).

| # | Texto | Pausa después | Referencia |
|---|---|---|---|
| l01 | Tres hombres pasarán junto a este herido. | .15 | gancho, 10:31–33 |
| l01b | ¿Cuál se detendrá? | .3 | gancho |
| l02 | Esta historia la contó Jesús. Yo estoy dentro. | .3 | marco; Clawd testigo |
| l03 | Un maestro de la ley preguntó: ¿quién es mi prójimo? | .35 | 10:25, 29 |
| l04 | Un hombre bajaba a Jericó, casi mil metros cuesta abajo. | .3 | 10:30 |
| l05 | Unos ladrones lo despojaron, lo hirieron y lo dejaron medio muerto. | .45 | 10:30 |
| l06 | Un sacerdote lo vio… y pasó de largo. | .3 | 10:31 |
| l07 | Luego, un levita. Igual. | **1.5 (silencio 1)** | 10:32 |
| l08 | Llegó un samaritano. | .3 | 10:33 |
| l09 | Lo vio… y tuvo compasión. | .5 | 10:33 (clímax en «compasión») |
| l10 | Le vendó las heridas con aceite y vino, | .2 | 10:34 |
| l10b | lo llevó a un mesón y lo cuidó. | .35 | 10:34 |
| l11 | Pagó dos denarios, y prometió pagar más. | .4 | 10:35 |
| l12 | Y Jesús preguntó: ¿cuál fue el prójimo? | .3 | 10:36 |
| l12b | El que tuvo misericordia. | **1.6 (silencio 2)** | 10:37a |
| l13 | Ve, y haz tú lo mismo. | .5 | 10:37b |
| l14 | ¿Quién es tu prójimo hoy? Dilo en una palabra. | hasta el final | CTA de una palabra (experimento) |

- **La cifra:** Jerusalén está a unos 750–800 m sobre el nivel del mar y Jericó a unos 250 m bajo él; el camino antiguo baja cerca de 1.000 m en unos 25–30 km. «Casi mil metros cuesta abajo» es seguro; no decir los kilómetros.
- **Gancho:** l01 + l01b terminan hacia 3,8 s. Si la voz se alarga, subir solo esas dos líneas a velocidad 1.08.
- **Título de YouTube:** «Tres hombres pasaron junto a un herido. ¿Cuál se detuvo? | El buen samaritano #shorts».
- **Descripción:** Lucas 10:25–37; aclara que es una parábola contada por Jesús, que Clawd es un testigo imaginario que no cambia el relato y que el video se hizo con IA.
- **Whisper:** posibles confusiones «levita/la vida», «mesón/mezón», «denarios/de narios». Si el resto coincide, va en `asr`.

## 5. Lista de planos (tiempos estimados; los definitivos salen de la voz en `timeline.py`)

| # | Tiempo | Plano | Encuadre y cámara | Clawd: dónde está y qué hace | Por qué |
|---|---|---|---|---|---|
| S1 | 0–4,0 | **Camino de noche.** El herido (`lie`) en primer término, al borde del camino; al fondo, en tres revueltas del camino a tres profundidades, tres siluetas diminutas que bajan. Tira de papel del título arriba: «EL BUEN SAMARITANO / Lucas 10:25–37» (0,35–3,9 s) | Plano general, *dolly* lento hacia dentro, casi frontal | Junto a la cabeza del herido, a la izquierda (u .0030), brillando: la única luz cálida. En «tres» mira al fondo; en «¿Cuál…?» recorre con la mirada las tres siluetas | Gancho visible y audible a la vez: el herido, la cifra y la pregunta en un solo cuadro |
| S2 | 4,0–10,4 | **El marco.** La cámara sale del camino a través de un arco recortado en primer término: a la izquierda, Jesús sentado (`sit`, silueta serena, borde de luz); a la derecha, el maestro de la ley de pie, que levanta el brazo en «¿quién es mi prójimo?». El camino nocturno sigue dentro del arco | *Dolly* hacia atrás (z .30 → .56), saliendo de la caja; *rack focus* final del arco a Jesús | Pequeño, **dentro del arco**, junto al herido; quieto. En «Yo estoy dentro» levanta un brazo (único gesto) | Deja claro sin texto que es una parábola contada por Jesús; segundo plano memorable de cámara |
| S3 | 10,4–14,2 | **La bajada.** Jerusalén recortada arriba a la izquierda (ventanas apagadas, fría); el camino baja en diagonal entre lomas; el hombre camina cuesta abajo | Viaje lateral con paralaje que a la vez inclina hacia abajo por las capas | Unos pasos detrás del hombre, caminando (zancada) | «Casi mil metros cuesta abajo» se ve: la ciudad sube y sale del cuadro |
| S4 | 14,2–18,3 | **Los ladrones.** Rocas negras en primer término; tres siluetas suben por detrás de ellas (deslizamiento vertical) en «despojaron», «hirieron» y «medio muerto»; el manto del hombre (una lámina) se desliza fuera de cuadro; él cae detrás de la roca | Plano medio en contrapicado, cámara en mano leve (.0015) | Encogido al borde izquierdo de la roca (`tuck`), brazos pegados, sin intervenir | Lo más oscuro y rápido de la película, sin violencia explícita: la caída queda tapada por la roca |
| S5 | 18,3–21,3 | **El sacerdote.** Mismo encuadre del gancho, de madrugada gris azulada; el sacerdote cruza por la revuelta **del fondo**, gira la cabeza hacia el herido y sigue | Plano general fijo, *rack focus* del herido al sacerdote y vuelta | Junto al herido; mira al sacerdote, sube un brazo a medias y lo baja (no lo llama) | «Por el otro lado» se ve como profundidad: pasa lejos, en otra capa |
| S6 | 21,3–24,6 | **El levita y el silencio 1.** Igual, cámara más baja y algo más cerca; el levita cruza más rápido. Al salir de cuadro, 1,5 s de quietud: solo baja la luz | Plano general fijo, solo cambia la luz | Sentado junto al herido, quieto, mirada baja | La repetición marca el ritmo; el silencio prepara el giro |
| S7 | 24,6–26,3 | **Llega el samaritano.** Primer sonido tras el silencio: la campanilla del animal. Entra por la derecha con su asno, por el camino **cercano**, a contraluz de un primer ámbar en la cresta | Plano medio en contrapicado, paneo que lo sigue | Se gira hacia él con los ojos abiertos; no se mueve de su sitio | El único que llega por la capa del herido: el único que se acerca |
| S8 | 26,3–31,5 | **Plano firma: la luz atraviesa el papel.** El samaritano arrodillado (`kneel`, dos brazos) sobre el herido. En «compasión» la fuente de luz se coloca en sus manos y las capas de roca negra se vuelven translúcidas una tras otra, del frente al fondo (escalonado de .4 s): el cañón oscuro se enciende en oro desde dentro. En «aceite y vino» un frasco pequeño destella y sus brazos vendan | *Dolly* lento hacia dentro, casi frontal, a través de las capas que se encienden | Quieto a un lado, a la izquierda, brazos abajo, mirando; no se acerca | El clímax con la acción propia del medio: la luz detrás del papel. Oscuro → oro en un solo plano |
| S9 | 31,5–34,1 | **Hacia el mesón.** El herido sobre el asno; el samaritano lo lleva de la rienda; delante, el mesón con una ventana encendida | Viaje lateral a la par (rocas cercanas rápidas, lomas lejanas lentas) que termina en empuje hacia la ventana | Camina detrás del asno | El viaje del cuidado; la ventana encendida es la transición al interior |
| S10 | 34,1–36,9 | **Al otro día, el mesón.** Luz de mañana por la puerta; el herido descansa tendido dentro; el samaritano pone dos monedas (dos destellos) en la mano del mesonero | Plano medio, *dolly* lateral corto; *rack focus* a las manos dentro del mismo plano | En el umbral, pequeño y quieto, a la izquierda | «Dos denarios» y la promesa: la gracia en un gesto pequeño |
| S11 | 36,9–44,9 | **Vuelta al marco y silencio 2.** Mismo encuadre de S2, ahora en oro; Jesús levanta el brazo en la pregunta; el maestro de la ley baja la cabeza al responder. Silencio de 1,6 s: solo crece la luz desde arriba y detrás de Jesús (Dios solo como luz). En «Ve, y haz tú lo mismo» el brazo de Jesús se abre hacia el arco | Plano general que se acerca muy lento hacia Jesús; en el silencio, plano fijo | Dentro del arco, en el camino ya dorado, de pie y quieto a un lado | Cierra el marco con las palabras de Jesús, sin añadirle nada |
| S12 | 44,9–49,5 | **El camino de oro.** La cámara entra por el arco al camino: mismo encuadre del gancho, de mañana dorada, sin el herido | Empuje a través del arco y plano medio de Clawd | Grande (u .0034), en el lugar del gancho; se gira a cámara y pregunta | Eco del inicio; el CTA hace la pregunta de Jesús, pero al espectador |

Contraste de ritmo: S4 es el más rápido (golpes en la palabra y cámara en mano), S6 y S11 tienen los planos fijos con silencio, y S8 es la toma larga para respirar. Un cambio visual (plano, cámara o luz) cada 3–4 s.

## 6. Mapa de ritmo, música y sonido

Rejilla: 72 bpm (negra .833 s), compás de 4/4 = 3,33 s. Cortes y golpes caen en la palabra, no en cada tiempo. Tonalidad: **mi frigio con tercera mayor** (mi–fa–sol#–la–si–do–re) para el camino y **mi mayor** desde el clímax. Sin batería: solo golpes sueltos de `frame_drum`.

| Sección | Tiempo | Música | Ambiente | Foley |
|---|---|---|---|---|
| Gancho (S1) | 0–4 | Desde 0 s: pedal de `cellos`/`contrabass` en mi, `harp` en arpegio escaso; el `oboe` dice el motivo (mi–fa–sol#) | Viento de cañón, grillos | Roce de papel al entrar el título; respiración débil del herido |
| Marco (S2) | 4–10,4 | `guitar_nylon` en punteo suave, el `oboe` responde | Patio, viento leve | Paso del maestro de la ley; la grava del camino entra .5 s antes del corte (J-cut) |
| Bajada (S3) | 10,4–14,2 | Ostinato de `guitar_nylon` en negras, `cellos` que bajan por grados | Viento de cañón | Pasos en grava (dos personajes) |
| Ladrones (S4) | 14,2–18,3 | Golpes de `frame_drum` en «despojaron», «hirieron» y «muerto»; `cellos_spic` y trémolo grave | Viento fuerte | Tres deslizamientos de papel, manto que se arrastra, golpe sordo de la caída |
| Sacerdote y levita (S5–S6) | 18,3–23,1 | Solo `oboe` y un pedal muy bajo; el motivo queda sin resolver | Viento bajo, primer pájaro de madrugada | Pasos lejanos (paneados al fondo), más rápidos en el levita |
| **Silencio 1** | 23,1–24,6 | **Nada** (meta: −55 dB o menos) | Solo tono de sala muy bajo | Ninguno |
| Samaritano (S7) | 24,6–26,3 | Entra el `harp` en mi mayor, muy suave | Mañana, viento templado | **Primer sonido: campanilla del asno (`nepal_bells`)**, luego cascos (madera) |
| **Clímax (S8)** | 26,3–31,5 | En «compasión»: `violins`, `violas`, `cellos` y `horn` abren en mi mayor; `hand_chimes` en escalera, una nota por capa que se enciende | El viento cae | Chasquido de interruptor en la fuente y un brillo que sube por capa (shimmer); frasco que se destapa y un vertido corto |
| Mesón (S9–S10) | 31,5–36,9 | `harp` y `oboe` en mayor, cuerdas bajas | Cascos y grillos; dentro, fuego que crepita (entra antes de la imagen, en S9) | Puerta de madera; dos monedas (dos tintineos) en «dos denarios» |
| Marco final (S11) | 36,9–41,35 | Cuerdas sostenidas bajas; el crepitar del mesón pasa por encima del corte (L-cut) y se apaga | Patio | Brazo de Jesús: roce de papel suave |
| **Silencio 2** | 41,35–42,95 | **Nada** (meta: −55 dB o menos) | Tono de sala | Ninguno |
| «Ve, y haz…» (S11–S12) | 42,95–49,5 | Primer sonido: una nota de `hand_chimes` (mi5) con la voz; luego `harp` sola en mi mayor y el `oboe` cierra el motivo resuelto (mi–sol#–si) | Pájaros de mañana (entran .5 s antes del corte a S12, J-cut) | Clawd se gira: golpecito de cartulina |

- Voz al frente (RMS ~−18 dB), música −5/−6 dB bajo la voz, foley entre −24 y −34 dB, final −14 LUFS.
- `timpani` no se usa; si hiciera falta, con nota (`'E2'`). `celesta` suena como glockenspiel: aquí se prefiere `hand_chimes`.
- Comprobar por tramos en `out/mix.wav` que los dos silencios existen de verdad antes de entregar.

## 7. Subtítulos y título

- Blanco cálido, serif grande para móvil, en la banda oscura inferior (`bottom: 350px`), sin tapar al herido, al samaritano ni la luz. En S8 y S12 (fondos dorados) la banda inferior es la capa frontal parda; si no alcanza, una banda oscura tenue detrás del texto.
- Palabras clave en oro: *tres*, *herido*, *¿Cuál…?*, *Jesús*, *prójimo*, *Jericó*, *mil metros*, *medio muerto*, *pasó de largo*, *samaritano*, *compasión*, *aceite y vino*, *mesón*, *dos denarios*, *misericordia*, *haz tú lo mismo*, *una palabra*.
- Título solo al principio: tira de papel «EL BUEN SAMARITANO» (Cinzel 800) y «Lucas 10:25–37» (Playfair cursiva), colocada en función de la cámara.
- Ningún otro texto en pantalla: sin tarjetas, contadores, iconos, globos ni CTA gráfico. El último subtítulo (CTA) dura hasta el final.

## 8. Qué hay que construir (sin motor nuevo)

- `actors.js`: una pose `lie` (tendido de lado, con la cabeza visible y algo alzada); `donkey()` (cuerpo, cabeza con pivote y cuatro patas que giran, como papel en un palo); una opción `hat` para distinguir al sacerdote (tocado alto) y al levita (tocado bajo); dos monedas y un frasco como láminas pequeñas con `glowDraw`.
- `shots.js`: `road(S, o)` (cielo, lomas, tres revueltas del camino a tres profundidades, rocas frontales y colores por parámetro para noche, madrugada y oro); `arch(S, o)` (patio con el arco recortado, Jesús y el maestro de la ley); `inn(S, o)` (casa con ventana y puerta emisivas). Jerusalén reutiliza el recorte de ciudad del S2 de la plantilla, recoloreado en frío.
- Clímax: animar `uTrans` de cada capa de roca (.05 → .7) y mover `uLight` a las manos del samaritano, con un escalonado de .4 s. Sin geometría nueva y barato en CPU.
- El paso de `stand` a `lie` del herido se oculta detrás de la roca (S4); el de `stand` a `kneel` del samaritano, en el corte S7 → S8.
- `timeline.py`: momentos clave `tres`, `cual`, `dentro`, `projimo`, `golpes` (3), `sacerdote`, `levita`, `sil1`, `campana`, `compasion`, `aceite`, `denarios`, `pregunta`, `sil2`, `ve`, `cta`.

## 9. Portada

- **Imagen:** el camino de noche con Clawd grande junto al herido (izquierda y centro), dos siluetas oscuras que se alejan al fondo y, a la derecha, el samaritano con su asno a contraluz de un oro que empieza a romper en la cresta. Oscuro y oro en una sola imagen.
- **Gancho (5 palabras, con la cifra):** «PASARON 3. ¿CUÁL SE DETUVO?», en Cinzel, entre 270 y 700 px desde arriba, sobre el cielo índigo (no sobre el oro). El 20 % inferior queda vacío.

## 10. Reglas de fidelidad

- Se dice y se ve que es **una parábola que Jesús cuenta** al maestro de la ley: el marco (S2, S11) abre y cierra el relato.
- Jesús es una silueta serena, sentada, sin rasgos ni gestos teatrales; solo mueve el brazo al preguntar y al decir «ve». Dios no aparece como figura: solo luz desde arriba.
- Solo los hechos del texto: bajaba a Jericó; los ladrones lo despojan, lo hieren y lo dejan medio muerto; el sacerdote y el levita pasan de largo por el otro lado; el samaritano lo ve, tiene compasión, lo venda con aceite y vino, lo sube a su cabalgadura, lo lleva al mesón, lo cuida, paga dos denarios y promete pagar lo demás. Sin diálogos inventados para el herido ni para el samaritano.
- Sin caricatura de sacerdote, levita ni samaritano, y sin juicios sobre judíos o samaritanos; la violencia de los ladrones queda fuera de cuadro.
- No se muestra al maestro de la ley yéndose ni cambiando: el texto termina con la orden de Jesús.
- Clawd es un recurso narrativo: no habla con los personajes, no interviene y no cambia los hechos. La descripción lo aclara y declara que el contenido se hizo con IA.
- Sin promesas de milagros ni chantaje espiritual en el cierre; el CTA es una pregunta de una palabra sobre la vida del espectador.
