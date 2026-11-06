# Dirección de arte — edades-en-la-biblia

Génesis 5:5 · 5:27 · 6:3 · 9:29 · 25:7 · Deuteronomio 34:7 · Salmo 90:10, 90:12 · **Biblia: datos** (candidato en prueba, 2.º video del subnicho) · estilo **`cinematico`** (obligatorio, decisión del dueño) · experimento de duración 35–45 s.

## Decisiones generales
- **Estilo:** `"style": "cinematico"`. Solo animación y subtítulos de la narración. El único texto en pantalla es el `title_card` del comienzo. Sin beats, sin motion graphics, sin tarjetas, sin cifras en títulos y sin CTA gráfico. **Las cifras van en la voz y en los subtítulos** (y en la descripción).
- **Fórmula (métricas 2026-11-06):** personaje famoso + cifra + pregunta en los primeros 2 s («Matusalén vivió 969 años. ¿Y cuánto vivieron los demás?»), una escena ilustrada por cada cifra, cierre con la lección y **un solo CTA hablado** (etiquetar a alguien).
- **Voz:** `em_santa`, `speed` 1.0. Música orquestal desde el segundo 0: en menor, misteriosa durante los siglos de vida, más sobria cuando las vidas se acortan, y pasa a mayor con coro en el clímax (escena 7, Salmo 90:12).
- **Duración objetivo:** 40–44 s, unas **100 palabras** de VO en 8 escenas de 4–9 s. Si el render pasa de 45 s, se recorta en este orden: (1) «Eran vidas de siglos» (escena 2), (2) «Las vidas se iban acortando» (escena 4). Nunca se recortan el gancho, Moisés, el Salmo 90:12 ni el CTA.
- **Cifras en los subtítulos:** la VO lleva los números en dígitos (salen así en los subtítulos, que es donde el espectador los lee) y se pronuncian con `pronunciation` (`engine/build.py` → `spoken_text` los sustituye solo en el audio):
  ```json
  "pronunciation": {"969": "novecientos sesenta y nueve", "930": "novecientos treinta", "950": "novecientos cincuenta",
                    "175": "ciento setenta y cinco", "120": "ciento veinte", "90": "noventa"}
  ```
- **Arco de color = arco emocional:** night (asombro: Matusalén bajo la luna) → dusk (Adán, mundo primitivo) → storm (Noé y el diluvio; Dios fija 120 años, la luz rompe la tormenta) → night (Abraham bajo las estrellas: las vidas se acortan) → dawn (Moisés mira la tierra prometida) → dawn (el Salmo 90 y la pregunta para hoy) → **holy (flare, clímax: «Enséñanos a contar nuestros días»)** → golden (CTA).
- **`title_card`:** `{"text": "¿Cuánto vivió<br>Matusalén?", "sub": "Génesis 5:27 · Salmo 90:12", "dur": 3.4}`. 3 palabras, sin cifra (la cifra la dice la voz en el segundo 0 y aparece en el subtítulo). Va encima de la escena 1, que ya está en movimiento (push) desde el fotograma 0.
- **Personajes (siluetas serenas, sin caricatura; en la oscuridad sin rostro):**
  - **Matusalén, Adán, Noé, Abraham, Moisés** = `robed` con `beard: true`. Los ancianos (Matusalén, Abraham, Moisés) llevan además `staff: true`. Nunca `lit` (son el pasado, en silueta).
  - **La persona de hoy** = `robed` **sin barba ni bastón** (silueta neutra y atemporal: el motor no tiene ropa moderna, y así cualquiera se ve en ella). Es la única figura que se ilumina (`lit`, `glow`) en el clímax.
  - **Generaciones / gente de hoy** = `woman`, `child` y `crowd` (`n` 3–5).
- **Dios = solo luz.** Nunca figura. En la escena 3 (Génesis 6:3) un haz de luz rompe la tormenta (`fx: rays` con la luz alta); en el clímax, ambiente `holy` con rayos desde arriba.
- **Fidelidad (solo los hechos permitidos):** Adán 930 (Gn 5:5); Matusalén 969, el que más vivió (Gn 5:27); Noé 950 (Gn 9:29); «serán sus días ciento veinte años» (Gn 6:3); Abraham 175 (Gn 25:7); Moisés 120, «sus ojos nunca se oscurecieron» (Dt 34:7); setenta años, ochenta los más robustos (Sal 90:10); «Enséñanos a contar nuestros días, para que traigamos al corazón sabiduría» (Sal 90:12). Sin explicaciones científicas de las edades ni teorías sobre por qué se acortan.
  - **Ojo con Génesis 6:3:** en el texto, Dios lo dice **antes** del diluvio (Gn 6:3 precede al relato del diluvio, Gn 6–8), no después. Por eso la VO dice «en sus días» (los días de Noé), que es fiel, y no «tras el diluvio».
