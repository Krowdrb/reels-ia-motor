# Dirección de arte — pedro-camina-sobre-el-agua

Mateo 14:22–33 · **Biblia: historias**, tipo **Vida de Jesús** (candidato en prueba, 3.er video) · estilo **`cinematico`** (obligatorio, decisión del dueño) · experimento de duración 35–45 s.

## Decisiones generales
- **Estilo:** `"style": "cinematico"`. Solo animación y subtítulos de la narración. El único texto en pantalla es el `title_card` del comienzo. Sin beats, sin motion graphics, sin tarjetas y sin CTA gráfico.
- **Ángulo nuevo:** no se cuenta «Jesús camina sobre el agua como siempre». Se cuenta desde **el instante en que Pedro empieza a hundirse**: el video abre con Pedro sobre el mar en plena tormenta, la voz dice el giro en el segundo 0, vuelve atrás (Jesús orando solo en el monte) y se resuelve en **la mano que lo sostiene**. Es distinto del relato anterior («Jesús calma la tormenta», Marcos 4): aquí Jesús **no** está en la barca. Llega caminando sobre el mar en la cuarta vigilia (de madrugada).
- **Voz:** `em_santa`, `speed` 1.0. Música orquestal desde el segundo 0, en menor y con tensión durante la tormenta, que pasa a mayor con coro en el clímax (escena 7).
- **Duración objetivo:** 40–45 s, unas **105 palabras** de VO en 8 escenas de 4–7 s. Si el render pasa de 45 s, se recorta primero la escena 2 («Jesús oraba solo en el monte», 6 palabras) y después la frase de adoración de la escena 8. Nunca se recortan el gancho, el grito ni la mano.
- **Arco de color:** storm → night → storm → dawn → dawn → storm → **holy (flare, clímax)** → golden. La tormenta es el miedo; el amanecer llega con «yo soy» y la fe de Pedro; vuelve la tormenta cuando mira el viento; la luz divina entra con la mano de Jesús; el oro llega con la calma y la adoración.
- **`title_card`:** `{"text": "¡Señor,<br>sálvame!", "sub": "Mateo 14:22–33", "dur": 3.4}`. Son 2 palabras: el grito de Pedro (14:30) como gancho escrito y portada de TikTok. Alternativa: `"No mires<br>el viento"`. Va encima de la escena 1, que ya está en movimiento (push) desde el fotograma 0.
  - Aviso técnico (no es de este guion): en `page/cine.html` (línea 261) el título todavía entra con fundido (`P(t,0,.35)`), así que el fotograma 0 sale sin título. Las métricas del 2026-11-05 piden opacidad completa desde t = 0.
- **Personajes (siluetas serenas, sin caricatura):**
  - **Jesús** = `jesus`. En la oscuridad es silueta: orando en el monte y como «fantasma» sobre el mar. Lleva `lit: true` + `glow` + `sash: "#B5452F"` desde «yo soy» (escena 4) y en el clímax y el cierre.
  - **Pedro** = `robed` con `beard: true`. Siempre silueta (es el hombre que duda). No lleva `lit`.
  - **Discípulos** = `crowd` (`n` 3) dentro de la barca, sin rostro.
- **Dios = solo luz.** Sin figuras celestiales. En el clímax la luz cae desde arriba sobre la mano de Jesús (`light` alto, `rays`, ambiente `holy`).
- **Cómo se dibuja «sobre el agua» y «hundirse» con el motor (comprobado en `page/cine.html`):**
  - El mar es el elemento `sea` (olas animadas). En una misma capa, los personajes se dibujan **encima** del mar, así que el mar de su propia capa no los tapa. Para que Pedro se hunda hace falta un mar en una capa **más cercana**.
  - Mar base de cada escena en el mar: `{"el": "sea", "depth": "mid"}` (superficie a y 1520) más un mar delantero `{"el": "sea", "depth": "front", "y": 0.72}` (superficie a y ≈ 1742). Los objetos de `set` aceptan `y` (0–1): el motor lo lee en la línea 162 (`gy: e.y*2420`), aunque GUION.md no lo documenta.
  - Personaje `near` con `dy: 0` → pies a y 1720, justo sobre el mar delantero: **camina sobre el agua**.
  - Pedro `near` con `dy` positivo → el mar delantero le tapa las piernas: `dy: 40` (tobillos, empieza a hundirse), `dy: 100` (rodillas), `dy: 140` (cintura).
  - La colina lejana automática del motor (capa far, y 1380) hace de orilla del mar de Galilea al fondo.
