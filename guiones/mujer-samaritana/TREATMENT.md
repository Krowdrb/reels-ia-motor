# El desconocido del pozo — Tratamiento

**Estilo:** Paper-cut Lightbox (`styles/paper-lantern`), marca `clawd-papel`. **Formato:** vertical 1080×1920, 30 fps, unos 47 s (objetivo 45–48 s, tope 50 s), −14 LUFS.
**Idioma:** español latino, voz Kokoro `ef_dora` pasada por `robot_voice.py` (0.6), `lang: es-419`, velocidad 1.0 (si la voz pasa de 48 s, 1.05 en todas las líneas; los silencios no se acortan). **No** `em_santa`. Subtítulos quemados y `.srt`.
**Fuente:** Juan 4:1–42. Jesús cansado se sienta junto al pozo a la hora sexta (4:6); «Dame de beber» (4:7); judíos y samaritanos no se tratan (4:9); el agua viva (4:10–14); «Ve, llama a tu marido» y los cinco maridos (4:16–18); adorar en espíritu y en verdad (4:20–24); el Mesías y «Yo soy, el que habla contigo» (4:25–26); deja el cántaro y va al pueblo (4:28–30); muchos creyeron (4:39–42).
**Render:** CPU (SwiftShader, `SSAA=1`, 2 núcleos). Máximo 9 capas por plano, sin lluvia ni partículas (ni polvo, ni calima de puntos), **un solo `burst()`** en toda la película (S10), `maxCoc` ≤ 8, bloom ≤ .45.

## 1. Tres estructuras posibles

1. **Cronológica en un solo lugar:** la cámara no sale del pozo; la conversación avanza y solo cambia la luz, de mediodía blanco a oro. Íntima y barata, pero el pueblo (el final, «muchos creyeron») queda fuera y el gancho depende solo de la voz.
2. **Ida y vuelta del cántaro:** abre en Sicar con la mujer saliendo sola, sigue el cántaro hasta el pozo y vuelve con ella corriendo, sin él. El objeto cuenta el cambio, pero el gancho (el desconocido que conoce su vida) llega tarde y Clawd tendría que viajar.
3. **El pozo como eje vertical (elegida):** Clawd está sentado en el brocal desde el primer cuadro, a mediodía, con Jesús sentado al otro lado y la mujer que se acerca. La película alterna planos a ras del brocal (la conversación) con un corte transversal del pozo, hondo y oscuro, donde la cámara baja hasta el agua. Ese mismo corte es el clímax: en «Yo soy» la luz sube desde el agua por todas las capas del pozo y sale por la boca; el mediodía blanco se vuelve oro. Al final, el mismo encuadre del gancho, con el cántaro dejado en el brocal y el pueblo que baja a ver.

**Por qué la 3:** el gancho (un desconocido + toda su vida + pregunta) se entiende en 3 s con las tres figuras en un cuadro; Clawd está físicamente en el lugar sin moverse de él (testigo, no viajero), y el «agua viva» deja de ser una idea abstracta: es la luz que vive dentro del pozo, que el espectador ve antes (un destello en S5) y después (el clímax en S10). «Inclinar la pila» (cielo → suelo → hondo) es un movimiento propio del estilo. Frente a Jonás y al buen samaritano cambian la estructura (eje vertical, no recuerdo ni marco), la apertura (mediodía blanco, no oscuridad ni noche), el plano firma (luz que sube por un pozo, no costillas ni rocas que se encienden), el recorrido de cámara (inclinaciones verticales, no viaje lateral), la música (re dórico con flauta dulce, no frigio con oboe ni dron de vientre) y el final (el pueblo que baja, no un paisaje vacío).

## 2. Idea y arco

**Logline:** sentado en el brocal del pozo de Jacob a mediodía, Clawd ve a un hombre cansado pedirle agua a una mujer que nunca había visto, y nombrar delante de ella toda su vida sin apartarse de ella.

