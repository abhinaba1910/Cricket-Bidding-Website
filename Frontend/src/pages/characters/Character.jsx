// src/Character.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationUtils, LoopOnce } from 'three';

export default function Character({ modelPath, emotePaths, labels = [],triggerEmote, }) {
  const group = useRef();

  // — load base character + Idle/other animations —
  const { scene, animations: rawAnimations } = useGLTF(modelPath);
  const filteredClips = React.useMemo(
    () =>
      rawAnimations.map((clip) => {
        const c = AnimationUtils.clone(clip);
        c.tracks = c.tracks.filter((t) => scene.getObjectByName(t.name.split('.')[0]));
        return c;
      }),
    [rawAnimations, scene]
  );
  const { actions, mixer } = useAnimations(filteredClips, group);

  // — load emote GLBs & extract clips/names —
  const emoteGltfs = useLoader(GLTFLoader, emotePaths);
  const [isPlaying, setIsPlaying] = useState(false);
  const [emoteNames, emoteClips] = React.useMemo(() => {
    const names = [], clips = [];
    emoteGltfs.forEach((gltf, i) => {
      const base = emotePaths[i].split('/').pop().replace(/\.glb$/i, '');
      const clip =
        gltf.animations.find((c) => c.name.toLowerCase() === base.toLowerCase()) ||
        gltf.animations[0];
      if (clip) {
        names.push(base);
        clips.push(clip);
      }
    });
    return [names, clips];
  }, [emoteGltfs, emotePaths]);

  // 1) On mount: bind all actions + listen for “finished”
  useEffect(() => {
    // start Idle
    actions['Idle']?.reset().fadeIn(0.2).play();

    // bind clips
    emoteClips.forEach((clip, i) => {
      const act = mixer.clipAction(clip, group.current);
      act.clampWhenFinished = true;
      act.setLoop(LoopOnce, 1);
      actions[emoteNames[i]] = act;
    });

    // when any emote ends, revert to Idle + re-enable buttons
    const onFinished = () => {
      actions['Idle']?.reset().fadeIn(0.2).play();
      setIsPlaying(false);
    };
    mixer.addEventListener('finished', onFinished);
    return () => mixer.removeEventListener('finished', onFinished);
  }, []);  // <-- empty deps: run exactly once

  // 2) On mount (after binding): play StandToSit intro
  useEffect(() => {
    const intro = actions['StandToSit'];
    if (intro) {
      setIsPlaying(true);
      // stop Idle so intro can play
      actions['Idle']?.stop();
      intro.reset().fadeIn(0.2).play();
    }
  }, []);  // <-- also empty: kicks off after first effect

  const playEmote = (name) => {
    setIsPlaying(true);
    Object.values(actions).forEach((a) => a.stop());
    actions[name]?.reset().fadeIn(0.2).play();
  };

  useEffect(() => {
    if (triggerEmote && !isPlaying) {
      playEmote(triggerEmote);
    }
  }, [triggerEmote]);

  return (
    <>
      <group
        ref={group}
        scale={[1.8, 2, 0.8]}
        position={[0, -2.4, 0]}
        dispose={null}
      >
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
