import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve(".verification/smoke-video");
const project = JSON.parse(
  await fs.readFile(path.join(root, "project.json"), "utf8"),
);
project.title = "Biim枠・字幕・3D・音響の動作確認";
project.scenes = [
  {
    id: "scene001",
    note_top: "枠と音を確認",
    note_bottom:
      "右上に要点、右下に補足。中央の映像は自由に動かせます。字幕とキャラクターは別の領域です。",
    script: "これは、動画制作ジョブの動作確認です。",
    duration_sec: 6,
  },
];
project.character.model = "assets/character.glb";
await fs.writeFile(
  path.join(root, "project.json"),
  JSON.stringify(project, null, 2),
);
await fs.writeFile(
  path.join(root, "plan/sound-design.json"),
  JSON.stringify({
    cues: [
      {
        id: "bed",
        kind: "bgm",
        start_sec: 0,
        duration_sec: 6,
        volume: 0.08,
        bpm: 100,
      },
      {
        id: "reveal",
        kind: "chime",
        start_sec: 0.6,
        duration_sec: 0.7,
        volume: 0.15,
      },
      {
        id: "sweep",
        kind: "whoosh",
        start_sec: 2.5,
        duration_sec: 0.35,
        volume: 0.15,
      },
      {
        id: "slam",
        kind: "impact",
        start_sec: 4,
        duration_sec: 0.3,
        volume: 0.1,
      },
    ],
  }),
);
// A self-authored animated GLB cube verifies model loading and frame-driven clips.
const vertices = new Float32Array([
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
  -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
]);
const indices = new Uint16Array([
  0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4,
  7, 0, 7, 3, 1, 2, 6, 1, 6, 5,
]);
const times = new Float32Array([0, 1, 2]);
const translations = new Float32Array([0, 0, 0, 0, 0.2, 0, 0, 0, 0]);
const binary = Buffer.concat([
  Buffer.from(vertices.buffer),
  Buffer.from(indices.buffer),
  Buffer.from(times.buffer),
  Buffer.from(translations.buffer),
]);
const gltf = {
  asset: { version: "2.0", generator: "BiimMaker smoke fixture" },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0 }],
  meshes: [
    { primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] },
  ],
  materials: [
    {
      pbrMetallicRoughness: {
        baseColorFactor: [0.7, 0.86, 0.48, 1],
        metallicFactor: 0,
        roughnessFactor: 0.8,
      },
    },
  ],
  buffers: [{ byteLength: binary.length }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: 96, target: 34962 },
    { buffer: 0, byteOffset: 96, byteLength: 72, target: 34963 },
    { buffer: 0, byteOffset: 168, byteLength: 12 },
    { buffer: 0, byteOffset: 180, byteLength: 36 },
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count: 8,
      type: "VEC3",
      min: [-0.5, -0.5, -0.5],
      max: [0.5, 0.5, 0.5],
    },
    { bufferView: 1, componentType: 5123, count: 36, type: "SCALAR" },
    {
      bufferView: 2,
      componentType: 5126,
      count: 3,
      type: "SCALAR",
      min: [0],
      max: [2],
    },
    { bufferView: 3, componentType: 5126, count: 3, type: "VEC3" },
  ],
  animations: [
    {
      name: "bounce",
      samplers: [{ input: 2, output: 3, interpolation: "LINEAR" }],
      channels: [{ sampler: 0, target: { node: 0, path: "translation" } }],
    },
  ],
};
const json = Buffer.from(JSON.stringify(gltf));
const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32);
json.copy(padded);
const output = Buffer.alloc(12 + 8 + padded.length + 8 + binary.length);
output.writeUInt32LE(0x46546c67, 0);
output.writeUInt32LE(2, 4);
output.writeUInt32LE(output.length, 8);
output.writeUInt32LE(padded.length, 12);
output.writeUInt32LE(0x4e4f534a, 16);
padded.copy(output, 20);
const binOffset = 20 + padded.length;
output.writeUInt32LE(binary.length, binOffset);
output.writeUInt32LE(0x004e4942, binOffset + 4);
binary.copy(output, binOffset + 8);
await fs.writeFile(path.join(root, "assets/character.glb"), output);
console.log(
  "Prepared note_top/note_bottom/script scene, animated GLB cube and four sound cues.",
);
