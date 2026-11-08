# Dirección de arte — tentaciones-de-jesus

Mateo 4:1–11 (paralelo Lucas 4:1–13) · **Biblia: historias**, tipo **Vida de Jesús** (candidato en prueba, 4.º video; toca por rotación) · estilo **`cinematico`** (obligatorio, decisión del dueño) · duración 35–45 s (regla) · **experimento CTA de una palabra** (cierre con UNA pregunta hablada).

## Decisiones generales
- **Estilo:** `"style": "cinematico"`. Solo animación y subtítulos de la narración. El único texto en pantalla es el `title_card` del comienzo. Sin beats, sin motion graphics, sin tarjetas, sin CTA gráfico.
- **Ángulo:** no «las tres tentaciones como siempre», sino una pregunta concreta sobre un detalle del texto, respondida por la narración (aprendizajes: «¿Por qué…?» + cifra en el segundo 0). Gancho: **«Llevaba cuarenta días sin comer. ¿Por qué Jesús no convirtió una piedra en pan?»** La escena 3 lo responde («No solo de pan vivirá el hombre») y el estribillo «Escrito está» une las tres respuestas.
- **Orden del relato:** el de **Mateo** (piedras → pináculo → monte), que es la referencia del `title_card`. No se mezcla con el orden de Lucas.
- **Voz:** `em_santa`, `speed` 1.0. Música orquestal desde el segundo 0, en menor y contenida durante las tentaciones; pasa a mayor con coro y golpe grave en «Vete, Satanás» (escena 6).
- **Duración objetivo:** 40–44 s, unas **114 palabras** en 8 escenas y **13 planos** (uno nuevo cada ~3,4 s). Pedro, con 112 palabras, duró 43 s. Si pasa de 45 s, recortar en este orden: (1) escena 7, quitar «Entonces» (−1); (2) escena 3, «haz que estas piedras se conviertan en pan» → «convierte estas piedras en pan» (−4); (3) escena 5, quitar «del mundo» (−2). Nunca se recortan el gancho, «Vete, Satanás» ni la pregunta final.
- **Arco de color (6 ambientes, uno por etapa):** night (ayuno, llega el tentador) → night → dusk (piedras) → dusk (pináculo) → dawn (monte y reinos) → **holy (flare, clímax, «Vete, Satanás»)** → golden (ángeles) → golden (cierre). La luz crece con cada «Escrito está»: Jesús es silueta en la noche, silueta con `glow` en cada respuesta (escenas 3b, 4b, 5), y `lit: true` desde el clímax.
- **`title_card`:** `{"text": "Escrito<br>está", "sub": "Mateo 4:1–11", "dur": 3.4}` (2 palabras: la respuesta que repite Jesús). Alternativa: `"Tres ofertas<br>en el desierto"`. Va sobre la escena 1, que ya está en movimiento (push) desde el fotograma 0.
- **Personajes (siluetas, sin caricatura):**
  - **Jesús** = `jesus`. Silueta en night/dusk; `glow: true` (sin `lit`) en cada «Escrito está»; `lit: true` + `glow: true` + `sash: "#B5452F"` en clímax, ángeles y cierre (misma banda que en Pedro y Lázaro, para que se reconozca).
  - **El tentador** = `robed` **sin `lit`, sin `glow`, sin `beard`, sin accesorios**: una silueta humana oscura, sin rasgos, del color de la capa. El motor no tiene figura de diablo ni la necesita: nada de cuernos, alas, ojos rojos ni horror. Va siempre a contraluz y medio metido en `fog`, en `depth: "mid"` o en el borde del cuadro, nunca más grande ni más alto que Jesús, y nunca en `lit` ni en el ambiente `holy`. En el pináculo y en el clímax **no aparece** (solo su voz citada en la narración); en el cierre ya no está.
  - **Ángeles** = `robed` con `lit: true`, `robe: "#F4F0E6"`, `face: false`, `glow: true`, en `bow` (sirven). Sin alas ni aureola (el motor no dibuja alas y la aureola `halo` se ve infantil): son figuras de luz.