- **La mano:** el motor no tiene pose `reach`. Se usa `point` para Jesús (brazo horizontal hacia la derecha, unos 230 px) y `arms` para Pedro (brazos al cielo, gritando). Con Jesús en x 0.40 y Pedro en x 0.66 con `dy: 140`, la punta del brazo de Jesús (x ≈ 824, y ≈ 1390) **coincide con la mano izquierda alzada de Pedro** (x ≈ 824, y ≈ 1400). Es la imagen de la portada.
- **Fidelidad:** Jesús hace subir a los discípulos a la barca y sube solo al monte a orar (14:22–23). La barca, azotada por las olas con el viento en contra (14:24). En la cuarta vigilia va hacia ellos andando sobre el mar (14:25). «¡Es un fantasma!» (14:26). «¡Tened ánimo; yo soy, no temáis!» (14:27). «Señor, si eres tú, manda que yo vaya a ti sobre las aguas» / «Ven» (14:28–29). Al ver el fuerte viento tuvo miedo, comenzó a hundirse y gritó «¡Señor, sálvame!» (14:30). Al momento Jesús extendió la mano y lo sostuvo: «¡Hombre de poca fe! ¿Por qué dudaste?» (14:31). Al subir a la barca se calmó el viento (14:32). Lo adoraron: «Verdaderamente eres Hijo de Dios» (14:33). No se añade nada que no esté en el texto.

## Escena por escena (VO propuesta; *palabras clave* en dorado)

### 1 · Gancho: Pedro empieza a hundirse (0–5 s) · `mood: storm` · `trans: cut`
- **VO:** «Pedro caminó sobre el *agua*… y de pronto empezó a *hundirse*.» (10 palabras). Arranca antes de 0,3 s.
  - Alternativa: «El único hombre que caminó sobre el agua… empezó a hundirse.»
- **Plano 1:** mar en tormenta y lluvia. La barca lejos, a la izquierda. Pedro solo sobre las olas, de pie, con el agua a los tobillos. Push lento hacia él desde el fotograma 0.
- **Plano 2 (`at: "hundirse"`, `trans: "cut"`):** el mismo encuadre, más cerca. Pedro con el agua a las rodillas y los brazos arriba. Relámpago en «hundirse».
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.18, "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "push", "focus": {"x": 0.55, "y": 0.6}, "light": {"x": 0.7, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.55, "depth": "near", "pose": "stand", "beard": true, "dy": 40}],
 "fx": ["rain", "fog"]},
{"at": "hundirse", "trans": "cut",
 "set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.18, "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "push", "focus": {"x": 0.55, "y": 0.58}, "light": {"x": 0.7, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.55, "depth": "near", "pose": "arms", "beard": true, "dy": 100}],
 "fx": ["rain", "fog"], "events": [{"at": "hundirse", "do": "lightning"}]}
```

### 2 · Horas antes: Jesús solo en el monte (5–9 s) · `mood: night` · `trans: dip`
- **VO:** «Horas antes, Jesús había subido *solo* al monte a *orar*.» (10)
- **Plano:** cumbre bajo la luna. Jesús de rodillas orando, en silueta, recortado contra el resplandor lunar. Push lento.
```json
{"set": ["mountain", {"el": "olive", "x": 0.82, "depth": "near"}],
 "cam": "push", "focus": {"x": 0.48, "y": 0.62}, "light": {"x": 0.34, "y": 0.22},
 "chars": [{"who": "jesus", "x": 0.48, "depth": "near", "pose": "pray", "dy": -40}],
 "fx": ["fog", "dust"]}
```

### 3 · Cuarta vigilia: «¡Es un fantasma!» (9–14 s) · `mood: storm` · `trans: fade`
- **VO:** «De madrugada, lo vieron venir sobre el mar: ¡Es un *fantasma*!» (11)
- **Plano:** la barca cerca, a la izquierda, sacudida (storm la balancea). Los discípulos señalan. A lo lejos, a la derecha, una silueta de pie **sobre** el agua, recortada contra un resplandor pálido. Relámpago en «fantasma».
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.3, "depth": "near"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "push", "focus": {"x": 0.6, "y": 0.6}, "light": {"x": 0.74, "y": 0.5},
 "chars": [{"who": "crowd", "x": 0.3, "depth": "near", "n": 3, "pose": "point", "dy": -60},
           {"who": "jesus", "x": 0.74, "depth": "mid", "pose": "stand"}],
 "fx": ["rain", "fog"], "events": [{"at": "fantasma", "do": "lightning"}]}
```

