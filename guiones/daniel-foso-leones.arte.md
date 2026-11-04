# Dirección de arte — daniel-foso-leones

Daniel 6 · **Biblia: historias** (Antiguo Testamento) · estilo **`cinematico`** (obligatorio, decisión del dueño) · experimento de duración 35–45 s.

## Decisiones generales
- **Estilo:** `"style": "cinematico"`. Solo animación + subtítulos de la narración. El único texto en pantalla es el `title_card` del comienzo. Sin beats, sin motion graphics, sin CTA gráfico.
- **Ángulo nuevo:** se cuenta desde **la noche del rey que no durmió** (Dn 6:18). El video arranca *en medio* de esa noche, vuelve atrás para contar la trampa y se resuelve al amanecer frente al foso.
- **Voz:** `em_santa`, `speed` 1.0. Música orquestal desde el segundo 0, que crece hasta el clímax (coro en la escena 6).
- **Duración objetivo:** 40–44 s, unas **100–105 palabras** de VO en 7 escenas de 4–8 s. Si pasa de 45 s, se recorta la escena 2 (trampa), nunca el gancho ni el clímax.
- **Arco de color:** night → dusk → dusk → night → **dawn (flare)** → **holy (flare, clímax)** → golden.
- **`title_card`:** `{"text": "Una noche<br>con leones", "sub": "Daniel 6", "dur": 3.4}`. Son 4 palabras y hacen de portada en TikTok. Va encima de la escena 1, que ya está en movimiento (push) desde el fotograma 0.
- **Personajes (siluetas serenas, sin caricatura):**
  - **Daniel** = `robed` con `beard: true` (anciano y digno). Solo lleva `lit: true` y `glow` en el clímax y el cierre.
  - **Darío** = `king` (lleva corona). Va solo en las escenas de noche, sin dramatismo exagerado: poses `stand`, `bow`, `point` y `open`.
  - **Sátrapas** = `crowd` (`n` 2–3), siempre de fondo, sin rostro.
  - **Guardias** = `soldier`.
- **Dios y el ángel (Dn 6:22) = solo luz.** Rayos (`rays`) y resplandor que salen de la boca del foso en el clímax. Nunca una figura humana, ni `robed` con `glow` haciendo de ángel.
- **El foso** = elemento `tomb` (cueva en la roca con piedra redonda en la entrada). Encaja con «trajeron una piedra y la pusieron sobre la puerta del foso, la cual selló el rey con su anillo» (Dn 6:17). Cerrado en las escenas 4–5; en el clímax, `open: true` **sin `lit`**, porque `lit` dibuja los lienzos blancos del sepulcro y aquí no corresponden. La luz del clímax sale de `light` (puesta en la boca del foso), de `rays` y del ambiente `holy`.
- **Leones:** **el motor no tiene elemento ni personaje de león** (revisado en GUION.md y en `page/cine.html`: no existe `lion` en sets ni en `who`). No se sustituyen por otro animal (`sheep` sería un error). Quedan implícitos en la voz y en la boca oscura del foso, como el «fuera de cuadro» de una película. Así además siguen calmados: nunca se ven atacando. *(Mejora opcional del motor, fuera de este guion: añadir un set `lion` echado, en silueta tranquila, para usarlo en el clímax a x 0.42 y 0.68 con `depth: "near"`.)*
- **Fidelidad:** trampa de los sátrapas, decreto de 30 días (6:7), Daniel ora tres veces al día con las ventanas abiertas hacia Jerusalén (6:10), el rey se angustia y no puede revocar su ley (6:14–15), lo echan al foso y el rey sella la piedra con su anillo (6:16–17), noche sin comer ni dormir (6:18), al amanecer corre al foso (6:19–20), respuesta de Daniel: «Mi Dios envió su ángel, el cual cerró la boca de los leones» (6:22), sale sin lesión «porque había creído en su Dios» (6:23). **Se omite el castigo de los acusadores (6:24)** porque es violento y quitarlo no altera el sentido. Tampoco se muestra a Daniel cayendo al foso.

## Escena por escena (VO propuesta; *palabras clave* en dorado)

### 1 · Gancho, en medio de la noche (0–5 s) · `mood: night` · `trans: cut`
- **VO:** «Esa noche el rey no pudo *dormir*: había condenado a Daniel a los *leones*.» (13 palabras)
  - Alternativa: «El rey pasó la noche sin dormir… y al amanecer corrió al foso de los leones.»