- **Dios = solo luz.** En el clímax la fuente de luz está arriba, sobre Jesús (`light` y ≈ 0.22, `rays`, `holy`).
- **Diferencia visual Jesús/tentador en silueta:** la figura `jesus` lleva pelo largo y barba en el contorno; el `robed` sin barba tiene cabeza lisa. Además, Jesús siempre está más cerca de la luz y el tentador entre la niebla.
- **Fidelidad (RVR1960):** llevado por el Espíritu al desierto (4:1); ayunó cuarenta días y cuarenta noches y tuvo hambre (4:2); «Si eres Hijo de Dios, di que estas piedras se conviertan en pan» (4:3); «Escrito está: No solo de pan vivirá el hombre, sino de toda palabra que sale de la boca de Dios» (4:4); el pináculo del templo, «échate abajo» (4:5–6); «Escrito está también: No tentarás al Señor tu Dios» (4:7); monte muy alto, todos los reinos del mundo y su gloria, «Todo esto te daré, si postrado me adorares» (4:8–9); «Vete, Satanás, porque escrito está: Al Señor tu Dios adorarás, y a él solo servirás» (4:10); el diablo le dejó y vinieron ángeles y le servían (4:11). No se añade nada (ni la cita del Salmo 91 que hace el tentador, por tiempo; se puede poner en la descripción).

## Escena por escena (VO propuesta; *palabras clave* en dorado)

### 1 · Gancho: cuarenta días (0–5 s) · `mood: night` · `trans: cut`
- **VO:** «Llevaba cuarenta días sin comer. ¿Por qué Jesús no convirtió una *piedra* en *pan*?» (14 palabras; la cifra en el primer segundo, la pregunta antes de los 4 s). Arranca antes de 0,3 s.
- **Plano 1:** desierto bajo la luna. Jesús solo, arrodillado y orando sobre las dunas, pequeño frente al cielo. Push lento desde el fotograma 0.
- **Plano 2 (`at: "piedra"`, `trans: "cut"`):** primer término de piedras (`rocks` en `front`) que llenan la parte baja; detrás, Jesús de pie mirándolas. Push hacia las piedras.
```json
{"set": ["dunes", {"el": "rocks", "x": 0.8, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.48, "y": 0.62}, "light": {"x": 0.34, "y": 0.2},
 "chars": [{"who": "jesus", "x": 0.48, "depth": "near", "pose": "pray"}],
 "fx": ["fog", "dust"]},
{"at": "piedra", "trans": "cut",
 "set": ["dunes", {"el": "rocks", "x": 0.5, "depth": "front"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.7}, "light": {"x": 0.62, "y": 0.22},
 "chars": [{"who": "jesus", "x": 0.6, "depth": "near", "pose": "stand"}],
 "fx": ["fog", "dust"]}
```

### 2 · El hambre y el tentador (5–8 s) · `mood: night` · `trans: fade`
- **VO:** «Tenía *hambre*. Y entonces llegó el *tentador*.» (8)
- **Plano:** Jesús de rodillas a la derecha, agotado. A la izquierda, entre la niebla y a contraluz de la luna, aparece en «tentador» una silueta oscura de pie, sin rasgos, más lejos que Jesús. Paneo lento hacia la izquierda (hacia la sombra).
```json
{"set": ["dunes", {"el": "rocks", "x": 0.85, "depth": "front"}],
 "cam": "panL", "light": {"x": 0.28, "y": 0.24},
 "chars": [{"who": "jesus", "x": 0.64, "depth": "near", "pose": "kneel"},
           {"who": "robed", "x": 0.3, "depth": "mid", "pose": "stand", "at": "tentador"}],
 "fx": ["fog", "dust"]}
```