- **Todos los valores de abajo existen en `page/cine.html`:** sets (`hills`, `dunes`, `mountain`, `rocks`, `palm`, `cypress`, `olive`, `sea`, `ark`, `tent`, `star`, `sheep`), cams (`push`, `pull`, `panR`, `tiltUp`, `rise`), fx (`fog`, `dust`, `rays`, `rain`), `events` lightning, poses (`stand`, `pray`, `arms`, `open`, `kneel`), y `y`/`sy` en elementos de `set` (motor, línea ~212: `gy: e.y`, `sy: e.sy`; `star` usa `sy` como altura en el cielo).
- **Regla de `pull`:** en los planos con `cam: "pull"` (escenas 7 y 8) todas las figuras importantes van entre x 0.3 y 0.7.

## Escena por escena (VO propuesta; *palabras clave* en dorado)

### 1 · Gancho: Matusalén, 969 años (0–4,5 s) · `mood: night` · `trans: cut`
- **VO:** «Matusalén vivió *969* años. ¿Y cuánto vivieron los *demás*?» (9 palabras). Arranca antes de 0,3 s.
- **Plano 1:** colinas primitivas bajo la luna, cipreses y rocas. Matusalén, anciano con bastón, de pie en primer término, recortado contra el halo lunar. Push lento hacia él desde el fotograma 0.
- **Plano 2 (`at: "demás"`, `trans: "fade"`):** la cámara se abre a una cresta con una hilera de siluetas (las generaciones), paneo a la derecha.
```json
{"set": ["hills", {"el": "cypress", "x": 0.16, "depth": "mid"}, {"el": "cypress", "x": 0.86, "depth": "near"}, {"el": "rocks", "x": 0.5}],
 "cam": "push", "focus": {"x": 0.46, "y": 0.6}, "light": {"x": 0.66, "y": 0.22},
 "chars": [{"who": "robed", "x": 0.46, "depth": "near", "pose": "stand", "beard": true, "staff": true}],
 "fx": ["fog", "dust"]},
{"at": "demás", "trans": "fade",
 "set": ["hills", {"el": "cypress", "x": 0.12, "depth": "near"}],
 "cam": "panR", "light": {"x": 0.7, "y": 0.22},
 "chars": [{"who": "crowd", "x": 0.5, "depth": "mid", "n": 5, "pose": "stand"}],
 "fx": ["fog", "dust"]}
```
- **punch / palabras clave:** «969», «demás».

### 2 · Adán, 930 años (4,5–9,5 s) · `mood: dusk` · `trans: fade`
- **VO:** «Adán, el primer hombre, vivió *930* años. Eran vidas de *siglos*.» (11)
- **Plano:** paisaje primitivo y vacío al atardecer: dunas y colinas, palmeras, ovejas lejanas. Adán solo, de pie, mirando el sol bajo. Paneo lento a la derecha.
- **Plano 2 (`at: "siglos"`, `trans: "fade"`):** el mismo mundo desde arriba (`rise`), sin figuras: el tiempo que pasa.
```json
{"set": ["dunes", {"el": "palm", "x": 0.18, "depth": "near"}, {"el": "palm", "x": 0.8, "depth": "mid", "s": 0.8}, {"el": "sheep", "x": 0.72, "depth": "mid"}],
 "cam": "panR", "light": {"x": 0.7, "y": 0.5},
 "chars": [{"who": "robed", "x": 0.42, "depth": "near", "pose": "stand", "beard": true}],
 "fx": ["dust"]},
{"at": "siglos", "trans": "fade",
 "set": ["mountain", "hills", {"el": "palm", "x": 0.25, "depth": "mid"}],
 "cam": "rise", "light": {"x": 0.55, "y": 0.52}, "fx": ["fog", "dust"]}
```
- **punch:** «930».