- **Plano:** terraza del palacio. Darío solo frente a Babilonia dormida, con la escena en movimiento desde el fotograma 0.
```json
{"set": [{"el": "city", "x": 0.5, "depth": "far"}, {"el": "palm", "x": 0.86, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.45, "y": 0.6}, "light": {"x": 0.72, "y": 0.18},
 "chars": [{"who": "king", "x": 0.45, "depth": "near", "pose": "stand"}], "fx": ["fog", "dust"]}
```

### 2 · La trampa (5–10 s) · `mood: dusk` · `trans: dip`
- **VO:** «Todo fue una *trampa*: durante treinta días, orar solo al *rey*.» (11)
- **Plano:** atardecer rojizo en la corte. Los sátrapas señalan y el rey está junto al trono.
```json
{"set": [{"el": "city", "x": 0.5, "depth": "far"}, {"el": "palm", "x": 0.12}, {"el": "throne", "x": 0.7, "depth": "mid"}],
 "cam": "panR", "light": {"x": 0.82, "y": 0.48},
 "chars": [{"who": "crowd", "x": 0.3, "depth": "near", "n": 3, "pose": "point"},
           {"who": "king", "x": 0.7, "depth": "near", "pose": "stand"}], "fx": ["dust"]}
```

### 3 · La ventana abierta (10–16 s) · `mood: dusk` · `trans: fade`
- **VO:** «Pero Daniel siguió orando *tres veces* al día, con la ventana abierta hacia *Jerusalén*.» (14)
- **Plano:** la luz baja del poniente hace de «ventana abierta». Jerusalén queda lejos, del lado de la luz, y Daniel arrodillado mira hacia ella. En «ventana» aparecen dos acusadores al borde del cuadro: lo han visto.
```json
{"set": ["hills", {"el": "city", "x": 0.2, "depth": "far", "s": 0.7}, {"el": "olive", "x": 0.86, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.55, "y": 0.62}, "light": {"x": 0.18, "y": 0.42},
 "chars": [{"who": "robed", "x": 0.55, "depth": "near", "pose": "pray", "beard": true},
           {"who": "crowd", "x": 0.9, "depth": "near", "n": 2, "pose": "point", "at": "ventana"}],
 "fx": ["rays", "dust"]}
```

### 4 · El foso sellado (16–23 s) · `mood: night` · `trans: dip`
- **VO:** «El rey se *angustió*, pero no pudo salvarlo. Lo echaron al foso, y él selló la piedra con su *anillo*.» (20)
- **Plano 1:** Darío solo e inclinado ante el trono vacío de luz.
- **Plano 2 (`at: "foso"`, `trans: fade`):** la boca del foso cerrada con la piedra. La cámara baja (`tiltDown`) como si descendiera a la oscuridad. Hay un guardia de pie y, en «selló», el rey señala la piedra. No se ve a Daniel caer.
```json
{"set": [{"el": "throne", "x": 0.5, "depth": "mid"}], "cam": "push", "focus": {"x": 0.5, "y": 0.62}, "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "king", "x": 0.5, "depth": "near", "pose": "bow"}], "fx": ["fog"]},
{"at": "foso", "trans": "fade", "set": ["mountain", {"el": "rocks", "x": 0.18, "depth": "near"}, {"el": "tomb", "x": 0.56}],
 "cam": "tiltDown", "light": {"x": 0.3, "y": 0.2},
 "chars": [{"who": "soldier", "x": 0.84, "depth": "near"},
           {"who": "king", "x": 0.32, "depth": "near", "pose": "point", "at": "selló"}], "fx": ["fog", "dust"]}
```

### 5 · Amanecer: el rey corre al foso (23–28 s) · `mood: dawn` · `trans: flare` (revelación 1: se rompe la noche)
- **VO:** «Al amanecer, corrió al foso: Daniel, ¿tu Dios te ha podido *librar*?» (12)
- **Plano:** el mismo foso, ahora con la niebla rosada y lila del amanecer y el sol que nace detrás de la roca. El rey está ante la piedra y llama.
```json
{"set": ["mountain", {"el": "rocks", "x": 0.16, "depth": "near"}, {"el": "tomb", "x": 0.56}],
 "cam": "push", "focus": {"x": 0.56, "y": 0.62}, "light": {"x": 0.72, "y": 0.32},
 "chars": [{"who": "king", "x": 0.34, "depth": "near", "pose": "point"}], "fx": ["fog", "dust"]}
```