- **Planteamiento (0–12 s):** gancho; mediodía, el pozo, Jesús cansado; llega la samaritana; «Dame de beber».
- **Conflicto (12–20,5 s):** judíos y samaritanos no se tratan; el agua viva (destello en el fondo del pozo). **Silencio 1.**
- **Giro (20,5–35,4 s):** «Ve, llama a tu marido»; «No tengo marido»; los cinco maridos, dicho con calma; él sigue hablándole: adorar en espíritu y en verdad; el Mesías. **Silencio 2.**
- **Clímax y cierre (35,4–47,3 s):** «Yo soy, el que habla contigo»: la luz sube por el pozo. Ella deja el cántaro y corre al pueblo; muchos creyeron; Clawd junto al cántaro pregunta al espectador.

**Color:** de **blanco calcinado y sofocante** (cielo casi blanco, tierra polvorienta desaturada, sombras negras y cortas bajo la luz cenital) a **oro**. El pozo por dentro es lo más oscuro de la película (piedra parda casi negra). Desde S8 el cielo empieza a entibiarse; en S10 la luz que sube del agua lo tiñe todo de oro; S11–S12 son tarde dorada. Nunca naranja ni terracota detrás de Clawd: el oro es crema y pajizo (`#f3dca0`, `#e6c27a`) con frentes pardos (`#2a1a0e`). Nada azul junto a luz dorada (da verde): el agua es casi negra, no azul.

- Escalera de mediodía: cielo `#f6f2e4` → lomas lejanas `#d8cdb2` → lomas medias `#a39a82` → camino `#5a5040` → frente en sombra `#16130e`; luz `#fffaf0`, dura.
- Escalera del pozo por dentro: suelo cortado `#3a342b` → anillos `#2b261f`, `#211d17`, `#18150f` → agua `#0b0c0c`.
- Escalera de oro: `#f3dca0` → `#e6c27a` → `#b98f4e` → `#5a3e1e` → `#2a1a0e`; luz `#ffd98a`.

**Eco:** S1 y S12 tienen el mismo encuadre. En S1, Clawd en el brocal y una mujer sola que se acerca con el cántaro bajo el sol blanco. En S12, Clawd en el mismo sitio junto al cántaro que ella dejó, y por el mismo camino baja mucha gente, en oro.

**Clawd dentro de la historia:** es un testigo imaginario y el relato no cambia. No habla con Jesús ni con la mujer, no saca agua, no la sigue al pueblo. Está sentado en el brocal, del lado izquierdo, a un paso de los dos. Mira, se protege del sol, se asoma al pozo y cuenta. En los momentos solemnes (S6, S7, S9, S10) se queda quieto y a un lado, con los brazos abajo.

## 3. Referencias

- **Siluetas de Lotte Reiniger y de Michel Ocelot**, y los cortes transversales de los libros ilustrados que muestran un edificio o un pozo «por dentro».
  - *Aprender:* lectura por silueta, un solo gesto por personaje, el corte transversal como forma de enseñar lo hondo y lo escondido.
  - *No tomar:* personajes, diseños, encuadres ni música concretos.
- **Lámparas de papel recortado (shadow box)** con luz cenital.
  - *Aprender:* sombras cortas y duras de una luz alta; capas que se encienden en escalera desde la fuente.
  - *No tomar:* ningún diseño de lámpara concreto.

## 4. Guion (borrador, unas 112 palabras)

Ninguna línea empieza por J («Jesús», «Jacob», «judíos» van siempre en medio). Las palabras de Jesús y de la mujer van entre comillas en los subtítulos; Clawd las cita, no las cambia.