### 3 · Primera tentación: las piedras (8–16 s) · `mood: dusk` · `trans: fade`
- **VO:** «Si eres Hijo de Dios, haz que estas piedras se conviertan en *pan*. *Escrito está*: no solo de pan vivirá el hombre.» (21; la respuesta se entiende por el corte a Jesús en «Escrito»). Responde el «¿por qué?» del gancho.
- **Plano 1:** atardecer rojizo. El tentador a la izquierda señala las piedras del centro (pose `point`, brazo hacia la derecha); Jesús de pie a la derecha. Paneo a la derecha.
- **Plano 2 (`at: "Escrito"`, `trans: "fade"`):** Jesús solo al centro, de pie, con el sol bajo justo detrás de la cabeza: `glow` y los primeros `rays`. La Palabra es la primera luz. Push.
```json
{"set": ["dunes", {"el": "rocks", "x": 0.5, "depth": "near"}, {"el": "palm", "x": 0.9, "depth": "far"}],
 "cam": "panR", "light": {"x": 0.52, "y": 0.42},
 "chars": [{"who": "robed", "x": 0.28, "depth": "near", "pose": "point"},
           {"who": "jesus", "x": 0.74, "depth": "near", "pose": "stand"}],
 "fx": ["fog", "dust"]},
{"at": "Escrito", "trans": "fade",
 "set": ["dunes", {"el": "rocks", "x": 0.2, "depth": "front"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.58}, "light": {"x": 0.5, "y": 0.34},
 "chars": [{"who": "jesus", "x": 0.5, "depth": "near", "pose": "stand", "glow": true}],
 "fx": ["rays", "dust"]}
```

### 4 · Segunda tentación: el pináculo del templo (16–22 s) · `mood: dusk` · `trans: dip`
- **VO:** «Lo puso en lo alto del templo: *Échate abajo*. Escrito está: no tentarás al Señor tu *Dios*.» (17)
- **Plano 1:** vértigo. Jerusalén lejos, el templo en medio y Jesús de pie, diminuto, sobre el vértice del tejado. La cámara sube (`tiltUp`) para sentir la altura. El tentador no se ve: solo la niebla que cubre la base del templo.
- **Plano 2 (`at: "Escrito"`, `trans: "cut"`):** el templo más cerca, Jesús de pie sobre el vértice, sereno, con `glow` y el sol detrás. Push.
- Altura (comprobada en `page/cine.html`): el vértice del `temple` está a `gy − 560·s`. En `mid` (gy 1520, s 0.85) queda en 1044 → Jesús `mid` con `dy: -476`. En `near` (gy 1720, s 1) queda en 1160 → Jesús `near` con `dy: -560`. Si en el render flota o se hunde, ajustar solo `dy` ±20.
```json
{"set": [{"el": "city", "x": 0.5, "depth": "far"}, {"el": "temple", "x": 0.5, "depth": "mid"}],
 "cam": "tiltUp", "light": {"x": 0.7, "y": 0.4},
 "chars": [{"who": "jesus", "x": 0.5, "depth": "mid", "pose": "stand", "dy": -476}],
 "fx": ["fog", "dust"]},
{"at": "Escrito", "trans": "cut",
 "set": [{"el": "city", "x": 0.5, "depth": "far"}, {"el": "temple", "x": 0.5, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.42}, "light": {"x": 0.5, "y": 0.26},
 "chars": [{"who": "jesus", "x": 0.5, "depth": "near", "pose": "stand", "glow": true, "dy": -560}],
 "fx": ["rays", "dust"]}
```

