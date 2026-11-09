# Dirección de arte — gigantes-de-la-biblia

Números 13:32–33 · Deuteronomio 3:11 · 1 Samuel 17:4–7, 40, 49–50 · **Biblia: datos** (candidato en prueba principal, 3.er video del subnicho) · estilo **`cinematico`** (obligatorio, decisión del dueño) · experimento en curso: **CTA de una palabra** (sin «Etiqueta»).

## Decisiones generales
- **Estilo:** `"style": "cinematico"`. Solo animación y subtítulos de la narración. El único texto en pantalla es el `title_card` del comienzo. Sin beats, sin motion graphics, sin tarjetas, sin cifras en títulos y sin CTA gráfico. **Las medidas van en la voz y en los subtítulos** (y en la descripción).
- **Molde de edades (el mejor video):** personaje + cifra + pregunta en el segundo 0 («Goliat medía casi 3 metros. ¿Qué tan grandes eran los gigantes de la Biblia?»), **14 planos en ~43 s**, `title_card` visible desde el fotograma 0 y portada = fotograma 0.
- **Voz:** `em_santa`, `speed` 1.0. Música orquestal desde el segundo 0: en menor y grave durante los gigantes (escenas 1–4), se aclara con el muchacho al amanecer (escena 5), pasa a mayor con coro y golpe grave en la caída (escena 6, clímax).
- **Duración objetivo:** 41–45 s, **~109 palabras** en 8 escenas. Si el render pasa de 45 s, recortar en este orden: (1) «de Israel»/«de Gat» sobrantes, (2) la frase de la lanza en la escena 4 («y la punta de su lanza pesaba 7»). Nunca se recortan el gancho, las langostas, la cama de Og, la caída ni el CTA.
- **Cifras en los subtítulos:** la VO lleva los números en dígitos y se pronuncian con `pronunciation`:
  ```json
  "pronunciation": {"3": "tres", "4": "cuatro", "1,8": "uno coma ocho", "18": "uno coma ocho", "57": "cincuenta y siete", "7": "siete"}
  ```
  (`"18"` es solo para `ph_len`, que quita la coma al medir la palabra; no aparece en la VO. `spoken_text` usa límites de palabra, así que «7» no toca a «57».)
- **Arco de color = arco emocional:** night (miedo: Goliat y los espías «como langostas») → dusk (tamaño: la cama de Og y la armadura de Goliat, tensión rojiza) → dawn (un muchacho con una honda) → **holy (flare, clímax: la piedra y la caída)** → golden (lección y CTA).
- **`title_card`:** `{"text": "¿Cuánto medía<br>Goliat?", "sub": "Números 13 · Deuteronomio 3 · 1 Samuel 17", "dur": 3.4}`. 3 palabras en forma de pregunta (igual que «¿Cuánto vivió Matusalén?»), sin cifra: la cifra la dice la voz en el segundo 0 y sale en el subtítulo.
- **Fidelidad (solo los hechos permitidos):** espías y «hijos de Anac», «éramos a nuestros ojos como langostas» (Nm 13:33); cama de hierro de Og, rey de Basán, 9 × 4 codos ≈ 4 × 1,8 m (Dt 3:11); Goliat de Gat, «seis codos y un palmo», casi 3 m **según el texto hebreo tradicional** (decirlo en la descripción; la VO dice «casi 3 metros»), cota de 5.000 siclos ≈ 57 kg, punta de lanza de 600 siclos ≈ 7 kg (1 S 17:4–7); David, cayado, cinco piedras lisas del arroyo, honda (1 S 17:40); la piedra se clava en la frente y cae (1 S 17:49–50). **Nada sobre los nefilim** ni sobre la estatura de Og (el texto da la cama, no su altura). 2 Samuel 21:20 (seis dedos) queda fuera por tiempo.
- **Dios = solo luz.** Nunca figura. En el clímax, rayos `holy` desde arriba sobre David.

