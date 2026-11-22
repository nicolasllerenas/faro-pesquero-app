import { NextRequest, NextResponse } from 'next/server';
import { getUser, updateUser } from '@/lib/db';

export async function GET() {
  try {
    const user = getUser();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al recuperar usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateUser(body);
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al actualizar preferencias de usuario' },
      { status: 500 }
    );
  }
}