| # | Texto | Pausa después | Referencia |
|---|---|---|---|
| l01 | Él nunca la había visto… | .15 | gancho |
| l01b | ¿cómo sabía toda su vida? | .3 | gancho, 4:29 |
| l02 | Mediodía. Estoy en el pozo de Jacob. | .25 | 4:5–6 (hora sexta) |
| l03 | Cansado, Jesús se sienta aquí. | .35 | 4:6 |
| l04 | Llega una samaritana. «Dame de beber», le pide. | .3 | 4:7 |
| l05 | Ella se extraña: judíos y samaritanos no se tratan. | .35 | 4:9 |
| l06 | «Si supieras quién te pide… tú le pedirías agua viva». | **1.5 (silencio 1)** | 4:10 |
| l07 | «Ve, llama a tu marido». | .3 | 4:16 |
| l08 | «No tengo marido». | .25 | 4:17 |
| l09 | «Cinco has tenido, y el de ahora no lo es». | .35 | 4:17–18 |
| l10 | Y siguió hablándole: adorar en espíritu y en verdad. | .3 | 4:21–24 |
| l11 | «Sé que viene el Mesías», dice ella. | **1.6 (silencio 2)** | 4:25 |
| l12 | «Yo soy, el que habla contigo». | .5 | 4:26 (clímax en «soy») |
| l13 | Ella deja el cántaro y corre al pueblo. | .2 | 4:28 |
| l14 | «¡Vengan a ver! Me dijo todo lo que he hecho». | .3 | 4:29 |
| l15 | Y muchos creyeron. | .3 | 4:39–41 |
| l16 | ¿Qué cántaro dejarías tú? Dilo en una palabra. | hasta el final | CTA de una palabra (experimento vigente) |

- **Delicadeza en l09:** se cita a Jesús tal cual, sin adjetivos ni juicios; la imagen muestra que él no se aparta y que ella no se queda con la cabeza baja (la levanta en l10). No se dibuja a ningún hombre.
- **l10** resume 4:20–24 sin nombrar el monte (se ve en S8) y sin tomar partido entre lugares de culto: «en espíritu y en verdad» es la respuesta del texto.
- **Gancho:** l01 + l01b terminan hacia 3,4 s. Si la voz se alarga, subir solo esas dos líneas a 1.08.
- **Duración:** 112 palabras se parecen a las 116 de buen-samaritano (49,2 s); si la voz pasa de 48 s, velocidad 1.05 en todas las líneas (no se tocan los silencios).
- **Título de YouTube (personaje famoso + cifra + pregunta):** «Jesús nunca la había visto y sabía sus 5 matrimonios. ¿Cómo? | La mujer samaritana #shorts». Alternativa sin la cifra: «Jesús nunca la había visto… ¿cómo sabía toda su vida? | La samaritana #shorts».
- **Descripción:** Juan 4:1–42; aclarar que Clawd es un testigo imaginario que no cambia el relato y que el video se hizo con IA.
- **Whisper:** posibles confusiones «samaritana/samaritano», «cántaro/cantaro», «Mesías/mesías», «Yo soy, el que/Yo soy el que», «Jacob/Jacobo». Si el resto coincide, va en `asr`. «Sicar» no se dice en la voz.

## 5. Lista de planos (tiempos estimados; los definitivos salen de la voz en `timeline.py`)

Capas por plano entre paréntesis (máximo 9, contando cielo, figuras y Clawd).