### Qué soporta el motor (`page/cine.html`) y cómo lo usamos
- **Gigante:** no hay figura «giant», pero toda silueta acepta **`s` (escala)**, que se multiplica por la de su profundidad (near 1 · mid 0,7 · front 1,35). Una figura `near` mide 420 px con `s: 1` (≈ 1,7 m). **Goliat = `soldier` con `s: 1.75`** (≈ 3 m frente a soldados de `s: 1`): la proporción es la del texto.
- **Guerrero:** `soldier` ya trae casco con penacho, **lanza** (a la derecha, x + 110·s) y **escudo redondo** (a la izquierda, x − 90·s). Sirve para Goliat y para los soldados.
- **Rey:** `king` (corona) para Og.
- **David:** `shepherd` (cayado automático, fiel a 1 S 17:40) con `s: 0.85` y sin barba para que se lea joven; en el lanzamiento, `robed` sin bastón con `pose: "point"` (brazo extendido = el tiro). **No existe honda ni piedra dibujada:** la honda se dice en la voz y el impacto se hace con el `flare`.
- **Caída:** no hay pose «caído». Goliat cae con **`pose: "kneel"`** (baja a 0,66 de su altura); el destello del `flare` tapa el cambio de pose.
- **Arroyo:** `sea` en `depth: "front"` con `y` bajo (como el mar del diluvio en edades) + `rocks` en primer término.
- **Cama:** **no existe** el elemento. La escena 3 va con lo que existe (plano por defecto, abajo). Opcional: si el motor suma un `bed` (6 líneas, propuesta al final), el plano 2 de la escena 3 muestra la cama a escala real.
- **Apariciones:** `chars[].at` (palabra) hace que una figura aparezca en esa palabra; lo usamos para que Goliat surja en la escena 4 y David en la 5.
- **Regla de `pull`:** en los planos con `cam: "pull"` todas las figuras importantes van entre x 0,3 y 0,7 (en pantalla x 0,3 ≈ 244 px y 0,7 ≈ 836 px).

## Escena por escena (VO propuesta; *palabras clave* en dorado)

### 1 · Gancho: Goliat, casi 3 metros (0–4,8 s) · `mood: night` · `trans: cut` · **PORTADA (fotograma 0)**
- **VO:** «Goliat medía casi *3* metros. ¿Qué tan grandes eran los *gigantes* de la Biblia?» (13). Arranca antes de 0,3 s.
- **Plano 1:** valle de noche, luna alta a la derecha. Goliat enorme (`soldier`, `s` 1.75) a la derecha con lanza y escudo, recortado contra la luna; dos soldados de tamaño normal a su izquierda le llegan al pecho. Push lento hacia el gigante desde el fotograma 0. El `title_card` queda arriba, sobre el cielo y la cabeza oscura del gigante (oro sobre silueta: buen contraste).
- **Plano 2 (`at: "gigantes"`, `trans: "fade"`):** paneo a la derecha por una cresta con tres siluetas gigantes en fila (los hijos de Anac que verán los espías), niebla baja.
```json
{"set": ["hills", {"el": "rocks", "x": 0.2, "depth": "front"}, {"el": "cypress", "x": 0.9, "depth": "mid"}],
 "cam": "push", "focus": {"x": 0.6, "y": 0.5}, "light": {"x": 0.72, "y": 0.2},
 "chars": [{"who": "soldier", "x": 0.33, "depth": "near"},
           {"who": "soldier", "x": 0.44, "depth": "near"},
           {"who": "soldier", "x": 0.64, "depth": "near", "s": 1.75}],
 "fx": ["fog", "dust"]},
{"at": "gigantes", "trans": "fade",
 "set": ["hills", {"el": "cypress", "x": 0.1, "depth": "near"}],
 "cam": "panR", "light": {"x": 0.3, "y": 0.2},
 "chars": [{"who": "robed", "x": 0.32, "depth": "mid", "s": 2.1, "beard": true},
           {"who": "robed", "x": 0.52, "depth": "mid", "s": 2.3, "beard": true},
           {"who": "robed", "x": 0.72, "depth": "mid", "s": 2.0, "beard": true}],
 "fx": ["fog", "dust"]}
```
- **Comprobar:** la punta de la lanza de Goliat queda a ~350 px de la parte superior; si el `title_card` la tapa, bajar `light.y` no hace falta: basta con `s: 1.7`.
- **punch:** «3», «gigantes».