### 3 · Noé, 950 años · Dios fija 120 (9,5–16 s) · `mood: storm` · `trans: dip`
- **VO:** «Noé vivió *950*. Pero en sus días, Dios dijo: serán sus días *120* años.» (14)
- **Plano 1:** el arca sobre el mar del diluvio, lluvia y relámpago en «950». Noé de pie en la cubierta, a la derecha del techo (para que su silueta se recorte contra el cielo y no se funda con el arca), en oración. Push lento hacia el arca.
- **Plano 2 (`at: "Dios"`, `trans: "fade"`):** mismo encuadre, la tormenta se abre: un haz de luz cae desde arriba sobre el arca (Dios = solo luz). Sin relámpagos nuevos.
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "ark", "x": 0.5, "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.74}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.62}, "light": {"x": 0.5, "y": 0.2},
 "chars": [{"who": "robed", "x": 0.77, "depth": "mid", "pose": "pray", "beard": true, "dy": -187}],
 "fx": ["rain", "fog"], "events": [{"at": "950", "do": "lightning"}]},
{"at": "Dios", "trans": "fade",
 "set": [{"el": "sea", "depth": "mid"}, {"el": "ark", "x": 0.5, "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.74}],
 "cam": "tiltUp", "light": {"x": 0.5, "y": 0.1},
 "chars": [{"who": "robed", "x": 0.77, "depth": "mid", "pose": "arms", "beard": true, "dy": -187}],
 "fx": ["rays", "rain", "fog"]}
```
- **Comprobar en el render:** el arca `mid` tiene la cubierta a ~187 px sobre su suelo (220 × 0,85), de ahí `dy: -187`; el techo ocupa x ≈ 0,26–0,74, por eso Noé va en x 0,77. Si la silueta flota o no se lee, alternativa: Noé `near` en x 0,3 de rodillas sobre `{"el": "rocks", "x": 0.3}` mirando el arca.
- **punch:** «120» (la cifra que rima con Moisés en la escena 5).

### 4 · Abraham, 175 años: las vidas se acortan (16–20,5 s) · `mood: night` · `trans: fade`
- **VO:** «Abraham vivió *175* años. Las vidas se iban *acortando*.» (9)
- **Plano:** desierto bajo un cielo lleno de estrellas (el ambiente night ya pone 70 estrellas que titilan, más 3 `star` grandes). Abraham anciano, con bastón, junto a su tienda, mirando al cielo. La cámara sube despacio (tiltUp) hacia las estrellas.
```json
{"set": ["dunes", {"el": "tent", "x": 0.72, "depth": "mid"},
         {"el": "star", "x": 0.3, "sy": 0.12, "s": 0.6}, {"el": "star", "x": 0.6, "sy": 0.07, "s": 0.9}, {"el": "star", "x": 0.82, "sy": 0.18, "s": 0.5}],
 "cam": "tiltUp", "light": {"x": 0.25, "y": 0.2},
 "chars": [{"who": "robed", "x": 0.4, "depth": "near", "pose": "stand", "beard": true, "staff": true}],
 "fx": ["dust"]}
```
- **punch:** «acortando».

### 5 · Moisés, 120 años: sus ojos nunca se oscurecieron (20,5–26 s) · `mood: dawn` · `trans: fade`
- **VO:** «Moisés murió a los *120*, y sus ojos nunca se *oscurecieron*.» (11)
- **Plano 1:** Moisés en la cima del monte (rocas en primer término, a la izquierda, figura elevada), con bastón, mirando a la derecha hacia el valle de la tierra prometida: colinas y palmeras lejanas bajo el sol naciente. Paneo a la derecha que sigue su mirada.
- **Plano 2 (`at: "ojos"`, `trans: "fade"`):** push hacia Moisés; el sol entra con rayos sobre su silueta (los ojos que no se oscurecen = la luz).
```json
{"set": [{"el": "rocks", "x": 0.28, "depth": "front"}, "hills", {"el": "palm", "x": 0.68, "depth": "far"}, {"el": "palm", "x": 0.78, "depth": "far", "s": 0.8}],
 "cam": "panR", "light": {"x": 0.8, "y": 0.42},
 "chars": [{"who": "robed", "x": 0.32, "depth": "near", "pose": "stand", "beard": true, "staff": true, "dy": -120}],
 "fx": ["fog", "dust"]},
{"at": "ojos", "trans": "fade",
 "set": [{"el": "rocks", "x": 0.28, "depth": "front"}, "hills", {"el": "palm", "x": 0.7, "depth": "far"}],
 "cam": "push", "focus": {"x": 0.34, "y": 0.52}, "light": {"x": 0.72, "y": 0.4},
 "chars": [{"who": "robed", "x": 0.34, "depth": "near", "pose": "stand", "beard": true, "staff": true, "dy": -120}],
 "fx": ["rays", "dust"]}
```
- **punch:** «oscurecieron».

### 6 · El Salmo 90 y la pregunta para hoy (26–34,5 s) · `mood: dawn` · `trans: fade`
- **VO:** «El Salmo 90 habla de setenta años; los más robustos, *ochenta*. Así que la pregunta no es cuántos años vives… sino qué haces con *ellos*.» (24)
- **Plano 1:** una familia de hoy (abuelo, madre, niño) camina por una colina al amanecer: tres generaciones, una vida de setenta u ochenta años. Paneo a la derecha.
- **Plano 2 (`at: "pregunta"`, `trans: "fade"`):** la persona de hoy, sola en la cima, frente al sol que nace. Push lento. Todavía en silueta (la luz llega en el clímax).
```json
{"set": ["hills", {"el": "olive", "x": 0.15, "depth": "mid"}, {"el": "olive", "x": 0.86, "depth": "near"}],
 "cam": "panR", "light": {"x": 0.72, "y": 0.44},
 "chars": [{"who": "robed", "x": 0.34, "depth": "near", "pose": "stand", "beard": true, "staff": true},
           {"who": "woman", "x": 0.5, "depth": "near", "pose": "stand"},
           {"who": "child", "x": 0.62, "depth": "near", "pose": "stand"}],
 "fx": ["fog", "dust"]},
{"at": "pregunta", "trans": "fade",
 "set": ["hills", {"el": "olive", "x": 0.82, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.6}, "light": {"x": 0.5, "y": 0.42},
 "chars": [{"who": "robed", "x": 0.5, "depth": "near", "pose": "stand"}],
 "fx": ["fog", "dust"]}
```
- **punch:** «ellos» (máx. 2 claves: «ochenta», «ellos»).

### 7 · CLÍMAX: «Enséñanos a contar nuestros días» (34,5–39,5 s) · `mood: holy` · `trans: flare` · `climax: true` · **PORTADA**
- **VO:** «*Enséñanos* a contar nuestros días, para que traigamos al corazón *sabiduría*.» (11) Cita literal del Salmo 90:12.
- **Plano:** destello y la misma persona, ahora iluminada (ropa clara, rostro sereno, halo), brazos abiertos en la cima; la luz divina cae desde arriba con rayos fuertes y polvo dorado. Pull lento que revela el paisaje. Figura centrada (x 0,5, dentro de 0,3–0,7).
```json
{"set": ["hills", {"el": "olive", "x": 0.14, "depth": "near"}, {"el": "olive", "x": 0.86, "depth": "mid"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.58}, "light": {"x": 0.5, "y": 0.2},
 "chars": [{"who": "robed", "x": 0.5, "depth": "near", "pose": "open", "lit": true, "robe": "#F4F0E6", "glow": true}],
 "fx": ["rays", "dust"]}
```
- Música: entra el coro y el golpe grave en el flare.

### 8 · CTA (39,5–44 s) · `mood: golden` · `trans: fade`
- **VO:** «Etiqueta a alguien con quien quieres aprovechar cada *día*.» (10). Un solo CTA, hablado; sin «escribe AMÉN» ni «responde SÍ».
- **Plano:** dos personas de hoy juntas (y un niño) en la colina, bañadas en oro, el sol detrás. Pull lento. Figuras en x 0,4–0,6.
```json
{"set": ["hills", {"el": "olive", "x": 0.16, "depth": "mid"}, {"el": "palm", "x": 0.84, "depth": "mid"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.56}, "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.4, "depth": "near", "pose": "stand"},
           {"who": "woman", "x": 0.6, "depth": "near", "pose": "stand"},
           {"who": "child", "x": 0.5, "depth": "near", "pose": "arms"}],
 "fx": ["rays", "dust"]}
```

## Portada
- **Fotograma 0 / portada (cover.py):** el clímax (escena 7): la persona iluminada con los brazos abiertos bajo los rayos `holy` — cover.py ya da +0,5 al clímax y +0,2 a los planos con `rays`. Segunda opción: Moisés con rayos (escena 5, plano 2).
- **Portada de YouTube/FB (`thumbnail`, diseño aparte):** `{"big": "969", "lines": ["AÑOS", "*MATUSALÉN*"], "icon": ""}` (mismo formato que dinero-en-la-biblia; si el dueño no quiere cifras ni ahí, usar `{"big": "", "lines": ["¿CUÁNTO VIVIÓ", "*MATUSALÉN*?"]}`).

## Metadatos sugeridos
- **Título de YouTube:** «Matusalén vivió 969 años… ¿y los demás? ⏳ | Las edades en la Biblia #shorts»
- **Descripción:** cada cifra con su cita: Adán 930 (Génesis 5:5) · Matusalén 969, el que más vivió (Génesis 5:27) · Noé 950 (Génesis 9:29) · «serán sus días ciento veinte años» (Génesis 6:3) · Abraham 175 (Génesis 25:7) · Moisés 120, «sus ojos nunca se oscurecieron» (Deuteronomio 34:7) · setenta años, ochenta los más robustos (Salmo 90:10) · «Enséñanos a contar nuestros días…» (Salmo 90:12). Cierre: «👥 Etiqueta a alguien con quien quieres aprovechar cada día.»
- **Hashtags:** biblia, datosbiblicos, curiosidadesbiblicas, matusalen, fe, dios, cristianos, salmo90, shorts.
