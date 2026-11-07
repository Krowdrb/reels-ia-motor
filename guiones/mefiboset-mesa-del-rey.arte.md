# Dirección de arte — mefiboset-mesa-del-rey

2 Samuel 4:4; 9:1–13 · **Biblia: historias** (Antiguo Testamento) · estilo **`cinematico`** (obligatorio, decisión del dueño) · experimento de duración 35–45 s.

## Decisiones generales
- **Estilo:** `"style": "cinematico"`. Solo animación + subtítulos de la narración. El único texto en pantalla es el `title_card` del comienzo. Sin beats, sin tarjetas, sin motion graphics, sin CTA gráfico.
- **Ángulo:** destino invertido + «¿Por qué…?» sobre un detalle concreto (aprendizajes 2026-11-07; investigación 2026-11-07: Mefiboset 12x y 15x, «Llegó ante el rey sin nada… y terminó en su mesa»). El gancho plantea la pregunta y la escena 3 la responde: **«por amor a Jonatán»** (9:1, 9:7).
- **Voz:** `em_santa`, `speed` 1.0. Música orquestal desde el segundo 0, con el coro y el golpe grave en la escena 6.
- **Duración objetivo:** 40–45 s, unas **105–112 palabras** de VO en 7 escenas de 4–8 s. Si pasa de 45 s, se recorta primero la escena 4 (Lodebar, se puede fundir como 2.º plano de la 3) y luego «te devolveré las tierras de Saúl» de la 6; nunca el gancho ni el «no tengas miedo».
- **Arco de color:** night → night → dusk → dusk → dawn → **holy (flare, clímax)** → golden. Un solo `flare`, en la revelación/clímax.
- **`title_card`:** `{"text": "A la mesa<br>del rey", "sub": "2 Samuel 9", "dur": 3.4}` (4 palabras). Entra en ≤0,35 s sobre la escena 1, que ya está en movimiento (push) desde el fotograma 0.
- **Personajes (siluetas serenas y dignas, sin caricatura):**
  - **Mefiboset adulto** = `robed` con `staff: true` (el bastón es el único apoyo que dibuja el motor; no hay muletas). Siempre de pie con su bastón o arrodillado al postrarse; nunca cayendo, nunca torcido. `lit: true` solo en el clímax y el cierre.
  - **Mefiboset niño** = `child` (5 años, 4:4).
  - **La nodriza** = `woman`.
  - **David** = `king` (corona; con `lit: true` la corona sale dorada). Poses `stand` y `open`; nunca `point` hacia Mefiboset (no debe leerse como acusación).
  - **Siba** = `robed` en `bow`, al fondo de la corte.
  - **Los hijos del rey** = `crowd` (`n` 3), solo en el cierre.
- **Dios no aparece como figura.** La gracia se cuenta con la luz: la puerta del palacio encendida (`palace` con `lit`) que se ve lejana en la noche del gancho y que en el clímax inunda el cuadro (`holy` + `rays`).
- **La cojera con respeto:** el bastón (`staff`) en todas las escenas de adulto, y en la escena 2 el niño queda arrodillado (`kneel`) junto a la nodriza inclinada: no se muestra la caída, solo el después.
- **Lo que el motor no tiene** (revisado en `page/cine.html`): no hay elemento `table` ni pose `sit`, ni muletas. La «mesa» se sugiere con el `palace` iluminado y el banquete con los hijos alrededor. *(Mejora opcional del motor, fuera de este guion: un set `table` larga en silueta, `depth: "near"`, y una pose `sit`, para el plano final.)*
- **Fidelidad:** «Saúl fue enemigo de David todos los días» (1 Sam 18:29) sostiene el gancho; 5 años, la noticia de Saúl y Jonatán, la nodriza huye y se le cae el niño, queda cojo (2 Sam 4:4); «¿no ha quedado nadie de la casa de Saúl… por amor de Jonatán?» (9:1, 9:3); hijo de Jonatán lisiado, en Lodebar, en casa de Maquir (9:3–4); se postra; «¿quién es tu siervo, para que mires a un perro muerto como yo?» (9:6–8); «No tengas temor», tierras de Saúl, comerá siempre a su mesa (9:7, 9:10); «como uno de los hijos del rey… estaba lisiado de ambos pies» (9:11, 9:13). No se añade nada fuera del texto (ni etimologías de Lodebar ni el episodio posterior de Siba, 2 Sam 16 y 19).

## Escena por escena (VO propuesta; *palabras clave* en dorado)

### 1 · Gancho (0–4,5 s) · `mood: night` · `trans: cut`
- **VO:** «Era nieto del enemigo de David. ¿Por qué terminó comiendo en su *mesa*?» (12 palabras; la primera frase dura <2 s y lleva el giro).
  - Alternativa: «Era nieto del enemigo del rey… y el rey lo sentó a su *mesa*. ¿Por qué?»
