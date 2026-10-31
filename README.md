# reels-ia-motor

Motor que convierte un `guion.json` en un Reel/TikTok/Short animado (1080x1920, 30 fps, −14 LUFS) con voz en off en español latino, motion graphics, subtítulos palabra por palabra, música y efectos generados por código, portada y descripción.

```bash
bash setup.sh                                  # una vez por máquina (~3–5 min): espeak-ng, voz Kokoro, iconos, fuente
bash make.sh preview ejemplos/ganar-con-claude.json   # voz + tiempos + hoja de fotogramas (preview.jpg)
bash make.sh render  ejemplos/ganar-con-claude.json   # MP4 + subtitulos.srt + portada.png + descripcion.txt
```

Salida en `~/reels/<slug>/` (o `$REELS_OUT/<slug>`).

- `GUION.md`: formato del guion (lo que escribe el agente guionista).
- `temas.md`: ideas pendientes para las ejecuciones programadas.
- `publicados.md`: registro de lo que ya se publicó, para no repetir temas.
- `engine/`: voz (Kokoro + espeak-ng), tiempos, audio. `page/`: renderizador HTML (Playwright) y portada.
