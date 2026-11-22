# Faro Pesquero · Chorrillos 🌊🦩

> **Aplicación web responsive de detección acústica de aves marinas para pescadores artesanales adultos mayores de la Caleta de Chorrillos (Lima, Perú).**  
> Desarrollada con Next.js 16, TypeScript, Tailwind CSS, Web Audio API y el modelo Edge Impulse (`Faro_Pesquero_IA`, ID #1134969).

---

## 🚀 Paso a Paso: Cómo Ejecutar el Proyecto

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/nicolasllerenas/faro-pesquero-app.git
cd faro-pesquero-app
pnpm install
```
*(También puedes usar `npm install`)*

### 2. Iniciar el servidor local
```bash
pnpm dev
```
Abre tu navegador en: **[http://localhost:3000](http://localhost:3000)**.

### 3. (Opcional) Compilar para producción (Vercel)
```bash
pnpm build
pnpm start
```

---

## 🎬 Paso a Paso: Cómo Hacer la Demostración (Demo)

En la pantalla principal tienes 2 formas de demostrar que el sistema detecta los sonidos de aves pesqueras:

### Opción A: Demostración Inmediata (Banco de Pruebas de Sonido)
En la sección **"Banco de Pruebas de Sonido (Demo)"**, haz clic en cualquiera de los 4 botones grandes:

1. **Botón "Piquero Peruano"**:
   - **Sonido emitido**: Silbidos agudos y rápidos de piqueros en bandada.
   - **Resultado en pantalla**: El radar se activa, la tarjeta se ilumina en **Verde Esmeralda** con **100% de Certeza**.
   - **Indicación pesquera**: *"¡Cardumen denso de Anchoveta y Pejerrey en superficie! Echar red de cortina a 2 brazas"*.
   - **Voz del Faro**: El sintetizador de voz anunciará la alerta en voz alta.

2. **Botón "Pelícano Peruano"**:
   - **Sonido emitido**: Graznido gutural bajo cerca a las peñas del Morro Solar.
   - **Resultado en pantalla**: Tarjeta iluminada en **Ámbar Dorado** con **100% de Certeza**.
   - **Indicación pesquera**: *"Peces mayores de costa: Corvina, Machete y Lisa cerca a las rocas"*.

3. **Botón "Gaviota Peruana"**:
   - **Sonido emitido**: Grito modulado de gaviotas sobre cardumen.
   - **Resultado en pantalla**: Tarjeta iluminada en **Cyan Pacífico** con **100% de Certeza**.
   - **Indicación pesquera**: *"Peces carnada dispersos y Lorna en movimiento superficial"*.

4. **Botón "Ruido Marino y Motor"**:
   - **Sonido emitido**: Oleaje suave y motor fuera de borda de chalana.
   - **Resultado en pantalla**: Clasifica como **Ruido_Fondo (100%)**, indicando mar en calma sin cardumen activo.

---

### Opción B: Demostración con Micrófono en Vivo
1. Presiona el botón verde gigante: **"🎤 ACTIVAR MICRÓFONO EN VIVO"**.
2. Concede los permisos de micrófono en el navegador.
3. Reproduce un sonido de ave marina desde otro dispositivo o silba en el rango de 1800 Hz a 4000 Hz.
4. El sistema captura el audio en búferes de 1.0 segundo (16,000 muestras a 16 kHz) y clasifica automáticamente en tiempo real.
5. Para detener la escucha, presiona **"⏹ DETENER ESCUCHA EN VIVO"**.

---

### Opción C: Verificación Automatizada (Tests E2E)
Para verificar programáticamente todas las rutas y la precisión del modelo en la terminal:
```bash
node scripts/test_e2e_api.js
```
El script levantará el servidor, probará los 4 sonidos contra la API `/api/classify`, verificará la persistencia en la bitácora y comprobará el perfil del usuario de prueba.

---

## 👤 Usuario de Prueba Preconfigurado

La aplicación incluye un pescador de prueba preconfigurado:
- **Nombre**: Don Jacinto Ramos Morales (*"El Cholo Jacinto"*)
- **Rol**: Patrón Pescador Artesanal (48 años en el mar)
- **Embarcación**: Chalana *Flor del Mar III* (Matrícula DICAPI: `CO-12948-BM`)
- **Caleta**: Muelle de Pescadores Artesanales de Chorrillos
- **Asociación**: Asociación de Pescadores Artesanales José Olaya Balandra
- **Ajustes**:
  - **Modo Sol (Alto Contraste)**: Botón en la cabecera para máxima visibilidad bajo sol de altamar (WCAG 2.2 AAA).
  - **Voz del Faro**: Lectura audible de alertas de pesca.
  - Para consultar o editar sus datos, presiona el botón **"DJ - Don Jacinto"** en la barra superior.

---

## 🛠️ Arquitectura y Tecnologías

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons.
- **Backend**: API Routes (`/api/classify`, `/api/detections`, `/api/spots`, `/api/user`).
- **Motor de IA**: Modelo Edge Impulse #1134969 (`Faro_Pesquero_IA`) ejecutado mediante WebAssembly y TensorFlow Lite XNNPACK.
- **Base de Datos**: Archivo JSON ligero (`data/db.json`) con respaldo automático en memoria para entornos serverless (Vercel-ready).
- **Procesamiento de Audio**: Web Audio API con downsampling en tiempo real a 16 kHz y síntesis de voz (Web Speech API).

---

## 🚢 Despliegue en Vercel

1. Importa el repositorio desde GitHub en [Vercel](https://vercel.com).
2. Framework Preset: **Next.js**.
3. Build Command: `pnpm build` (configurado internamente con `next build --webpack`).
4. El proyecto no requiere variables de entorno obligatorias para operar.