- **Plano:** noche azul; a lo lejos el palacio con la puerta encendida (la promesa del final). En primer plano Mefiboset de espaldas a la cámara, solo, con su bastón, mirando la luz. La cámara ya avanza en el fotograma 0.
```json
{"set": ["hills", {"el": "palace", "x": 0.5, "depth": "far", "lit": true}, {"el": "cypress", "x": 0.86, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.48, "y": 0.6}, "light": {"x": 0.72, "y": 0.18},
 "chars": [{"who": "robed", "x": 0.45, "depth": "near", "pose": "stand", "staff": true}], "fx": ["fog", "dust"]}
```

### 2 · La caída (4,5–11 s) · `mood: night` · `trans: dip`
- **VO:** «Tenía cinco años cuando murió su padre, Jonatán. Al huir, su nodriza lo dejó *caer*: quedó *cojo* de ambos pies.» (20)
- **Plano 1:** la huida. Paneo lateral sobre colinas y olivos; la nodriza con el niño a su lado.
- **Plano 2 (`at: "caer"`, `trans: fade`):** el después, sin mostrar la caída: el niño arrodillado en el suelo, la nodriza inclinada sobre él. Niebla baja, luna detrás.
```json
{"set": ["hills", {"el": "olive", "x": 0.18, "depth": "near"}, {"el": "city", "x": 0.75, "depth": "far", "s": 0.7}],
 "cam": "panL", "light": {"x": 0.7, "y": 0.2},
 "chars": [{"who": "woman", "x": 0.5, "depth": "near", "pose": "stand"},
           {"who": "child", "x": 0.6, "depth": "near", "pose": "stand"}], "fx": ["fog"]},
{"at": "caer", "trans": "fade", "set": ["hills", {"el": "rocks", "x": 0.85, "depth": "front"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.65}, "light": {"x": 0.5, "y": 0.22},
 "chars": [{"who": "woman", "x": 0.44, "depth": "near", "pose": "bow"},
           {"who": "child", "x": 0.56, "depth": "near", "pose": "kneel"}], "fx": ["fog", "dust"]}
```

### 3 · La pregunta del rey (11–17 s) · `mood: dusk` · `trans: dip`
- **VO:** «Años después, David preguntó: ¿queda alguien de la casa de Saúl, para mostrarle bondad por amor a *Jonatán*?» (19). Responde el «¿por qué?» del gancho.
- **Plano:** atardecer rojizo en la corte. David de pie junto al trono, Jerusalén al fondo; Siba entra inclinado en «Saúl».
```json
{"set": [{"el": "city", "x": 0.5, "depth": "far"}, {"el": "palm", "x": 0.12}, {"el": "throne", "x": 0.62, "depth": "mid"}],
 "cam": "push", "focus": {"x": 0.55, "y": 0.6}, "light": {"x": 0.82, "y": 0.46},
 "chars": [{"who": "king", "x": 0.55, "depth": "near", "pose": "stand"},
           {"who": "robed", "x": 0.82, "depth": "near", "pose": "bow", "at": "Saúl"}], "fx": ["dust"]}
```

### 4 · Lodebar (17–21 s) · `mood: dusk` · `trans: fade`
- **VO:** «Quedaba uno: un hijo de Jonatán, *lisiado*, en Lodebar.» (9)
- **Plano:** tierra seca y lejana al último sol. Una tienda, rocas, y Mefiboset de pie con su bastón, pequeño en el paisaje. Paneo lento: el rey lo está buscando.
```json
{"set": ["dunes", {"el": "tent", "x": 0.3, "depth": "mid"}, {"el": "rocks", "x": 0.86, "depth": "front"}],
 "cam": "panR", "light": {"x": 0.2, "y": 0.45},
 "chars": [{"who": "robed", "x": 0.56, "depth": "near", "pose": "stand", "staff": true}], "fx": ["fog", "dust"]}
```

### 5 · «Un perro muerto» (21–28 s) · `mood: dawn` · `trans: fade`
- **VO:** «Lo trajeron ante el rey, y se postró: ¿quién es tu siervo, para que mires a un *perro muerto* como yo?» (20)
- **Plano 1:** amanecer rosa y lila ante el palacio. Mefiboset arrodillado, con el bastón a su lado; David de pie, sereno, todavía en sombra.
- **Plano 2 (`at: "perro"`, `trans: fade`):** la cámara baja y se acerca a Mefiboset postrado; el rey queda en el borde del cuadro.
```json
{"set": [{"el": "palace", "x": 0.5, "depth": "mid"}],
 "cam": "push", "focus": {"x": 0.5, "y": 0.62}, "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.38, "depth": "near", "pose": "kneel", "staff": true},
           {"who": "king", "x": 0.64, "depth": "near", "pose": "stand"}], "fx": ["fog", "dust"]},
{"at": "perro", "trans": "fade", "set": [{"el": "palace", "x": 0.55, "depth": "mid"}],
 "cam": "tiltDown", "light": {"x": 0.55, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.42, "depth": "near", "pose": "kneel", "staff": true},
           {"who": "king", "x": 0.78, "depth": "near", "pose": "stand"}], "fx": ["fog"]}
```