### 6 · CLÍMAX: «cerró la boca de los leones» (28–34 s) · `mood: holy` · `trans: flare` · `climax: true` · **PORTADA**
- **VO:** «Y Daniel respondió: Mi Dios envió su *ángel*, y cerró la boca de los *leones*.» (15)
- **Plano:** el foso abierto. La luz divina sale de dentro: el ángel **es** esa luz (rayos fuertes desde la boca del foso), sin ninguna figura. Daniel aparece en «respondió», de pie, iluminado y sereno, en el umbral. El rey, a su izquierda, abre los brazos de alegría (6:23). Las figuras quedan entre x 0.3 y 0.7 porque la cámara es `pull`.
```json
{"set": [{"el": "mountain", "depth": "far"}, {"el": "tomb", "x": 0.56, "open": true}],
 "cam": "pull", "focus": {"x": 0.55, "y": 0.6}, "light": {"x": 0.56, "y": 0.55},
 "chars": [{"who": "king", "x": 0.32, "depth": "near", "pose": "open", "dy": -20},
           {"who": "robed", "x": 0.58, "depth": "near", "pose": "stand", "beard": true, "lit": true, "robe": "#F4F0E6", "glow": true, "at": "respondió", "dy": -30}],
 "fx": ["rays", "dust"]}
```

### 7 · Cierre: confió (34–42 s) · `mood: golden` · `trans: fade`
- **VO:** «Salió *sin daño*, porque confió en su Dios. Etiqueta a alguien que hoy está en su propio *foso*.» (19)
  - Es UNA sola petición hablada: etiquetar. Sin «escribe AMÉN» además.
- **Plano:** mañana dorada sobre Babilonia. Daniel, de pie e iluminado, en el centro; el rey a su lado. Cámara `rise` lenta.
```json
{"set": ["hills", {"el": "city", "x": 0.5, "depth": "far"}, {"el": "palm", "x": 0.14}],
 "cam": "rise", "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.52, "depth": "near", "pose": "open", "beard": true, "lit": true, "robe": "#F4F0E6", "glow": true},
           {"who": "king", "x": 0.32, "depth": "near", "pose": "stand"}],
 "fx": ["rays", "dust"]}
```

Total VO: unas 104 palabras, entre 40 y 44 s con el `title_card` encima de la escena 1.

## Reglas comprobadas
- Todos los valores existen en el motor. Sets: city, palm, throne, hills, olive, mountain, rocks, tomb. Cámaras: push, panR, tiltDown, pull, rise. Moods: night, dusk, dawn, holy, golden. Transiciones: cut, dip, fade, flare. Personajes: king, robed, crowd, soldier. Poses: stand, point, pray, bow, open. Efectos: fog, dust, rays.
- Hay una sola escena con `climax: true` (la 6). Los dos `flare` marcan las dos revelaciones: el amanecer (5) y Daniel vivo (6). Si en el render se siente excesivo, la escena 5 pasa a `fade` y el `flare` queda solo en el clímax.
- El plano `pull` (escena 6) tiene a sus dos figuras en x 0.32 y 0.58.
- No hay texto en pantalla aparte del `title_card`.

## Portada
- **TikTok (fotograma 0):** el `title_card` «Una noche / con leones · Daniel 6» sobre el rey en la terraza nocturna, en push.
- **Fotograma de portada (cover.py / `COVER_T`):** el **clímax**, unos **2,0 s después de que empieza la escena 6**, cuando el destello ya se ha disipado y Daniel está iluminado en la boca del foso con los rayos detrás. cover.py ya da +0,5 al clímax y +0,2 a los rayos, así que debería elegirlo solo. Si elige otro, forzar `COVER_T` = inicio de la escena 6 + 2,0 (se lee en timeline.json).
- **`thumbnail`:** `{"big": "", "lines": ["UNA NOCHE", "*CON LEONES*"], "icon": ""}`.
- **Título de YouTube sugerido:** «El rey no pudo dormir esa noche… 🦁 | Daniel en el foso de los leones #shorts».