### 2 · Los espías: «como langostas» (4,8–10,3 s) · `mood: night` · `trans: fade`
- **VO:** «Los espías vieron a los hijos de Anac y dijeron: éramos a nuestros ojos como *langostas*.» (15)
- **Plano 1:** cuatro espías pequeños abajo, en primer término (`crowd` `s` 0.75), encogidos; en la colina de atrás, dos hijos de Anac enormes (`robed` `mid`, `s` 2.2) que los dominan. La cámara sube (tiltUp) de los espías a los gigantes: el miedo es mirar hacia arriba.
- **Plano 2 (`at: "langostas"`, `trans: "fade"`):** contraplano desde el gigante: su silueta oscura ocupa el borde derecho en primer término (`front`), y los espías se ven diminutos en medio del valle. Push lento hacia los espías.
```json
{"set": ["hills", {"el": "city", "x": 0.5, "depth": "far"}, {"el": "rocks", "x": 0.15, "depth": "front"}],
 "cam": "tiltUp", "light": {"x": 0.5, "y": 0.18},
 "chars": [{"who": "robed", "x": 0.3, "depth": "mid", "s": 2.2, "beard": true},
           {"who": "robed", "x": 0.7, "depth": "mid", "s": 2.2, "beard": true},
           {"who": "crowd", "x": 0.5, "depth": "near", "n": 4, "s": 0.75, "pose": "bow"}],
 "fx": ["fog", "dust"]},
{"at": "langostas", "trans": "fade",
 "set": ["hills", {"el": "olive", "x": 0.2, "depth": "mid"}],
 "cam": "push", "focus": {"x": 0.42, "y": 0.6}, "light": {"x": 0.35, "y": 0.2},
 "chars": [{"who": "crowd", "x": 0.42, "depth": "mid", "n": 4, "s": 0.6, "pose": "bow"},
           {"who": "robed", "x": 0.86, "depth": "front", "s": 1.5, "beard": true}],
 "fx": ["fog"]}
```
- **punch:** «langostas».

### 3 · La cama de Og: 4 × 1,8 m (10,3–16,5 s) · `mood: dusk` · `trans: dip`
- **VO:** «La cama de hierro de Og, rey de Basán, medía *4* metros de largo y *1,8* de ancho.» (17)
- **Plano 1:** atardecer rojizo en Basán. El palacio de Og al fondo; Og (`king`, coronado) de pie delante, más alto que sus dos siervos (`s` 1.4: el texto lo llama del resto de los refaítas, pero **no** da su estatura, así que la escala es moderada). TiltUp lento de los siervos a la corona.
- **Plano 2 (`at: "medía"`, `trans: "fade"`), por defecto (sin elemento nuevo):** los dos siervos señalan (`point`) hacia el rey: la medida. Push hacia el centro. La cifra la llevan la voz y el subtítulo.
```json
{"set": [{"el": "palace", "x": 0.5, "depth": "far"}, "hills", {"el": "palm", "x": 0.14, "depth": "mid"}],
 "cam": "tiltUp", "light": {"x": 0.7, "y": 0.42},
 "chars": [{"who": "robed", "x": 0.3, "depth": "near"},
           {"who": "king", "x": 0.5, "depth": "near", "s": 1.4, "beard": true},
           {"who": "robed", "x": 0.7, "depth": "near"}],
 "fx": ["dust"]},
{"at": "medía", "trans": "fade",
 "set": [{"el": "palace", "x": 0.5, "depth": "far"}, "hills"],
 "cam": "push", "focus": {"x": 0.5, "y": 0.55}, "light": {"x": 0.62, "y": 0.42},
 "chars": [{"who": "robed", "x": 0.28, "depth": "near", "pose": "point"},
           {"who": "king", "x": 0.52, "depth": "near", "s": 1.4, "beard": true}],
 "fx": ["dust", "fog"]}
```
- **Plano 2 si el motor suma `bed` (recomendado):** la cama de hierro sola, a escala real, con un hombre de pie a su lado (ambos en `mid`: hombre 294 px ≈ 1,7 m → 4 m ≈ 693 px = `w` 815 × 0,85).
```json
{"at": "medía", "trans": "fade",
 "set": ["hills", {"el": "palace", "x": 0.5, "depth": "far"}, {"el": "bed", "x": 0.5, "depth": "mid", "w": 815}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.6}, "light": {"x": 0.62, "y": 0.42},
 "chars": [{"who": "robed", "x": 0.5, "depth": "mid", "dy": 0}],
 "fx": ["dust"]}
```
  (El hombre en x 0,5 queda delante del centro de la cama: se lee «la cama es más del doble que él».)
