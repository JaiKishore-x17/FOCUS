<h1 align="center">Focus-Guard 🎯</h1>

<p align="center">
  <strong>An autonomous, ultra-low-latency attention monitoring and target tracking system.</strong><br>
  Bridges real-time Edge AI with physical hardware actuation by processing head-pose tracking natively on a mobile device and streaming coordinates over a high-speed local tunnel to a miniaturized, scope-mounted 2-axis laser turret.
</p>

<hr />

<h2>🚀 Technical Architecture Overview</h2>

<p>Focus-Guard replaces bulky standalone prototyping enclosures with an integrated, scope-design camera accessory that mounts directly over a smartphone’s rear camera cluster. This eliminates horizontal parallax error and relies entirely on an optimized, direct-wired hardware stack.</p>

<pre><code>
       [ Edge AI / Smartphone ] 
                 │
                 ▼ (React Native Native Frame Processor ~12ms)
        [ Face Geometry Extraction ] (Euler Angles: Yaw & Pitch)
                 │
                 ▼ (High-Speed Local WebSockets / Serial)
         [ ESP32-C3 Controller ] 
                 │
        ┌────────┴────────┐
        ▼                 ▼
[ Pan Axis Servo ]  [ Tilt Axis Servo ] ──► [ Dynamic Parallax Correction ] ──► [ Target Vector ]
</code></pre>

<hr />

<h2>✨ Features & Engineering Milestones</h2>

<ul>
  <li><strong>12ms Edge Processing:</strong> Executed Google ML Kit Face Detection inside a native background thread using a React Native Frame Processor plugin, keeping the main UI thread fluid.</li>
  <li><strong>Zero Horizontal Parallax:</strong> The physical chassis is engineered as a scoped attachment directly aligned with the vertical axis of the camera sensor, simplifying geometric mapping algorithms.</li>
  <li><strong>Dynamic Pitch Compensation:</strong> Real-time software correction handles vertical parallax by scaling target adjustments based on the bounding box dimension of the tracked subject (acting as a distance proxy).</li>
  <li><strong>Ultra-Compact Footprint:</strong> Ditched the massive breadboard box for a matchbox-sized enclosure (55mm × 40mm × 30mm) using direct manifold wiring and integrated component stacking.</li>
  <li><strong>Advanced Power Isolation:</strong> Features an on-board power management system integrating a TP4056 IC and a 100µF decoupling capacitor rail to eliminate hardware brownouts and servo jitter.</li>
</ul>

<hr />

<h2>🛠️ Hardware Stack (Bill of Materials)</h2>

<table width="100%">
  <thead>
    <tr>
      <th align="left">Component Type</th>
      <th align="left">Item Description</th>
      <th align="left">Role in System</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Microcontroller</b></td>
      <td>ESP32-C3 Module</td>
      <td>RISC-V Architecture, Ultra-Small Form Factor logic processing.</td>
    </tr>
    <tr>
      <td><b>Actuators</b></td>
      <td>2x MG90S Digital Metal Gear Servos</td>
      <td>High torque, minimal mechanical backlash for Pan/Tilt axes.</td>
    </tr>
    <tr>
      <td><b>Optics</b></td>
      <td>5mW 650nm Red Laser Diode</td>
      <td>Provides immediate, physical visual feedback targeting.</td>
    </tr>
    <tr>
      <td><b>Power Management</b></td>
      <td>TP4056 IC + 3.7V Slim LiPo Battery</td>
      <td>Eliminates bulky external power banks with a built-in charging circuit.</td>
    </tr>
    <tr>
      <td><b>Noise Suppression</b></td>
      <td>100µF Low-ESR Capacitor</td>
      <td>Absorbs voltage dips during high-current servo spikes.</td>
    </tr>
    <tr>
      <td><b>Connectors</b></td>
      <td>KF301-2P Compact Screw Terminals</td>
      <td>Vibration-proof power manifold distribution points.</td>
    </tr>
  </tbody>
</table>

<hr />

<h2>💻 Software Configuration</h2>

<h3>1. Mobile Application (React Native Stack)</h3>
<p>The client application leverages <code>react-native-vision-camera</code> and <code>vision-camera-face-detector</code> to handle high-frame-rate tracking.</p>

<p>To filter sensor noise and prevent tracking jitter, target trajectories pass through a <strong>Simple Moving Average (SMA)</strong> smoothing filter:</p>

<p align="center">
  $$Angle_{final} = \frac{Angle_{new} + Angle_{prev1} + Angle_{prev2}}{3}$$
</p>

<h3>2. Firmware Implementation (ESP32-C3)</h3>
<p>The firmware runs an optimized lightweight server parsing fast execution payloads. It converts raw target positions into highly precise duty-cycle instructions via the ESP32 hardware PWM timers (<code>ESP32Servo</code> library).</p>

<p>Calibration profiles and geometric offsets are retained natively across reboots using non-volatile flash storage (<code>Preferences.h</code>).</p>

<hr />

<h2>🔧 Internal Wiring Reference</h2>

<p>The device relies on a <strong>Direct Manifold Connection</strong> to optimize internal space:</p>
<ul>
  <li><strong>Power Delivery:</strong> The LiPo output feeds a common power rail established via daisy-chained KF301 blocks.</li>
  <li><strong>Signal Routing:</strong> All servo PWM lines and laser controls route directly to GPIO pins (<code>GPIO18</code>, <code>GPIO19</code>, <code>GPIO20</code>) bundled tightly using heat-shrink tubing to avoid Electromagnetic Interference (EMI).</li>
  <li><strong>Mechanical Safety:</strong> Every high-motion joint features a built-in cable <strong>Service Loop</strong> preventing wire tension or gear stress over a full 180° tracking sweep.</li>
</ul>

<hr />

<h2>📁 Repository Structure</h2>

<pre><code>
├── assets/                  # 3D Render Models & Layout Schematics
├── firmware/                # ESP32-C3 Arduino C++ Source Code
│   ├── firmware.ino
│   └── config.h             # Pin assignments and PWM definitions
└── mobile-app/              # React Native Project
    ├── src/
    │   ├── components/      # Frame Processor and UI Reticle
    │   └── utils/           # SMA Filter & Math Transformation scripts
</code></pre>

<hr />

<h2>📜 License</h2>
<p>Distributed under the MIT License. See <code>LICENSE</code> for more information.</p>