### 5 · Tercera tentación: el monte y los reinos (22–29 s) · `mood: dawn` · `trans: fade`
- **VO:** «Desde un monte alto le mostró los *reinos* del mundo: Todo esto te daré, si me *adoras*.» (17)
- **Plano 1:** cumbre al amanecer rosado, niebla abajo. Jesús en la cima (izquierda) y el tentador un poco más abajo en la ladera (derecha), ambos de pie. Cámara `pull` para revelar la altura: figuras en x 0.42 y 0.6.
- **Plano 2 (`at: "reinos"`, `trans: "fade"`):** la oferta. Contraplano sobre los reinos: Jerusalén y un palacio al fondo bañados de luz rosa y dorada. En primer término, el tentador de espaldas, a la izquierda, señala hacia ellos (`point`, brazo a la derecha); Jesús, a la derecha, con `glow`, no mira hacia donde señala. Paneo a la derecha sobre los reinos.
- Altura: el vértice de `mountain` en `near` está a 1720 − 680 = 1040. Jesús `dy: -675` (cerca de la cima); el tentador, en la ladera, `dy: -655`. Ajustar ±20 en el render si hace falta.
```json
{"set": [{"el": "mountain", "x": 0.5, "depth": "near"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.42}, "light": {"x": 0.3, "y": 0.3},
 "chars": [{"who": "jesus", "x": 0.42, "depth": "near", "pose": "stand", "glow": true, "dy": -675},
           {"who": "robed", "x": 0.6, "depth": "near", "pose": "stand", "dy": -655}],
 "fx": ["fog", "dust"]},
{"at": "reinos", "trans": "fade",
 "set": ["hills", {"el": "city", "x": 0.35, "depth": "far"}, {"el": "palace", "x": 0.72, "depth": "mid", "lit": true}, {"el": "rocks", "x": 0.5, "depth": "front"}],
 "cam": "panR", "light": {"x": 0.6, "y": 0.36},
 "chars": [{"who": "robed", "x": 0.22, "depth": "near", "pose": "point"},
           {"who": "jesus", "x": 0.8, "depth": "near", "pose": "stand", "glow": true}],
 "fx": ["rays", "fog", "dust"]}
```

### 6 · CLÍMAX: «Vete, Satanás» (29–35 s) · `mood: holy` · `trans: flare` · `climax: true` · **PORTADA**
- **VO:** «*Vete, Satanás*. Al Señor tu Dios adorarás, y a él *solo* servirás.» (12)
- **Plano 1:** el destello borra el amanecer. Jesús iluminado (`lit`), de pie en la roca, con el brazo extendido hacia la derecha (`point`): ordena. A la derecha, al borde y en la niebla, la silueta oscura **de espaldas, retirándose** (fuera del cuadro de la luz, en `mid`, x 0.68). Push lento.
- **Plano 2 (`at: "Señor"`, `trans: "fade"`):** ya no hay nadie más. Jesús solo, iluminado, con las manos juntas (`pray`): adora al Padre. La luz cae desde arriba con rayos fuertes (Dios = luz). Cámara `pull`: Jesús en x 0.5.
```json
{"set": ["dunes", {"el": "rocks", "x": 0.42, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.45, "y": 0.55}, "light": {"x": 0.42, "y": 0.22},
 "chars": [{"who": "jesus", "x": 0.4, "depth": "near", "pose": "point", "lit": true, "sash": "#B5452F", "glow": true, "dy": -40},
           {"who": "robed", "x": 0.68, "depth": "mid", "pose": "stand"}],
 "fx": ["rays", "fog", "dust"]},
{"at": "Señor", "trans": "fade",
 "set": ["dunes", {"el": "rocks", "x": 0.5, "depth": "near"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.5}, "light": {"x": 0.5, "y": 0.22},
 "chars": [{"who": "jesus", "x": 0.5, "depth": "near", "pose": "pray", "lit": true, "sash": "#B5452F", "glow": true, "dy": -40}],
 "fx": ["rays", "dust"]}
```

### 7 · Los ángeles le sirven (35–39 s) · `mood: golden` · `trans: fade`
- **VO:** «Entonces el diablo lo dejó, y vinieron *ángeles* y le *servían*.» (11)
- **Plano:** oasis dorado (palmeras). Jesús iluminado al centro; en «ángeles» aparecen a sus lados dos figuras de luz, de túnica blanca y sin rostro, inclinadas. Cámara `rise`.
```json
{"set": ["dunes", {"el": "palm", "x": 0.14, "depth": "mid"}, {"el": "palm", "x": 0.88, "depth": "mid"}],
 "cam": "rise", "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "jesus", "x": 0.5, "depth": "near", "pose": "stand", "lit": true, "sash": "#B5452F", "glow": true},
           {"who": "robed", "x": 0.3, "depth": "near", "pose": "bow", "lit": true, "robe": "#F4F0E6", "face": false, "glow": true, "at": "ángeles"},
           {"who": "robed", "x": 0.7, "depth": "near", "pose": "bow", "lit": true, "robe": "#F4F0E6", "face": false, "glow": true, "at": "ángeles"}],
 "fx": ["rays", "dust"]}
```