- **punch:** «4», «1,8».

### 4 · Goliat: armadura de 57 kg, lanza de 7 (16,5–23,5 s) · `mood: dusk` · `trans: fade`
- **VO:** «Goliat de Gat llevaba una cota de malla de *57* kilos, y la punta de su lanza pesaba *7*.» (19)
- **Plano 1:** el valle de Ela: dos ejércitos en dos colinas (multitudes lejanas a izquierda y derecha). Goliat avanza en medio, enorme, entre soldados normales; aparece en «Goliat» (`at`). TiltUp de los pies al casco: se siente el peso.
- **Plano 2 (`at: "lanza"`, `trans: "fade"`):** push hacia la parte alta de la lanza (focus arriba a la derecha de Goliat), sol rojo bajo detrás.
```json
{"set": ["hills", {"el": "rocks", "x": 0.85, "depth": "front"}],
 "cam": "tiltUp", "light": {"x": 0.35, "y": 0.45},
 "chars": [{"who": "crowd", "x": 0.15, "depth": "far", "n": 6},
           {"who": "crowd", "x": 0.85, "depth": "far", "n": 6},
           {"who": "soldier", "x": 0.3, "depth": "near"},
           {"who": "soldier", "x": 0.54, "depth": "near", "s": 1.75, "at": "Goliat"}],
 "fx": ["dust"]},
{"at": "lanza", "trans": "fade",
 "set": ["hills"],
 "cam": "push", "focus": {"x": 0.6, "y": 0.35}, "light": {"x": 0.68, "y": 0.4},
 "chars": [{"who": "soldier", "x": 0.5, "depth": "near", "s": 1.75}],
 "fx": ["dust", "fog"]}
```
- **Comprobar:** `crowd` en `far` sale pequeña (escala 0,45); si no se lee, pasar a `mid` con `n: 5`.
- **punch:** «57», «7».

