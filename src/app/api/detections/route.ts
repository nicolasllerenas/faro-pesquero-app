import { NextRequest, NextResponse } from 'next/server';
import { getDetections, addDetection, clearDetections } from '@/lib/db';

export async function GET() {
  try {
    const detections = getDetections();
    return NextResponse.json({ success: true, detections });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener bitácora de detecciones' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.species || !body.confidence) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios: species, confidence' },
        { status: 400 }
      );
    }
    const created = addDetection(body);
    return NextResponse.json({ success: true, detection: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al registrar detección' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearDetections();
    return NextResponse.json({ success: true, message: 'Bitácora limpiada exitosamente' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al limpiar bitácora' },
      { status: 500 }
    );
  }
}
