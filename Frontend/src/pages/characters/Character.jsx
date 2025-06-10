// src/Character.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { useGLTF, useAnimations, Html } from "@react-three/drei";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationUtils, LoopOnce } from 'three';

export default function Character({ modelPath, emotePaths, labels = [] }) {
  const group = useRef();

  // ————————————
  // 1) load base character + its animations
  // ————————————
  const { scene, animations: rawAnimations } = useGLTF(modelPath);

  // prune any tracks referencing missing bones
  const filteredClips = React.useMemo(
    () =>
      rawAnimations.map((clip) => {
        const clone = AnimationUtils.clone(clip);
        clone.tracks = clone.tracks.filter((t) => {
          const node = t.name.split('.')[0];
          return scene.getObjectByName(node);
        });
        return clone;
      }),
    [rawAnimations, scene]
  );

  // set up mixer for Idle/etc.
  const { actions, mixer } = useAnimations(filteredClips, group);

  // ————————————
  // 2) load all emote-GLBs
  // ————————————
  const emoteGltfs = useLoader(GLTFLoader, emotePaths);
  const [isPlaying, setIsPlaying] = useState(false);

  // Map each GLB → exactly one clip + one name
  const [emoteNames, emoteClips] = React.useMemo(() => {
    const names = [];
    const clips = [];

    emoteGltfs.forEach((gltf, idx) => {
      // get “HandRaise” out of “/models/emotes/HandRaise.glb”
      const base = emotePaths[idx]
        .split('/')
        .pop()
        .replace(/\.glb$/i, '');

      // try to find a clip whose name matches the filename
      let clip =
        gltf.animations.find((c) => c.name.toLowerCase() === base.toLowerCase()) ||
        gltf.animations[0];

      if (clip) {
        names.push(base);
        clips.push(clip);
      }
    });

    return [names, clips];
  }, [emoteGltfs, emotePaths]);

  // ————————————
  // 3) bind exactly one action per emote
  // ————————————
  useEffect(() => {
    // play Idle at start
    if (actions['Idle']) actions['Idle'].reset().fadeIn(0.2).play();

    // bind emote actions
    emoteClips.forEach((clip, i) => {
      const action = mixer.clipAction(clip, group.current);
      action.clampWhenFinished = true;
      action.setLoop(LoopOnce, 1);
      // store under its unique base name
      actions[emoteNames[i]] = action;
    });

    // when any emote finishes, go back to Idle
    const onFinished = () => {
      if (actions['Idle']) actions['Idle'].reset().fadeIn(0.2).play();
      setIsPlaying(false);
    };
    mixer.addEventListener('finished', onFinished);
    return () => mixer.removeEventListener('finished', onFinished);
  }, [actions, emoteClips, emoteNames, mixer]);

  const playEmote = (name) => {
    setIsPlaying(true);
    // stop whatever is playing
    Object.values(actions).forEach((a) => a.stop());
    // play the one you clicked
    actions[name]?.reset().fadeIn(0.2).play();
  };

  return (
    <>
      <group ref={group} scale={[1.8, 1.8, 1.8]} position={[0, -2, 0]} dispose={null}>
        <primitive object={scene} />
      </group>

      <Html fullscreen>
        <div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
          {emoteNames.map((name, i) => (
            <button
              key={name}
              onClick={() => playEmote(name)}
              disabled={isPlaying}
              className={`px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all ${
                isPlaying
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {labels[i] || name}
            </button>
          ))}
        </div>
      </Html>
    </>
  );
}