### 4 · «Yo soy»: entra la primera luz (14–20 s) · `mood: dawn` · `trans: fade`
- **VO:** «Tened ánimo, *yo soy*. Y Pedro dijo: Señor, si eres tú, manda que yo vaya a ti.» (17)
- **Plano 1:** Jesús sobre el agua, ya iluminado, con los brazos abiertos. El amanecer nace detrás de él.
- **Plano 2 (`at: "Pedro"`, `trans: "fade"`):** contraplano desde Jesús. La barca con Pedro de pie en la proa, señalando hacia él.
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.2, "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "push", "focus": {"x": 0.58, "y": 0.58}, "light": {"x": 0.6, "y": 0.42},
 "chars": [{"who": "jesus", "x": 0.58, "depth": "near", "pose": "open", "lit": true, "sash": "#B5452F", "glow": true}],
 "fx": ["fog", "dust"]},
{"at": "Pedro", "trans": "fade",
 "set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.45, "depth": "near"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "panR", "light": {"x": 0.82, "y": 0.42},
 "chars": [{"who": "crowd", "x": 0.36, "depth": "near", "n": 2, "dy": -60},
           {"who": "robed", "x": 0.52, "depth": "near", "pose": "point", "beard": true, "dy": -60}],
 "fx": ["fog", "dust"]}
```

### 5 · «Ven»: Pedro camina sobre el agua (20–24 s) · `mood: dawn` · `trans: fade`
- **VO:** «*Ven*. Y Pedro bajó de la barca y caminó sobre el *agua*.» (11)
- **Plano:** plano amplio. Pedro de pie sobre las olas (`dy: 0`, sin hundirse), de espaldas a la barca. Jesús iluminado a lo lejos, con los brazos abiertos frente al sol que nace. La cámara avanza entre los dos.
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.15, "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "push", "focus": {"x": 0.52, "y": 0.58}, "light": {"x": 0.68, "y": 0.46},
 "chars": [{"who": "robed", "x": 0.38, "depth": "near", "pose": "stand", "beard": true},
           {"who": "jesus", "x": 0.68, "depth": "mid", "pose": "open", "lit": true, "sash": "#B5452F", "glow": true}],
 "fx": ["rays", "fog", "dust"]}
```

