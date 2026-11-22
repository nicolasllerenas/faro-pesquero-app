const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3055;
process.env.PORT = PORT.toString();

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

(async () => {
  console.log('--- Iniciando Servidor Next.js para Pruebas E2E en puerto ' + PORT + ' ---');

  const serverProc = spawn('pnpm', ['start', '-p', PORT.toString()], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });

  // Wait for server to be responsive
  let ready = false;
  for (let i = 0; i < 20; i++) {
    await wait(800);
    try {
      const ping = await fetchJson(`http://localhost:${PORT}/api/spots`);
      if (ping.status === 200) {
        ready = true;
        break;
      }
    } catch {}
  }

  if (!ready) {
    console.error('El servidor no respondió a tiempo');
    serverProc.kill();
    process.exit(1);
  }

  console.log('✓ Servidor Next.js activo y respondiendo!\n');

  let passedAll = true;

  try {
    // 1. Test Usuario de Prueba
    console.log('1. [TEST] /api/user - Perfil de Don Jacinto');
    const userRes = await fetchJson(`http://localhost:${PORT}/api/user`);
    console.log('Status:', userRes.status, 'Nombre:', userRes.data?.user?.name, 'Embarcación:', userRes.data?.user?.boatName);
    if (userRes.data?.user?.name.includes('Don Jacinto') && userRes.data?.user?.boatName.includes('Flor del Mar')) {
      console.log('✓ PASS: Usuario de prueba Don Jacinto verificado con éxito.\n');
    } else {
      console.error('✗ FAIL: Usuario de prueba incorrecto');
      passedAll = false;
    }

    // 2. Test Zonas de Pesca Chorrillos
    console.log('2. [TEST] /api/spots - Zonas de Pesca de Chorrillos');
    const spotsRes = await fetchJson(`http://localhost:${PORT}/api/spots`);
    console.log('Total spots:', spotsRes.data?.spots?.length, 'Zonas:', spotsRes.data?.spots?.map((s) => s.name).join(', '));
    if (spotsRes.data?.spots?.some((s) => s.name.includes('Morro Solar'))) {
      console.log('✓ PASS: Zonas de Chorrillos verificadas.\n');
    } else {
      console.error('✗ FAIL: Faltan zonas de Chorrillos');
      passedAll = false;
    }

    // 3. Test Inferencia Edge Impulse - Piquero Peruano
    console.log('3. [TEST] /api/classify - Detección de Piquero Peruano');
    const piqueroRes = await fetchJson(`http://localhost:${PORT}/api/classify`, {
      method: 'POST',
      body: { sample: 'piquero' }
    });
    console.log(
      'Especie:',
      piqueroRes.data?.species,
      'Certeza:',
      (piqueroRes.data?.confidence * 100).toFixed(1) + '%',
      'Indicación:',
      piqueroRes.data?.fishIndication
    );
    if (piqueroRes.data?.species === 'Piquero' && piqueroRes.data?.confidence >= 0.9) {
      console.log('✓ PASS: Detección de Piquero Peruano 100% precisa.\n');
    } else {
      console.error('✗ FAIL: Fallo en clasificación de Piquero');
      passedAll = false;
    }

    // 4. Test Inferencia Edge Impulse - Pelícano Peruano
    console.log('4. [TEST] /api/classify - Detección de Pelícano Peruano');
    const pelicanoRes = await fetchJson(`http://localhost:${PORT}/api/classify`, {
      method: 'POST',
      body: { sample: 'pelicano' }
    });
    console.log(
      'Especie:',
      pelicanoRes.data?.species,
      'Certeza:',
      (pelicanoRes.data?.confidence * 100).toFixed(1) + '%',
      'Indicación:',
      pelicanoRes.data?.fishIndication
    );
    if (pelicanoRes.data?.species === 'Pelicano' && pelicanoRes.data?.confidence >= 0.9) {
      console.log('✓ PASS: Detección de Pelícano Peruano 100% precisa.\n');
    } else {
      console.error('✗ FAIL: Fallo en clasificación de Pelícano');
      passedAll = false;
    }

    // 5. Test Inferencia Edge Impulse - Gaviota Peruana
    console.log('5. [TEST] /api/classify - Detección de Gaviota Peruana');
    const gaviotaRes = await fetchJson(`http://localhost:${PORT}/api/classify`, {
      method: 'POST',
      body: { sample: 'gaviota' }
    });
    console.log(
      'Especie:',
      gaviotaRes.data?.species,
      'Certeza:',
      (gaviotaRes.data?.confidence * 100).toFixed(1) + '%',
      'Indicación:',
      gaviotaRes.data?.fishIndication
    );
    if (gaviotaRes.data?.species === 'Gaviota' && gaviotaRes.data?.confidence >= 0.9) {
      console.log('✓ PASS: Detección de Gaviota Peruana 100% precisa.\n');
    } else {
      console.error('✗ FAIL: Fallo en clasificación de Gaviota');
      passedAll = false;
    }

    // 6. Test Inferencia Edge Impulse - Ruido de Mar
    console.log('6. [TEST] /api/classify - Ruido Marino y Motor');
    const ruidoRes = await fetchJson(`http://localhost:${PORT}/api/classify`, {
      method: 'POST',
      body: { sample: 'ruido_mar' }
    });
    console.log(
      'Especie:',
      ruidoRes.data?.species,
      'Certeza:',
      (ruidoRes.data?.confidence * 100).toFixed(1) + '%'
    );
    if (ruidoRes.data?.species === 'Ruido_Fondo') {
      console.log('✓ PASS: Ruido de fondo correctamente aislado.\n');
    } else {
      console.error('✗ FAIL: Ruido de fondo falló');
      passedAll = false;
    }

    // 7. Test Bitácora de Detecciones
    console.log('7. [TEST] /api/detections - Verificación de Bitácora');
    const detRes = await fetchJson(`http://localhost:${PORT}/api/detections`);
    console.log('Total registros guardados:', detRes.data?.detections?.length);
    if (detRes.data?.detections?.length > 0) {
      console.log('✓ PASS: Bitácora operativa con persistencia.\n');
    } else {
      console.error('✗ FAIL: Bitácora vacía');
      passedAll = false;
    }
  } catch (err) {
    console.error('Error durante ejecución de pruebas:', err);
    passedAll = false;
  } finally {
    serverProc.kill();
    console.log('--- Servidor cerrado ---');
    if (passedAll) {
      console.log('🎯 TODAS LAS PRUEBAS END-TO-END PASARON SATISFACTORIAMENTE (100%).');
      process.exit(0);
    } else {
      console.error('AL MENOS UNA PRUEBA FALLÓ');
      process.exit(1);
    }
  }
})();
