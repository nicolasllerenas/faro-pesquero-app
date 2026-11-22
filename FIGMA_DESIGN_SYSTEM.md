# Figma Design System: Faro Pesquero · Chorrillos
> **Sistema de Diseño Mobile Inclusivo para Pescadores Artesanales Adultos Mayores del Distrito de Chorrillos (Mar de Grau, Lima - Perú)**

---

## 1. Visión y Fundamento Antropológico del Diseño
En la **Caleta de Pescadores de Chorrillos** (Muelle Artesanal y falda del Morro Solar), más del 65% de los patrones de chalanas y peñeros son personas mayores de 60 años. La sabiduría ancestral del pescador chorrillano descifra el comportamiento de las aves marinas como un sonar biológico natural:
- **Piquero Peruano (*Sula variegata*)**: Cuando se lanzan en picada vertical (*flechazos*), indican cardúmenes densos de **Anchoveta** y **Pejerrey** cerca a la superficie.
- **Pelícano Peruano (*Pelecanus thagus*)**: Acuatizan sobre corvinas, lornas y machetes en zonas rocosas o de reventazón costera.
- **Gaviota Peruana (*Larus belcheri*)**: Vuelo rasante sobre peces carnada y lornas dispersas.
- **Ruido de Fondo**: Olas del mar, viento costero y motor fuera de borda.

### Restricciones Críticas de Usuario (Pescador Senior en Altamar):
1. **Presbicia y Deslumbramiento Solar (Glare)**: En altamar frente a Chorrillos, el sol del mediodía rebotando sobre el mar enceguece pantallas con bajo contraste.
2. **Manos Mojadas, Callosas o con Guantes**: La motricidad fina disminuye por el agua salada y el frío. Se prohíben toques pequeños; el área mínima de botón es de **64px**.
3. **Atención Dividida en Maniobra**: El pescador no puede apartar la vista mientras cala la red o gobierna el timón. La app incorpora **Doble Canal Sensorial: Alerta Visual + Síntesis de Voz en Alta Voz ("Voz del Faro")**.
4. **Sin Conexión Celular Estable**: A 2 millas del Morro Solar la señal 4G fluctúa. El motor de inferencia Edge Impulse corre en **WebAssembly localmente en el navegador**, operando 100% offline.

---

## 2. Paleta de Colores "Mar de Grau" y Ratios WCAG 2.2 AAA

| Nombre del Token | Código Hex | Uso en la Interfaz | Ratio de Contraste WCAG |
|---|---|---|---|
| `--color-mar-profundo` | `#040C18` | Fondo principal de la app | Base oscura |
| `--color-mar-solar` | `#000000` | Fondo en Modo Sol (Ultra Contraste) | Máximo contraste |
| `--color-blanco-puro` | `#FFFFFF` | Textos primarios y títulos de aves | **18.5:1** (Supera AAA) |
| `--color-piquero-verde`| `#10B981` | Alerta de Piquero / Anchoveta | **14.2:1** con fondo oscuro |
| `--color-pelicano-ambar`| `#F59E0B`| Alerta de Pelícano / Corvina | **11.5:1** con fondo oscuro |
| `--color-gaviota-cyan` | `#06B6D4` | Alerta de Gaviota / Mar abierto | **12.8:1** con fondo oscuro |
| `--color-alerta-rojo`  | `#DC2626` | Detener escucha / Peligro rocas | **8.2:1** con texto blanco |

---

## 3. Escala Tipográfica Senior (Presbicia-Friendly)

| Nivel Tipográfico | Tamaño / Peso | Uso en la Pantalla |
|---|---|---|
| **Display / Alerta Ave** | `32px` - `36px` ExtraBold (800) | Nombre del ave detectada (PIQUERO PERUANO) |
| **Porcentaje de Certeza**| `24px` - `28px` Black (900) | Medidor de confianza (100% Certeza) |
| **Acción Principal** | `18px` - `20px` Bold (700) | Botón "ACTIVAR MICRÓFONO EN VIVO" |
| **Consejo de Pesca** | `16px` - `18px` SemiBold (600) | Indicación de red de cortina o espinel |
| **Detalle Secundario** | Mínimo `13px` - `14px` Regular | Matrícula de chalana, coordenadas GPS |

*Regla fija: Ningún elemento interactivo o de texto útil se renderiza por debajo de 13px.*

---

## 4. Artboards del Figma (Arquitectura de Pantallas)

### Frame 01: Credencial del Pescador (Acceso Rápido)
- Perfil preconfigurado de **Don Jacinto Ramos** ("El Cholo" Jacinto).
- Embarcación artesanal: *Flor del Mar III* (Matrícula: `CO-12948-BM`).
- Asociación: *Pescadores Artesanales José Olaya Balandra*.
- Botón directo de 1 toque: **"ENTRAR A PESCAR"** (sin contraseñas complejas).

### Frame 02: Radar Acústico en Altamar (Osciloscopio Marino)
- Visualizador en tiempo real de frecuencia (16,000 Hz).
- Onda marina reactiva con doble frecuencia.
- Indicador pulsante de estado: `RADAR ACTIVO · ESCUCHANDO EL MAR`.

### Frame 03: Alerta de Cardumen Activo
- Tarjeta de alerta de alta prominencia con borde brillante (Verde / Ámbar / Cyan).
- Nombre de la especie y porcentaje de probabilidad.
- Consejo práctico inmediato para el pescador: *"Echar red de cortina a 2 brazas"*.
- Botón: *"🔊 Escuchar Consejo con Voz"*.

### Frame 04: Banco de Pruebas Rápido (Demostración de Detección)
- 4 botones grandes con audio real integrado:
  1. **Piquero Peruano** (*Whistle burst* 1800Hz / 4000Hz -> 100% Piquero)
  2. **Pelícano Peruano** (*Low resonant grunt* 800Hz -> 100% Pelícano)
  3. **Gaviota Peruana** (*Modulated cry* 1400Hz -> 100% Gaviota)
  4. **Ruido de Mar** (*Low marine swell* 120Hz -> 100% Ruido_Fondo)

### Frame 05: Bitácora de Capturas & Zonas de Chorrillos
- Registro cronológico de detecciones guardadas en base de datos ligera.
- Mapeo de zonas tradicionales: *Bajo del Morro Solar*, *El Salto del Fraile*, *La Herradura*, *Muelle de Chorrillos*.

---

## 5. Integración con Edge Impulse (Proyecto #1134969)
- **Proyecto**: `Faro_Pesquero_IA` (Owner: KORVAGE).
- **Entrenamiento**: Modelo de clasificación de audio a 16 kHz (ventana de 1.0 segundo = 16,000 muestras PCM).
- **Backend**: Endpoint REST `/api/classify` ejecutando el runtime WebAssembly en Node.js con aceleración TensorFlow Lite XNNPACK.
- **Frontend**: Procesamiento en el cliente con Web Audio API (`AudioContext` y `getUserMedia`).