| # | Tiempo | Plano | Encuadre y cámara | Clawd: dónde está y qué hace | Por qué |
|---|---|---|---|---|---|
| S1 | 0–3,4 | **El pozo a mediodía.** Brocal de piedra en primer término; Jesús sentado (`sit`) a la derecha del brocal, quieto; al fondo, por un camino entre lomas pálidas, la mujer (`stand`, cántaro al hombro) se acerca sola. Sombras negras y cortas bajo las figuras. Tira de papel del título arriba: «LA MUJER SAMARITANA / Juan 4:1–42» (0,3–3,3 s), colocada en función de la cámara. (8: cielo con sol, lomas lejanas, lomas medias, camino, mujer, Jesús, brocal, Clawd) | Plano general, *dolly* lento hacia dentro, casi frontal | Sentado en el brocal, a la izquierda (u .0030), la única mancha de color fuerte. En «nunca la había visto» mira a la mujer; en «¿cómo sabía…?» gira la cabeza hacia Jesús | Gancho visible y audible a la vez: los dos desconocidos y el pozo entre ellos |
| S2 | 3,4–8,1 | **El sol cenital.** Arranca en el cielo blanco con el disco del sol (emisivo, recortado) y baja por las capas hasta el brocal: Jesús, cansado, se sienta (pasa de `stand` a `sit` detrás del brocal, que tapa el cambio). (7: cielo con sol, lomas, camino, muro bajo, Jesús, brocal, Clawd) | Inclinación hacia abajo (*tilt down*) del cielo al brocal | En el brocal, se hace sombra con un brazo (aL ~1.8) en «Mediodía»; en «aquí» baja el brazo | Dice «hora sexta» sin texto: calor blanco y sombra mínima. Primer movimiento vertical |
| S3 | 8,1–11,9 | **Llega la samaritana.** Ella entra por la izquierda, baja el cántaro al brocal (golpe de barro en piedra); Jesús levanta un brazo, tranquilo, en «Dame de beber». (7: cielo, lomas, muro bajo, mujer, cántaro, Jesús, brocal + Clawd) | Plano medio a dos, viaje lateral corto que la acompaña hasta el brocal | Al borde izquierdo del brocal; se corre un poco hacia atrás cuando ella llega (u .0026) | La petición, en el gesto más pequeño posible |
| S4 | 11,9–15,4 | **El pozo entre los dos.** Ella cerca, a la izquierda; Jesús lejos, al otro lado del brocal. (6: cielo, lomas, mujer, Jesús, brocal, Clawd) | Plano medio, *rack focus* de Jesús a la mujer en «no se tratan» | Pequeño, sentado entre los dos sobre el brocal, mira al suelo; sin moverse | La distancia entre pueblos se ve como profundidad: dos capas separadas por el pozo |
| S5 | 15,4–19,0 | **Corte transversal del pozo.** El suelo se ve «por dentro»: la boca arriba, el tiro de piedra bajando por capas cada vez más oscuras, el agua negra al fondo. En «agua viva», un solo destello cálido tiembla en el agua y se apaga (emisivo bajo, sin `burst`). (7: cielo recortado, suelo cortado, tres anillos de piedra, agua, Clawd) | Inclinación hacia abajo por el tiro, de la boca al agua | Asomado al brocal arriba (cabeza y ojos visibles, u .0024), mirando hacia el fondo; la cámara lo deja atrás al bajar | Presenta el lugar del clímax: el pozo es hondo (4:11) y el agua viva todavía es solo una promesa |
| S6 | 19,0–20,5 | **Silencio 1.** Vuelta al plano a dos de S3, fijo. La luz se vuelve aún más blanca y plana; nadie se mueve | Plano fijo, solo cambia la luz | Quieto, sentado de lado en el brocal, brazos abajo | Contiene el aire antes de la frase que lo cambia todo |
| S7 | 20,5–27,4 | **«Ve, llama a tu marido».** Ella en plano medio, con el cántaro delante; Jesús sentado, sereno, al fondo. En «No tengo marido» ella baja un poco la cabeza; en «cinco has tenido» Jesús no se mueve, sigue sentado, hacia ella; ella levanta la cabeza al final de la línea. (7: cielo, lomas, mujer, cántaro, Jesús, brocal, Clawd) | Plano medio corto de ella, *dolly* hacia atrás lento hasta incluir a Jesús | En el extremo izquierdo del brocal, pequeño, quieto, mirando al suelo (no la mira a ella) | Delicadeza: la cámara se aleja en vez de acercarse; él no se aparta. Sin figuras de otros hombres |
| S8 | 27,4–33,8 | **El monte.** Plano general: en el horizonte, el perfil de un monte (Gerizim, sin nombrarlo); ella levanta el brazo hacia él; Jesús abre la mano hacia arriba en «en espíritu y en verdad». El cielo pasa de blanco a un primer crema tibio. En «Mesías» ella mira a Jesús. (8: cielo, monte, lomas, camino, mujer, Jesús, brocal, Clawd) | Inclinación hacia arriba del brocal al monte y al cielo | Sentado en el brocal, sigue con la mirada el brazo de ella hacia el monte y vuelve | La conversación se abre del pasado de ella a Dios; primer cambio de temperatura |
| S9 | 33,8–35,4 | **Silencio 2.** Plano frontal de los dos a cada lado del brocal, fijo. Las sombras se acortan aún más; la boca del pozo, entre ellos, se oscurece | Plano fijo, frontal | Se baja del brocal y queda de pie a un lado, a la izquierda, quieto, brazos abajo | Deja el centro libre para lo que va a salir del pozo |
| S10 | 35,4–38,8 | **Plano firma: la luz sube del pozo.** Corte transversal de S5. En «Yo soy», la fuente de luz (`uLight`) arranca en el agua y sube por el tiro; cada anillo de piedra se vuelve translúcido en escalera (.05 → .7, .35 s por capa), de abajo arriba. En «soy» la luz sale por la boca: único `burst()` de la película, sobre el brocal. La cámara sube con la luz y termina en el encuadre frontal de S9, ahora en oro: Jesús sentado, sereno, con borde de luz; la mujer de pie, la mano abierta junto al cántaro. (9: cielo, suelo cortado, tres anillos, agua, Jesús y mujer en una lámina, Clawd, `burst`) | Grúa hacia arriba a través de las capas, del agua a la boca, y *dolly* corto hacia dentro | Quieto a un lado, a la izquierda de la boca del pozo, pequeño (u .0024), brazos abajo; la luz lo alcanza sin que él se mueva | El clímax con la acción propia del medio: luz que atraviesa el papel desde dentro. Blanco calcinado → oro en un solo plano. Dios solo como luz |
| S11 | 38,8–44,9 | **El cántaro dejado.** En primer término, el cántaro sobre el brocal, enfocado; detrás, ella sube corriendo por el camino hacia el pueblo en una loma (casas recortadas con dos ventanas encendidas). En «¡Vengan a ver!» llega a la puerta del pueblo. (6: cielo dorado, loma con pueblo, camino, mujer corriendo, brocal con cántaro, Clawd) | *Rack focus* del cántaro a la mujer que corre, y *dolly* lateral muy corto | Junto al cántaro, sentado, mira cómo se aleja ella; no la sigue | «Deja el cántaro» en un objeto que se queda: vino con él y se va sin él |
| S12 | 44,9–47,3 | **El pueblo baja.** Mismo encuadre de S1, en tarde dorada: por el mismo camino donde ella vino sola, bajan muchas siluetas (dos láminas de 4–5 figuras cada una, a dos profundidades, que se deslizan). Jesús sentado al otro lado del brocal. (9: cielo, lomas lejanas, lomas medias, camino, gente ×2, Jesús, brocal con cántaro, Clawd) | Plano general y *dolly* lento hacia Clawd hasta plano medio | En el brocal, en el mismo sitio del gancho, grande (u .0034), junto al cántaro; en «Y muchos creyeron» mira el camino; en el CTA se gira a cámara | Eco del inicio: la mujer sola se vuelve un pueblo; el CTA toma el cántaro como imagen |

