// Web Audio API Sound Synthesizer for Gentle Pomodoro Alerts & Focus White/Brown Noise
// Specially crafted for ADHD & Sensory Friendly learning (smooth envelopes, no harsh beeps)

class PomodoroAudioEngine {
  private ctx: AudioContext | null = null;
  private brownNoiseNode: AudioNode | null = null;
  private noiseGainNode: GainNode | null = null;
  private isNoisePlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Toca um sino tibetano / taça tibetana suave (Singing Bowl)
   * Frequência 432 Hz ou 528 Hz com decaimento longo e harmônicos relaxantes
   */
  playTibetanBowl(volume = 0.5) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.45, now);
      masterGain.connect(ctx.destination);

      const freqs = [432, 864, 1296]; // Harmônicos naturais
      const decays = [3.5, 2.5, 1.8];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (idx === 0 ? 0 : (Math.random() - 0.5) * 3), now);

        // Curva de envelope suave: ataque de 60ms e decaimento exponencial
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.4 / (idx + 1), now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decays[idx]);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Toca um chime / carrilhão suave de 3 notas ascendentes (Dó, Mi, Sol)
   * Ideal para sinalizar fim de pausa ou início com suavidade
   */
  playGentleChime(volume = 0.5) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const noteDelay = 0.18;

      notes.forEach((freq, i) => {
        const startTime = now + i * noteDelay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume * 0.35, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Toca som de gotas serenas (Water Drops)
   */
  playWaterDrop(volume = 0.5) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const drops = [
        { freq: 1100, delay: 0 },
        { freq: 1450, delay: 0.16 },
        { freq: 1280, delay: 0.35 }
      ];

      drops.forEach((d) => {
        const startTime = now + d.delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(d.freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(d.freq * 1.5, startTime + 0.08);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume * 0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Toca acorde suave de conclusão (Harmônico relaxante)
   */
  playCompletionHarp(volume = 0.5) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      // Acorde Maior com Sétima sereno (F - A - C - E)
      const freqs = [349.23, 440.00, 523.25, 659.25, 880.00];

      freqs.forEach((freq, idx) => {
        const startTime = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume * 0.28, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 2.1);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Toca o aviso suave configurado de acordo com o tipo
   */
  playAlert(type: 'singing-bowl' | 'chime' | 'water' | 'harp', volume = 0.5) {
    switch (type) {
      case 'singing-bowl':
        this.playTibetanBowl(volume);
        break;
      case 'chime':
        this.playGentleChime(volume);
        break;
      case 'water':
        this.playWaterDrop(volume);
        break;
      case 'harp':
      default:
        this.playCompletionHarp(volume);
        break;
    }
  }

  /**
   * Gerador de Ruído Marrom (Brownian/Red Noise) para foco e alívio do TDAH
   * O ruído marrom reduz a hiperatividade sensorial abafando frequências agudas
   */
  startBrownNoise(volume = 0.15) {
    if (this.isNoisePlaying) return;
    try {
      const ctx = this.getContext();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      // Filtro de integração browniana
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Ganho moderado
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filtro passa-baixa adicional para deixar ainda mais quente e aveludado
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.35, ctx.currentTime + 1.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      this.brownNoiseNode = whiteNoise;
      this.noiseGainNode = gain;
      this.isNoisePlaying = true;
    } catch {
      this.isNoisePlaying = false;
    }
  }

  setNoiseVolume(volume: number) {
    if (this.noiseGainNode && this.ctx) {
      try {
        this.noiseGainNode.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);
      } catch {
        // Ignorar
      }
    }
  }

  stopBrownNoise() {
    if (!this.isNoisePlaying) return;
    try {
      if (this.noiseGainNode && this.ctx) {
        this.noiseGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        if (this.brownNoiseNode) {
          (this.brownNoiseNode as AudioBufferSourceNode).stop();
          this.brownNoiseNode.disconnect();
          this.brownNoiseNode = null;
        }
        this.isNoisePlaying = false;
      }, 500);
    } catch {
      this.isNoisePlaying = false;
    }
  }

  isAmbienceActive(): boolean {
    return this.isNoisePlaying;
  }
}

export const pomodoroAudio = new PomodoroAudioEngine();
