export type PixelSfxType = 'correct' | 'wrong' | 'upgrade' | 'clear' | 'streak';

const SFX_MUTED_STORAGE_KEY = 'pixel_bakery_sfx_muted';

let sharedCtx: AudioContext | null = null;
let sfxMuted = false;

export function loadSfxMutedPreference(): boolean {
  try {
    sfxMuted = localStorage.getItem(SFX_MUTED_STORAGE_KEY) === '1';
  } catch {
    sfxMuted = false;
  }
  return sfxMuted;
}

export function setSfxMuted(muted: boolean): void {
  sfxMuted = muted;
  try {
    localStorage.setItem(SFX_MUTED_STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // ignore quota / private mode
  }
}

export function isSfxMuted(): boolean {
  return sfxMuted;
}

function getAudioContext(): AudioContext | null {
  const AudioContextClass =
    window.AudioContext ||
    (window as Window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedCtx) {
    sharedCtx = new AudioContextClass();
  }
  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

/** 모바일 자동재생 정책: 첫 터치/클릭 시 한 번 호출 */
export function primePixelSFX(): void {
  getAudioContext();
}

/**
 * 픽셀베이커리 전용 초경량 8비트 사운드 액션 시스템 (0kb 에셋)
 */
export const playPixelSFX = (type: PixelSfxType): void => {
  if (sfxMuted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.2, ctx.currentTime);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4500, ctx.currentTime);

  masterGain.connect(filter);
  filter.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'correct': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.32);
      break;
    }

    case 'wrong': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(185.0, now);
      osc.frequency.linearRampToValueAtTime(75.0, now + 0.25);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }

    case 'upgrade': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1567.98, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.26);
      break;
    }

    case 'streak': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392.0, now);
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.4);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sawtooth';
      lfo.frequency.setValueAtTime(28, now);
      lfoGain.gain.setValueAtTime(120, now);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.4);
      lfo.stop(now + 0.4);
      break;
    }

    case 'clear': {
      const scale = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      scale.forEach((freq, i) => {
        const oscNode = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const playTime = now + i * 0.09;

        oscNode.type = 'square';
        oscNode.frequency.setValueAtTime(freq, playTime);

        gainNode.gain.setValueAtTime(0.12, playTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.22);

        oscNode.connect(gainNode);
        gainNode.connect(masterGain);
        oscNode.start(playTime);
        oscNode.stop(playTime + 0.25);
      });
      break;
    }
  }
};