### 5 · Un muchacho con una honda (23,5–29 s) · `mood: dawn` · `trans: fade`
- **VO:** «Y frente a él salió un muchacho, con cinco piedras del arroyo y una *honda*.» (15)
- **Plano 1:** amanecer rosado, niebla. David (`shepherd`, `s` 0.85, sin barba) se arrodilla junto al arroyo a escoger las piedras (rocas en primer término, agua baja). Paneo a la derecha.
- **Plano 2 (`at: "honda"`, `trans: "fade"`):** el plano del duelo: David pequeño a la izquierda, de pie con su cayado; Goliat enorme a la derecha, a contraluz del sol que nace. Push lento hacia el espacio entre los dos.
```json
{"set": ["hills", {"el": "sea", "depth": "front", "y": 0.78}, {"el": "rocks", "x": 0.62, "depth": "front"}, {"el": "olive", "x": 0.86, "depth": "mid"}],
 "cam": "panR", "light": {"x": 0.75, "y": 0.42},
 "chars": [{"who": "shepherd", "x": 0.4, "depth": "near", "s": 0.85, "pose": "kneel"}],
 "fx": ["fog", "dust"]},
{"at": "honda", "trans": "fade",
 "set": ["hills", {"el": "rocks", "x": 0.2, "depth": "front"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.55}, "light": {"x": 0.55, "y": 0.4},
 "chars": [{"who": "shepherd", "x": 0.32, "depth": "near", "s": 0.85},
           {"who": "soldier", "x": 0.68, "depth": "near", "s": 1.75}],
 "fx": ["fog", "dust"]}
```
- **Comprobar:** en el plano 1 el agua (`sea` front con `y` 0.78) no debe tapar a David; si lo tapa, `y: 0.82` o David a `dy: -40`.
- **punch:** «honda».

### 6 · CLÍMAX: la piedra y la caída (29–33,5 s) · `mood: holy` · `trans: flare` · `climax: true`
- **VO:** «Una piedra se clavó en su *frente*… y el gigante *cayó*.» (11)
- **Plano 1 (entra con el `flare` = el impacto):** David con el brazo extendido hacia Goliat (`robed`, `point`, iluminado), Goliat todavía de pie a la derecha; rayos de luz desde arriba sobre David (Dios = solo luz). Push.
- **Plano 2 (`at: "cayó"`, `trans: "flare"`):** segundo destello y Goliat ya de rodillas (`kneel`), su lanza baja; David de pie, iluminado, con los brazos abiertos al cielo. Pull lento que revela el valle. Figuras en x 0,36 y 0,62.
```json
{"set": ["hills", {"el": "rocks", "x": 0.15, "depth": "front"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.55}, "light": {"x": 0.38, "y": 0.18},
 "chars": [{"who": "robed", "x": 0.34, "depth": "near", "s": 0.85, "pose": "point", "lit": true, "robe": "#EDE6D8", "sash": "#B5452F", "glow": true},
           {"who": "soldier", "x": 0.66, "depth": "near", "s": 1.75}],
 "fx": ["rays", "dust"]},
{"at": "cayó", "trans": "flare",
 "set": ["hills", {"el": "olive", "x": 0.88, "depth": "mid"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.58}, "light": {"x": 0.4, "y": 0.18},
 "chars": [{"who": "robed", "x": 0.36, "depth": "near", "s": 0.85, "pose": "arms", "lit": true, "robe": "#EDE6D8", "sash": "#B5452F", "glow": true},
           {"who": "soldier", "x": 0.62, "depth": "near", "s": 1.75, "pose": "kneel"}],
 "fx": ["rays", "dust"]}
```
- Música: coro y golpe grave en el `flare` de la escena; el segundo `flare` en «cayó» es el remate visual.
- **punch:** «frente», «cayó».

### 7 · Lección: tu gigante también puede caer (33,5–37,5 s) · `mood: golden` · `trans: fade`
- **VO:** «No ganó el más *grande*. Tu gigante también puede *caer*.» (10)
- **Plano:** la persona de hoy (`robed`, sin barba ni bastón, como en edades) de pie en la cima, bañada en oro, frente a una sombra enorme que se aleja en el horizonte (un `robed` gigante en `far`). Rise lento.
```json
{"set": ["hills", {"el": "olive", "x": 0.16, "depth": "mid"}],
 "cam": "rise", "light": {"x": 0.55, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.72, "depth": "far", "s": 2.4},
           {"who": "robed", "x": 0.45, "depth": "near", "pose": "stand", "lit": true, "robe": "#F4F0E6", "glow": true}],
 "fx": ["rays", "dust"]}
```
- **punch:** «caer».

