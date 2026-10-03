import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimationMixer, Box3, Vector3 } from "three";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";

const Model = ({ path, animation }: { path: string; animation?: string }) => {
  const [gltf, setGltf] = useState<GLTF>();
  const [handle] = useState(() => delayRender("Loading GLB: " + path));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const advance = useThree((state) => state.advance);
  useEffect(() => {
    let live = true;
    new GLTFLoader().load(
      staticFile(path),
      (loaded) => {
        if (live) setGltf(loaded);
      },
      undefined,
      (error) => {
        if (live) cancelRender(error);
        else continueRender(handle);
      },
    );
    return () => {
      live = false;
      continueRender(handle);
    };
  }, [path, handle]);
  const model = useMemo(() => {
    if (!gltf) return null;
    const bounds = new Box3().setFromObject(gltf.scene);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const scale = 2.5 / Math.max(size.x, size.y, size.z, 0.001);
    const mixer = new AnimationMixer(gltf.scene);
    const clip = animation
      ? gltf.animations.find((clip) => clip.name === animation)
      : gltf.animations[0];
    if (clip) mixer.clipAction(clip).play();
    return { scene: gltf.scene, scale, center, mixer };
  }, [gltf, animation]);
  useLayoutEffect(() => {
    if (model) {
      model.mixer.setTime(frame / fps);
      // ThreeCanvas renders on demand. An async GLB commit needs an explicit draw.
      advance(frame / fps);
      continueRender(handle);
    }
  }, [model, frame, fps, advance, handle]);
  if (!model) return null;
  // Frame-driven sampling, deterministic when rendering or scrubbing backwards.
  model.mixer.setTime(frame / fps);
  return (
    <group scale={model.scale}>
      <primitive
        object={model.scene}
        position={[-model.center.x, -model.center.y, -model.center.z]}
      />
    </group>
  );
};

const Placeholder = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <group
      rotation={[0, Math.sin((frame / fps) * 1.8) * 0.18, 0]}
      position={[0, Math.sin((frame / fps) * 3) * 0.04, 0]}
    >
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.47, 32, 32]} />
        <meshStandardMaterial color="#ddedbb" />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.43, 0.5, 8, 16]} />
        <meshStandardMaterial color="#9abf83" />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.72, 0.44]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#243f2b" />
        </mesh>
      ))}
    </group>
  );
};

export const Character3D = ({
  model,
  animation,
  width = 360,
  height = 360,
}: {
  model?: string | null;
  animation?: string;
  width?: number;
  height?: number;
}) => (
  <ThreeCanvas
    width={width}
    height={height}
    style={{ width: "100%", height: "100%" }}
    camera={{ position: [0, 0, 6], fov: 40 }}
  >
    <ambientLight intensity={1.5} />
    <directionalLight position={[3, 5, 5]} intensity={2} />
    {model ? (
      <Model key={model} path={model} animation={animation} />
    ) : (
      <Placeholder />
    )}
  </ThreeCanvas>
);
