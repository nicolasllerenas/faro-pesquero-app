import { NextRequest, NextResponse } from 'next/server';
import { runClassification, runSampleClassification } from '@/lib/classifier';
import { addDetection } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();

      let classification;
      let source: 'demo_sample' | 'live_mic' | 'audio_upload' = 'live_mic';

      if (body.sample) {
        source = 'demo_sample';
        classification = await runSampleClassification(body.sample);
      } else if (Array.isArray(body.features)) {
        source = body.source || 'live_mic';
        const samples = new Float32Array(body.features);
        classification = await runClassification(samples);
      } else {
        return NextResponse.json(
          { success: false, error: 'Se requiere "sample" o "features" (array de muestras)' },
          { status: 400 }
        );
      }

      if (body.save !== false && classification.species !== 'Ruido_Fondo' && classification.confidence >= 0.7) {
        addDetection({
          species: classification.species,
          commonName: classification.commonName,
          scientificName: classification.scientificName,
          confidence: classification.confidence,
          location: body.location || 'Bajo del Morro Solar - Chorrillos',
          coordinates: body.coordinates || { lat: -12.1702, lng: -77.0345 },
          advice: classification.advice,
          fishIndication: classification.fishIndication,
          source: source,
          verifiedByFisherman: true
        });
      }

      return NextResponse.json(classification);
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No se envió archivo de audio en el campo "audio"' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const dataOffset = buffer.indexOf('data');
      const start = dataOffset !== -1 ? dataOffset + 8 : 44;
      const rawData = buffer.subarray(Math.min(start, buffer.length));
      const samples = new Float32Array(Math.floor(rawData.length / 2));
      for (let i = 0; i < samples.length; i++) {
        samples[i] = rawData.readInt16LE(i * 2);
      }

      const classification = await runClassification(samples);

      if (classification.species !== 'Ruido_Fondo' && classification.confidence >= 0.7) {
        addDetection({
          species: classification.species,
          commonName: classification.commonName,
          scientificName: classification.scientificName,
          confidence: classification.confidence,
          location: (formData.get('location') as string) || 'Bajo del Morro Solar - Chorrillos',
          coordinates: { lat: -12.1702, lng: -77.0345 },
          advice: classification.advice,
          fishIndication: classification.fishIndication,
          source: 'audio_upload',
          verifiedByFisherman: true
        });
      }

      return NextResponse.json(classification);
    }

    return NextResponse.json(
      { success: false, error: 'Content-Type no soportado. Use application/json o multipart/form-data' },
      { status: 415 }
    );
  } catch (error) {
    console.error('Error en clasificación de audio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno de clasificación'
      },
      { status: 500 }
    );
  }
}