### 6 · Mira el viento: «¡Señor, sálvame!» (24–30 s) · `mood: storm` · `trans: cut`
- **VO:** «Pero al ver el viento, tuvo *miedo*, empezó a hundirse y gritó: ¡Señor, *sálvame*!» (14)
- **Plano 1:** vuelve la tormenta de golpe. Pedro solo, con el agua a los tobillos, y la lluvia cruzando. Relámpago en «miedo».
- **Plano 2 (`at: "gritó"`, `trans: "cut"`):** más cerca. Pedro hundido hasta la cintura, con los brazos al cielo.
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "panL", "light": {"x": 0.3, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.55, "depth": "near", "pose": "stand", "beard": true, "dy": 40}],
 "fx": ["rain", "fog"], "events": [{"at": "miedo", "do": "lightning"}]},
{"at": "gritó", "trans": "cut",
 "set": [{"el": "sea", "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "push", "focus": {"x": 0.55, "y": 0.58}, "light": {"x": 0.3, "y": 0.3},
 "chars": [{"who": "robed", "x": 0.55, "depth": "near", "pose": "arms", "beard": true, "dy": 140}],
 "fx": ["rain", "fog"]}
```

### 7 · CLÍMAX: la mano (30–36 s) · `mood: holy` · `trans: flare` · `climax: true` · **PORTADA**
- **VO:** «Al momento, Jesús extendió la *mano* y lo sostuvo: Hombre de poca fe, ¿por qué *dudaste*?» (16)
- **Plano:** el destello rompe la tormenta. La luz cae desde arriba (Dios = luz) sobre las dos manos que se encuentran. Jesús, iluminado y sereno, de pie sobre el agua, con el brazo extendido. Pedro, en silueta y hundido hasta la cintura, con los brazos alzados: su mano izquierda toca la de Jesús. La cámara es `pull`, así que las figuras quedan en x 0.40 y 0.66 (dentro de 0.3–0.7).
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "pull", "focus": {"x": 0.53, "y": 0.56}, "light": {"x": 0.52, "y": 0.3},
 "chars": [{"who": "jesus", "x": 0.40, "depth": "near", "pose": "point", "lit": true, "sash": "#B5452F", "glow": true},
           {"who": "robed", "x": 0.66, "depth": "near", "pose": "arms", "beard": true, "dy": 140}],
 "fx": ["rays", "dust"]}
```
- Si en el render las manos no coinciden (por la escala distinta de las capas near y front en el `pull`), ajustar **solo** la `x` de Pedro en ±0.02 o su `dy` en ±20. No mover a Jesús.

### 8 · Calma y adoración + CTA (36–44 s) · `mood: golden` · `trans: fade`
- **VO:** «En la barca, el viento se *calmó*, y lo adoraron: Verdaderamente eres *Hijo de Dios*. Etiqueta a alguien que hoy se está *hundiendo*.» (23)
  - Es UNA sola petición hablada: etiquetar. Sin «escribe AMÉN» además.
- **Plano 1:** mar en calma dorado. La barca en el centro. Jesús, iluminado y de pie en la barca; los discípulos inclinados a su alrededor (adoran). Cámara `rise` lenta.
- **Plano 2 (`at: "Etiqueta"`, `trans: "fade"`):** plano general. La barca pequeña sobre el mar dorado y el sol sobre el horizonte. Cámara `pull`.
```json
{"set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.5, "depth": "near"}, {"el": "sea", "depth": "front", "y": 0.72}],
 "cam": "rise", "light": {"x": 0.5, "y": 0.32},
 "chars": [{"who": "jesus", "x": 0.5, "depth": "near", "pose": "stand", "lit": true, "sash": "#B5452F", "glow": true, "dy": -60},
           {"who": "crowd", "x": 0.33, "depth": "near", "n": 2, "pose": "bow", "dy": -60},
           {"who": "crowd", "x": 0.67, "depth": "near", "n": 2, "pose": "bow", "dy": -60}],
 "fx": ["rays", "dust"]},
{"at": "Etiqueta", "trans": "fade",
 "set": [{"el": "sea", "depth": "mid"}, {"el": "boat", "x": 0.5, "depth": "mid"}],
 "cam": "pull", "focus": {"x": 0.5, "y": 0.55}, "light": {"x": 0.5, "y": 0.5},
 "fx": ["rays", "dust"]}
```

Total VO: unas **112 palabras** (10 + 10 + 11 + 17 + 11 + 14 + 16 + 23). Daniel tenía 104 palabras y duró unos 40 s, así que se esperan 42–45 s. Si pasa de 45 s, se aplica el recorte de «Decisiones generales».

## Reglas comprobadas
- Todos los valores existen en el motor (`page/cine.html`). Moods: storm, night, dawn, holy, golden. Transiciones: cut, dip, fade, flare. Sets: sea, boat, mountain, olive (y la colina far automática). Cámaras: push, pull, panL, panR, rise. Personajes: jesus, robed, crowd. Poses: stand, pray, point, open, arms, bow. Efectos: rain, fog, dust, rays, y `events` lightning. Usos no documentados en GUION.md pero soportados por el código: `y` en un objeto de `set` y `sea` con `depth: "front"`.
- Hay una sola escena con `climax: true` (la 7), y el único `flare` está en ella, en la revelación de la mano. Storm ya añade lluvia, relámpagos automáticos y balanceo de la barca. Los `events` solo fijan el trueno en la palabra clave.
- En el plano `pull` (escena 7), las figuras están en x 0.40 y 0.66.
- Jesús lleva `lit` solo en la luz (escenas 4, 5, 7 y 8). En el monte y como «fantasma» es silueta. Pedro es siempre silueta.
- No hay texto en pantalla aparte del `title_card`. Cambio visual cada 2–4 s gracias a los planos con `at` en las escenas 1, 4, 6 y 8.

## Portada
- **TikTok (fotograma 0):** el `title_card` «¡Señor, sálvame! · Mateo 14:22–33» sobre Pedro solo en el mar de tormenta, en push. Depende de que se quite el fundido de entrada del título (ver el aviso de arriba).
- **Fotograma de portada (cover.py / `COVER_T`):** el **clímax**, unos **2,0 s después del inicio de la escena 7**. Para entonces el destello ya se ha disipado: Jesús está iluminado con el brazo extendido, la mano de Pedro alzada toca la suya y los rayos caen desde arriba. Es el momento más llamativo del video. cover.py ya da +0,5 al clímax y +0,2 a los rayos, así que debería elegirlo solo. Si elige otro, forzar `COVER_T` = inicio de la escena 7 + 2,0 (se lee en timeline.json).
- **`thumbnail`:** `{"big": "", "lines": ["¡SEÑOR,", "*SÁLVAME!*"], "icon": ""}`.
- **Título de YouTube sugerido:** «Caminó sobre el agua… y empezó a hundirse 🌊 | Pedro camina sobre el agua #shorts».
