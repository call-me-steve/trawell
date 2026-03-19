export function makeSineWav(params: { seconds: number; freqHz: number; sampleRate?: number }) {
  const sampleRate = params.sampleRate ?? 44100;
  const numSamples = Math.max(1, Math.floor(sampleRate * params.seconds));
  const channels = 1;
  const bitsPerSample = 16;
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);
  let o = 0;

  function writeAscii(s: string) {
    buffer.write(s, o, "ascii");
    o += s.length;
  }
  function u32(n: number) {
    buffer.writeUInt32LE(n, o);
    o += 4;
  }
  function u16(n: number) {
    buffer.writeUInt16LE(n, o);
    o += 2;
  }

  writeAscii("RIFF");
  u32(36 + dataSize);
  writeAscii("WAVE");
  writeAscii("fmt ");
  u32(16);
  u16(1); // PCM
  u16(channels);
  u32(sampleRate);
  u32(byteRate);
  u16(blockAlign);
  u16(bitsPerSample);
  writeAscii("data");
  u32(dataSize);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const amp = 0.25;
    const sample = Math.sin(2 * Math.PI * params.freqHz * t) * amp;
    buffer.writeInt16LE(Math.max(-1, Math.min(1, sample)) * 0x7fff, 44 + i * 2);
  }

  return buffer;
}

