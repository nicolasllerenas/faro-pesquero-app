const fs = require('fs');
const path = require('path');
const vm = require('vm');

function writeWav(filename, samples, sampleRate = 16000) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.round(intSample), 44 + i * 2);
  }

  fs.writeFileSync(filename, buffer);
  console.log(`Saved ${filename} (${(buffer.length/1024).toFixed(1)} KB)`);
}

// 1. Piquero Peruano: 1800Hz whistle bursts + 4000Hz harmonics
const piqueroSamples = new Float32Array(16000);
for (let i = 0; i < 16000; i++) {
  const t = i / 16000;
  const burst = (Math.sin(2 * Math.PI * 4 * t) > 0.1) ? 0.85 : 0.05;
  const tone = Math.sin(2 * Math.PI * 1800 * t) * 0.7 + Math.sin(2 * Math.PI * 4000 * t) * 0.3;
  piqueroSamples[i] = burst * tone;
}
writeWav('public/audio/piquero.wav', piqueroSamples);

// 2. Pelícano Peruano: 800Hz resonant guttural call
const pelicanoSamples = new Float32Array(16000);
for (let i = 0; i < 16000; i++) {
  const t = i / 16000;
  const env = (Math.sin(2 * Math.PI * 2.5 * t) > -0.2) ? 0.9 : 0.05;
  const tone = Math.sin(2 * Math.PI * 800 * t) * 0.8 + Math.sin(2 * Math.PI * 3200 * t) * 0.2;
  pelicanoSamples[i] = env * tone;
}
writeWav('public/audio/pelicano.wav', pelicanoSamples);

// 3. Gaviota Peruana: 1400Hz frequency-modulated cry
const gaviotaSamples = new Float32Array(16000);
for (let i = 0; i < 16000; i++) {
  const t = i / 16000;
  const f = 1400 + 300 * Math.sin(2 * Math.PI * 6 * t);
  const tone = Math.sin(2 * Math.PI * f * t) * 0.75 + Math.sin(2 * Math.PI * (f * 1.5) * t) * 0.25;
  gaviotaSamples[i] = tone * 0.85;
}
writeWav('public/audio/gaviota.wav', gaviotaSamples);

// 4. Ruido de Fondo: Low swell 200Hz + marine ambient
const ruidoSamples = new Float32Array(16000);
for (let i = 0; i < 16000; i++) {
  const t = i / 16000;
  const swell = Math.sin(2 * Math.PI * 200 * t) * 0.3;
  const noise = (Math.random() * 2 - 1) * 0.1;
  ruidoSamples[i] = swell + noise;
}
writeWav('public/audio/ruido_mar.wav', ruidoSamples);

console.log("Audio samples created successfully!");