### 8 · Lección + CTA de una palabra (39–44 s) · `mood: golden` · `trans: fade`
- **VO:** «Venció con la *Palabra*. ¿Cuál de las tres te cuesta más? Respóndelo en una palabra.» (15; el eco Palabra/palabra es a propósito)
  - Una sola pregunta hablada, ligada a la historia y que se contesta con una palabra (pan, templo o reinos). Sin «Etiqueta», sin «AMÉN», sin segunda petición (experimento en curso).
- **Plano:** plano general dorado que reúne las tres tentaciones en un solo paisaje: piedras en primer término, el templo a la izquierda y el monte a la derecha, a lo lejos. Jesús iluminado, pequeño, de pie en el centro. Cámara `pull`, Jesús en x 0.5.
```json
{"set": ["dunes", {"el": "mountain", "x": 0.78, "depth": "far", "s": 0.8}, {"el": "temple", "x": 0.22, "depth": "far", "s": 0.7}, {"el": "rocks", "x": 0.5, "depth": "front"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.55}, "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "jesus", "x": 0.5, "depth": "mid", "pose": "stand", "lit": true, "sash": "#B5452F", "glow": true}],
 "fx": ["rays", "dust"]}
```

Total VO: **114 palabras** (14 + 7 + 21 + 17 + 17 + 12 + 11 + 15). Pedro, con 112, duró 43 s, así que se esperan 42–45 s. **Si el TTS pasa de 45 s**, aplicar los recortes de «Decisiones generales» (bajan a ~107 palabras).

## Reglas comprobadas
- Todos los valores existen en el motor (`page/cine.html`). Moods: night, dusk, dawn, holy, golden. Transiciones: cut, fade, dip, flare. Sets: dunes, rocks, palm, city, temple, mountain, hills, palace (con `lit`; está en el motor aunque GUION.md no lo lista, ya usado en mefiboset). Cámaras: push, pull, panL, panR, tiltUp, rise. Personajes: jesus, robed. Poses: pray, stand, kneel, point, bow. Efectos: fog, dust, rays. Campos: `glow`, `lit`, `sash`, `robe`, `face: false`, `dy`, `at` en chars (el motor lo resuelve a segundos en build.py, línea 153), `depth` y `s` en sets.
- 8 escenas, **13 planos** (2+1+2+2+2+2+1+1): un plano nuevo cada ~3,4 s.
- Un solo `flare` y una sola escena con `climax: true` (la 6, la revelación «Vete, Satanás»).
- Planos con `pull` (5a, 6b, 8): todas las figuras entre x 0.3 y 0.7 (0.42 y 0.6; 0.5; 0.5).
- Jesús lleva `lit` solo en la luz (escenas 6, 7, 8); en night/dusk/dawn es silueta, con `glow` en cada «Escrito está».
- El tentador: silueta oscura `robed` sin rasgos, sin `lit`, siempre en niebla o en el borde; ausente en el pináculo, en el plano de adoración, con los ángeles y en el cierre. Nada de cuernos ni de demonio.
- No hay texto en pantalla aparte del `title_card`.

## Portada
- **TikTok (fotograma 0):** `title_card` «Escrito está · Mateo 4:1–11» sobre el desierto nocturno con Jesús orando, ya en push.
- **Fotograma de portada (cover.py / `COVER_T`):** el **clímax, plano 2 de la escena 6**, unos **1,2 s después de «Señor»**: Jesús solo, iluminado, con las manos juntas, los rayos cayendo desde arriba sobre el desierto dorado, y sin la silueta oscura en el cuadro. cover.py ya da +0,5 al clímax y +0,2 a los rayos; si elige el plano 1 (con la sombra) o el destello, forzar `COVER_T` = inicio del plano «Señor» + 1,2 (se lee en timeline.json).
- **`thumbnail`:** `{"big": "", "lines": ["ESCRITO", "*ESTÁ*"], "icon": ""}`.
- **Título de YouTube sugerido (gancho = cifra + pregunta):** «40 días sin comer… ¿por qué no convirtió la piedra en pan? | Las tentaciones de Jesús #shorts».