Contraste de ritmo: S3–S4 y S7 son conversación con un cambio visual cada 3–4 s; S5 y S10 son los movimientos verticales largos; S6 y S9 son planos fijos con silencio; S11–S12 aceleran con la carrera y el pueblo y se calman en el CTA. Movimientos de cámara: *dolly* hacia dentro, *tilt* abajo, viaje lateral, *rack focus*, *dolly* hacia atrás, *tilt* arriba, grúa y planos fijos.

## 6. Mapa de ritmo, música y sonido

Rejilla: 66 bpm (negra .909 s), compás de 4/4 = 3,64 s. Cortes y golpes caen en la palabra, no en cada tiempo. Tonalidad: **re dórico** (re–mi–fa–sol–la–si–do) en el mediodía y **re mayor** desde el clímax. Instrumentos nuevos para la marca: `recorder` (flauta de pastor), `guitar_nylon` y `vibraphone_bowed` (el agua). Sin batería: solo golpes sueltos de `frame_drum`.

| Sección | Tiempo | Música | Ambiente | Foley |
|---|---|---|---|---|
| Gancho (S1) | 0–3,4 | Desde 0 s: pedal muy bajo de `cellos` en re; la `recorder` dice el motivo (re–fa–mi–la) | **Chicharras** de mediodía, viento caliente y seco | Roce de papel al entrar el título; pasos lejanos en tierra |
| Sol (S2) | 3,4–8,1 | `guitar_nylon` en punteo escaso | Chicharras más fuertes bajo el sol | Tela al sentarse Jesús; piedra |
| Llegada (S3–S4) | 8,1–15,4 | La `recorder` responde; sigue la `guitar_nylon` | Chicharras | **Cántaro de barro sobre piedra** (golpe seco); sandalias en el polvo |
| Pozo y agua viva (S5) | 15,4–19,0 | Cuerdas graves que bajan por grados; en «agua viva», una nota de `vibraphone_bowed` (la4) | Las chicharras se apagan al bajar por el tiro; eco hueco de piedra | Gota que cae y resuena en el fondo; crujido de soga |
| **Silencio 1** | 19,0–20,5 | **Nada** (meta: −55 dB o menos) | Solo tono de sala muy bajo; chicharras cortadas en seco | Ninguno |
| Marido (S7) | 20,5–27,4 | Primer sonido tras el silencio: la voz sola en «Ve, llama a tu marido»; después `cellos` en re y la `recorder` muy suave, sin resolver | Chicharras de vuelta, a la mitad | Cántaro que se apoya; tela |
| Monte (S8) | 27,4–33,8 | Entran `violas` y `harp` en arpegio; el motivo sube una cuarta | Viento que refresca | Brazo de ella: roce de papel |
| **Silencio 2** | 33,8–35,4 | **Nada** (meta: −55 dB o menos) | Tono de sala | Ninguno |
| **Clímax (S10)** | 35,4–38,8 | Primer sonido: **una gota en el fondo del pozo** con eco largo, y la voz en «Yo soy». Luego `vibraphone_bowed` y `hand_chimes` en escalera (una nota por anillo que se enciende: re–fa#–la–re), y en «soy» `violins`, `violas`, `cellos` y `horn` abren en re mayor | Nada más que la música | Chasquido de interruptor en el agua y un brillo que sube (*shimmer*); el `burst` con un acorde de `hand_chimes` |
| Cántaro y carrera (S11) | 38,8–44,9 | `harp` en corcheas y `recorder` en re mayor; un golpe de `frame_drum` (`small`) en «corre» | Viento templado; las voces del pueblo entran .5 s antes del corte a S12 (J-cut) | Pasos que corren en tierra, alejándose; puerta de madera en «¡Vengan a ver!» |
| Pueblo y CTA (S12) | 44,9–47,3 | Cuerdas bajas sostenidas; la `recorder` cierra el motivo resuelto (re–fa#–la–re); `harp` sola bajo el CTA | Murmullo de mucha gente que se acerca, pájaros de tarde | Muchos pasos; golpecito de cartulina cuando Clawd se gira |

- Voz al frente (RMS ~−18 dB), música −5/−6 dB bajo la voz, foley entre −24 y −34 dB, final −14 LUFS.
- Transiciones sonoras: el eco del pozo entra .4 s antes del corte a S5 (J-cut); las chicharras de S4 pasan por encima del corte a S5 y se apagan en el tiro (L-cut); las voces del pueblo entran antes de S12 (J-cut).
- `timpani` no se usa; si hiciera falta, con nota (`'D2'`). `celesta` suena como glockenspiel: aquí se usa `hand_chimes`.
- Comprobar por tramos en `out/mix.wav` que los dos silencios existen de verdad (meta −55 dB o menos) antes de entregar.

## 7. Subtítulos y título

- Blanco cálido, serif grande para móvil, en la banda oscura inferior (`bottom: 350px`). Como el mediodía es claro, la capa frontal de cada plano de día es tierra en sombra casi negra (`#16130e`) que llega hasta abajo; si no alcanza, banda oscura tenue detrás del texto. Nunca sobre la boca del pozo encendida ni sobre el `burst`.
- Palabras clave en oro: *nunca*, *toda su vida*, *mediodía*, *pozo de Jacob*, *cansado*, *dame de beber*, *no se tratan*, *agua viva*, *marido*, *cinco*, *espíritu y en verdad*, *Mesías*, *Yo soy*, *cántaro*, *vengan a ver*, *muchos creyeron*, *una palabra*.
- Título solo al principio: tira de papel «LA MUJER SAMARITANA» (Cinzel 800) y «Juan 4:1–42» (Playfair cursiva), colocada en función de la cámara. Esas palabras no se repiten en subtítulos.
- Ningún otro texto en pantalla: sin tarjetas, contadores, iconos, globos ni CTA gráfico. El último subtítulo (CTA) dura hasta el final.

## 8. Qué hay que construir (sin motor nuevo)

- `actors.js`: un `cantaro()` (lámina de barro pálido `#c9b48e`, no terracota, con borde de luz) que va al hombro de la mujer y luego en el brocal; una opción `veil` en `human()` para el manto de ella; una zancada de carrera (rotación de piernas) para S11; un grupo `crowd(n)` de 4–5 siluetas en una sola lámina para S12.
- `shots.js`: `well(S, o)` (cielo, lomas, camino, brocal frontal y colores por parámetro para mediodía, tibio y oro); `shaft(S, o)` (corte transversal: suelo cortado, tres anillos de piedra a tres profundidades, agua), que usan S5 y S10; `town(S, o)` (loma con casas y dos ventanas emisivas) para S11.
- Mediodía: luz cenital (top spot casi vertical, sombras cortas y duras, radio de sombra bajo), grade desaturado y de alto contraste, viñeta más fuerte (`vig` .55–.6) para el ahogo. Sin calima de partículas.
- Clímax: animar `uTrans` de cada anillo (.05 → .7) y mover `uLight` del agua a la boca con un escalonado de .35 s; un solo `burst(.17, .3, '#ffd79a')` en la boca en «soy». Bloom .45 solo en S10; en el resto, .25–.38. `maxCoc` 6–8 en todos.
- `timeline.py`: momentos clave `nunca`, `vida`, `mediodia`, `aqui`, `beber`, `tratan`, `agua`, `sil1`, `marido`, `cinco`, `verdad`, `mesias`, `sil2`, `soy`, `cantaro`, `vengan`, `creyeron`, `cta`.
- `voices/lines.json`: voz `ef_dora`, `lang: es-419`, speed 1.0, y después `robot_voice.py` a 0.6.

## 9. Portada

- **Imagen:** el pozo en el instante del clímax, en vertical: Clawd grande sentado en el brocal (izquierda y centro), Jesús sentado al otro lado en silueta serena con borde de luz, la mujer de pie con el cántaro, y entre ellos una columna de luz dorada que empieza a subir de la boca del pozo. Arriba, el cielo blanco de mediodía oscurecido con una viñeta parda; abajo, el oro que nace del pozo. Mediodía sofocante y oro en una sola imagen.
- **Gancho (5 palabras, con pregunta):** «NUNCA LA VIO. ¿CÓMO SABÍA?», en Cinzel crema, entre 270 y 700 px desde arriba, sobre la parte oscurecida del cielo (no sobre la luz). El 20 % inferior queda vacío.

## 10. Reglas de fidelidad

- Solo los hechos de Juan 4: Jesús, cansado del camino, se sienta junto al pozo a la hora sexta; pide de beber; ella se extraña porque judíos y samaritanos no se tratan; el agua viva; «Ve, llama a tu marido»; «No tengo marido»; cinco maridos, y el que tiene ahora no es su marido; adorar en espíritu y en verdad; el Mesías y «Yo soy, el que habla contigo»; deja el cántaro, va al pueblo y dice «vengan a ver»; muchos creyeron.
- **Con delicadeza y sin juicio:** no se dibujan los maridos, no se explica por qué vino a mediodía (el texto no lo dice), no se le añade vergüenza ni pecado que el texto no nombra. Él no se aparta; ella levanta la cabeza.
- Jesús y la mujer son siluetas serenas, sin rasgos ni gestos teatrales: él solo levanta un brazo al pedir agua y abre la mano en «espíritu y verdad». Dios no aparece como figura: solo luz (la que sube del pozo y la del sol).
- Neutral entre iglesias: el monte se ve, pero no se nombra ni se discute qué lugar de culto es el correcto; se dice la respuesta del texto. No se muestran los discípulos que vuelven (4:27), para no alargar, sin contradecir el texto.
- Clawd es un recurso narrativo: no habla con los personajes, no interviene, no cambia los hechos. La descripción lo aclara y declara que el contenido se hizo con IA.
- Sin promesas de milagros ni chantaje espiritual en el cierre; el CTA es una pregunta de una palabra sobre la vida del espectador.
