# Verification — 2026-10-06

## Character modes and output layouts (2026-10-06)

- `npm test`: all 11 tests passed. New coverage verifies solo/duo settings, separate model bytes, inactive second-model exclusion, names/readings, custom subtitle colors, per-character voice settings, portrait/fullscreen enforcement, character/subtitle bounds, and the generated Biim subtitle-frame SVG for all left/right placements.
- The HTTP-mocked Aivis integration verifies alternating speaker IDs, different Style IDs and speeds, name readings used only for synthesis, explicit spoken_text, unchanged caption spelling, second-model asset synchronization, and rejection of missing/unknown speakers before network requests or manifest replacement. This update did not call a real Aivis engine.
- `npm run build -- --base=/BiimMotionWebUI/`: passed. `git diff --check`: passed.
- Browser inspection confirmed solo/duo controls, character-specific fields, color previews, the vertical Full HD / HD / 4K choices, the automatically enabled/disabled fullscreen switch for portrait output, and the complete updated default design text.
- Generated ZIPs were extracted into the existing smoke workspace. Runtime validation, including TypeScript, passed for Biim duo (640×360), fullscreen duo (640×360), and portrait duo (360×640).
- Rendered and visually inspected frame 135 for all three layouts with two self-authored animated GLB cubes and synthetic caption manifests. Confirmed the blue/white speaker-2 caption, central Biim subtitle frame, separate left/right model positions, larger model framing with slight upward overlap, and frame-free horizontal/vertical canvases. Speaker-1 red/white rendering was also inspected before the final model-fitting adjustment.
- Model fitting accounts for canvas aspect ratio and model depth to avoid the clipping found during the initial enlargement check. Character3D exposes sizeMultiplier (default 1.2) for scene-level adjustments.
- `npm run preview -- --gl=swangle --concurrency=2 --log=error` also produced the portrait smoke MP4. FFprobe confirmed H.264 at 180×320 (half-scale preview of 360×640), 30fps, AAC audio, and a 6.016-second container duration. Caption audio in this fixture is synthetic silence; this check verifies rendering and output orientation rather than voice quality.
- Rendered fixtures are structural/visual smoke checks, not production character rigs or lip-sync validation. Actual scenes may move or resize the models as directed in the brief.

## Previous baseline (2026-10-04)

## WebUI and ZIP

- `npm test`: 7 tests passed. Includes required values and asset limits, safe/unique filenames, exact binary attachments and bundled font bytes, original instructions, empty scenes, runtime/motion-kit packaging, deterministic WAV synthesis, and an HTTP-mocked Aivis integration test.
- Aivis integration checks `project.scenes[].script` splitting, Style ID and speed forwarding, measured WAV durations, scene_id captions, SRT timestamps, disabled synthesis, and overlapping segments. An overlap failure preserves the prior manifest and avoids writing partial replacement WAVs.
- `npm run build -- --base=/BiimMotionWebUI/`: passed. The site uses repository-relative asset URLs, including both font files.
- Browser checks: missing required fields show errors; sample input populates the form; Advanced settings appear in JSON; source file selection updates the attachment list; standard fonts and frame metadata appear in generated JSON; ZIP generation completes. Desktop 1440px and mobile 390px widths were inspected, with no horizontal body overflow.

## Extracted runtime

Generated and extracted `.verification/smoke-motion-job.zip`, installed its npm workspace dependencies, and tested the source runtime rather than the WebUI alone.

- `npm run validate`: passed, including TypeScript and asset manifests.
- Actual local AivisSpeech at `http://127.0.0.1:10101`, Style ID `1069147200`, generated a 2.708-second narration WAV from a scene's script. Subtitle/SRT output and scene linkage were checked. No external voice service was called.
- `npm run sound`: generated BGM, chime, whoosh, and impact WAVs; paths and measured lengths passed validation.
- A self-authored animated GLB cube verified GLB loading, model fitting, and frame-driven animation support. Async model commits now explicitly draw the ThreeCanvas before releasing Remotion's render handle.
- `npm run preview -- --gl=angle --concurrency=2`: produced a 6-second MP4 at half resolution.
- `npm run build -- --gl=angle --concurrency=2 --log=error`: produced final.mp4. FFprobe reported H.264 video at 640×360, 30fps and stereo AAC at 48kHz, container duration 6.016 seconds.
- FFmpeg audio inspection: mean volume −20.8 dB, maximum −3.1 dB for the mixed smoke video.
- `npm run still -- --frame=45 --gl=angle --log=error`: inspected bundled-font rendering, black/gray Biim frame, separate note_top/note_bottom, red/black/white outlined captions, and GLB placement outside the subtitle region.
- `npm run validate -- --final` correctly failed when production script/storyboard/source/QA/delivery records were absent, even though preview and final MP4 existed. A rendered starter scene is not treated as a completed production video.

## Scope and limits

This verifies the MVP job generator and a short runtime smoke video. It does not certify a full 30-second Opus production, actual character rig retargeting, mouth morphs, arbitrary GLB animations, or subjective music quality. Automated validation does not replace watching and listening to the completed video. Fonts are bundled under their OFL licenses and explicitly awaited; consistent layout and fonts depend on using the provided standard components. Node/npm dependencies and the render browser are acquired during runtime setup, not bundled as portable executables.
