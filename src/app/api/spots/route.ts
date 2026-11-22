import { NextResponse } from 'next/server';
import { getSpots } from '@/lib/db';

export async function GET() {
  try {
    const spots = getSpots();
    return NextResponse.json({ success: true, spots });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener zonas de pesca' },
      { status: 500 }
    );
  }
}