### 8 · CTA de una palabra (37,5–42 s) · `mood: golden` · `trans: fade`
- **VO:** «¿Cómo se llama tu gigante? Respóndelo en una *palabra*.» (9). Experimento en curso: una sola pregunta hablada, se responde con una palabra; sin «Etiqueta», sin «AMÉN», sin dos peticiones.
- **Plano:** la persona de hoy, brazos abiertos, centrada; el sol detrás. Pull lento. Figura en x 0,5.
```json
{"set": ["hills", {"el": "olive", "x": 0.14, "depth": "near"}, {"el": "palm", "x": 0.86, "depth": "mid"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.56}, "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.5, "depth": "near", "pose": "open", "lit": true, "robe": "#F4F0E6", "glow": true}],
 "fx": ["rays", "dust"]}
```

## Portada
- **Portada = fotograma 0** (regla de aprendizajes): `title_card` «¿CUÁNTO MEDÍA GOLIAT?» sobre el plano 1 de la escena 1, con Goliat enorme a contraluz de la luna y dos soldados normales a su lado: el tamaño se entiende sin cifra.
- **Segunda opción (cover.py, si se usa):** el clímax (escena 6, plano 1): David iluminado señalando al gigante bajo los rayos `holy` (cover.py da +0,5 al clímax y +0,2 por `rays`).
- **Miniatura de YouTube/FB (aparte, si se diseña):** `{"big": "3 m", "lines": ["*GOLIAT*"], "icon": ""}`; si el dueño no quiere cifras ni ahí: `{"big": "", "lines": ["¿CUÁNTO MEDÍA", "*GOLIAT*?"]}`.

## Metadatos sugeridos
- **Título de YouTube:** «Goliat medía casi 3 metros… ¿y los otros gigantes? 📏 | Los gigantes de la Biblia #shorts»
- **Descripción:** cada medida con su cita: los espías, «éramos a nuestros ojos como langostas» (Números 13:33) · la cama de hierro de Og, nueve codos por cuatro, unos 4 × 1,8 m (Deuteronomio 3:11) · Goliat, «seis codos y un palmo», casi 3 m según el texto hebreo tradicional; cota de 5.000 siclos (~57 kg) y punta de lanza de 600 siclos (~7 kg) (1 Samuel 17:4–7) · cinco piedras lisas y una honda (1 Samuel 17:40) · la piedra en la frente (1 Samuel 17:49–50). Cierre: «¿Cómo se llama tu gigante? Respóndelo en una palabra 👇».
- **Hashtags:** biblia, datosbiblicos, curiosidadesbiblicas, goliat, davidygoliat, gigantes, fe, dios, shorts.

## Propuesta opcional para el motor: elemento `bed`
No es necesario para renderizar (la escena 3 ya funciona sin él). Si se añade, va en `EL` de `page/cine.html` y en `DEF` (`bed: 'mid'`):
```js
bed:(o,c,L)=>{const x=o.x,s=o.s,g=o.gy,w=(o.w||980)*s,h=w/2;return `<rect x="${x-h}" y="${g-170*s}" width="${w}" height="${44*s}" fill="${c}"/>`+
  `<rect x="${x-h}" y="${g-330*s}" width="${30*s}" height="${330*s}" fill="${c}"/><rect x="${x+h-30*s}" y="${g-250*s}" width="${30*s}" height="${250*s}" fill="${c}"/>`+
  `<rect x="${x-h+60*s}" y="${g-130*s}" width="${22*s}" height="${130*s}" fill="${c}"/><rect x="${x+h-82*s}" y="${g-130*s}" width="${22*s}" height="${130*s}" fill="${c}"/>`+
  `<rect x="${x-h+30*s}" y="${g-196*s}" width="${w-60*s}" height="${30*s}" rx="${12*s}" fill="${mix(c,L.light,.18)}"/>`},
```