### 6 · CLÍMAX: «No tengas miedo» (28–35 s) · `mood: holy` · `trans: flare` · `climax: true` · **PORTADA**
- **VO:** «Pero David le dijo: *No tengas miedo*. Te devolveré las tierras de Saúl, y comerás siempre a mi *mesa*.» (19)
- **Plano:** la puerta del palacio estalla en luz (ahí entra el coro). David, iluminado, abre los brazos; Mefiboset, iluminado, **de pie** con su bastón frente a él, con halo de luz: el que estaba postrado ya está levantado. `pull` con las figuras entre x 0.38 y 0.62 (el bastón cae en ~0.68).
```json
{"set": [{"el": "hills", "depth": "far"}, {"el": "palace", "x": 0.5, "depth": "mid", "lit": true}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.6}, "light": {"x": 0.5, "y": 0.55},
 "chars": [{"who": "king", "x": 0.38, "depth": "near", "pose": "open", "lit": true, "sash": "#7A2E3A", "dy": -20},
           {"who": "robed", "x": 0.6, "depth": "near", "pose": "stand", "staff": true, "lit": true, "robe": "#F4F0E6", "glow": true, "dy": -20}],
 "fx": ["rays", "dust"]}
```

### 7 · Cierre: como uno de sus hijos (35–44 s) · `mood: golden` · `trans: fade`
- **VO:** «Y comió siempre con el rey, como uno de sus *hijos*. Etiqueta a alguien que necesita saber que tiene un lugar en la *mesa*.» (23)
  - UNA sola petición hablada (etiquetar). Sin «escribe AMÉN».
- **Plano:** mañana dorada; el palacio encendido al fondo. Los hijos del rey a un lado, Mefiboset en el centro con su bastón y luz, David al otro lado. Cámara `rise` lenta.
```json
{"set": ["hills", {"el": "palace", "x": 0.5, "depth": "far", "lit": true}, {"el": "olive", "x": 0.1, "depth": "near"}],
 "cam": "rise", "light": {"x": 0.5, "y": 0.3},
 "chars": [{"who": "crowd", "x": 0.24, "depth": "near", "n": 3, "pose": "stand"},
           {"who": "robed", "x": 0.5, "depth": "near", "pose": "stand", "staff": true, "lit": true, "robe": "#F4F0E6", "glow": true},
           {"who": "king", "x": 0.74, "depth": "near", "pose": "open", "lit": true, "sash": "#7A2E3A"}],
 "fx": ["rays", "dust"]}
```

Total VO: unas 122 palabras en la versión completa → **recortar a ~108** para quedar en 40–45 s: en la 6, «Te devolveré las tierras de Saúl, y comerás…» → «Comerás siempre a mi *mesa*» (−6); en la 7, «que necesita saber que tiene un lugar» → «que necesita un lugar» (−4); en la 5, «Lo trajeron ante el rey, y se postró» → «Se postró ante el rey» (−4).

## Reglas comprobadas
- Todos los valores existen en `page/cine.html`. Sets: hills, palace (`lit`), cypress, olive, city, rocks, palm, throne, dunes, tent. Cámaras: push, panL, panR, tiltDown, pull, rise. Moods: night, dusk, dawn, holy, golden. Transiciones: cut, dip, fade, flare. Personajes: robed, king, woman, child, crowd. Poses: stand, bow, kneel, open. Opciones: staff, lit, robe, sash, glow, dy, at. Efectos: fog, dust, rays.
- Una sola escena con `climax: true` (la 6), y es la única con `flare`.
- El plano `pull` (escena 6) tiene sus figuras en x 0.38 y 0.60.
- Dios no aparece como figura: solo luz (`holy`, `rays`, palacio encendido).
- No hay texto en pantalla aparte del `title_card`.

## Portada
- **TikTok (fotograma 0):** el `title_card` «A la mesa / del rey · 2 Samuel 9» sobre Mefiboset con su bastón mirando el palacio encendido en la noche.
- **Fotograma de portada (cover.py / `COVER_T`):** el **clímax**, unos **2,0 s después de que empieza la escena 6**, cuando el destello se ha disipado: David con los brazos abiertos y Mefiboset de pie, ambos iluminados, ante la puerta del palacio con los rayos. cover.py ya da prioridad al clímax y a los rayos; si elige otro, forzar `COVER_T` = inicio de la escena 6 + 2,0 (de timeline.json).
- **`thumbnail`:** `{"big": "", "lines": ["A LA MESA", "*DEL REY*"], "icon": ""}`.
- **Título de YouTube sugerido:** «Era nieto del enemigo del rey… ¿por qué comió en su mesa? 👑 | Mefiboset #shorts».
