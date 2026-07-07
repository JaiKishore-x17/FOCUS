# Focus-Guard 🎯

An autonomous, ultra-low-latency attention monitoring and target tracking system that bridges real-time Edge AI with physical hardware actuation. Focus-Guard processes head-pose tracking natively on a mobile device and streams coordinates over a high-speed local tunnel to a miniaturized, scope-mounted 2-axis laser turret.

---

## 🚀 Technical Architecture Overview

Focus-Guard replaces bulky standalone prototyping enclosures with an integrated, scope-design camera accessory that mounts directly over a smartphone’s rear camera cluster. This eliminates horizontal parallax error and relies entirely on an optimized, direct-wired hardware stack.

```text
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



✨ Features & Engineering Milestones12ms Edge Processing: Achieved near-zero latency by executing Google ML Kit Face Detection inside a native background thread using a React Native Frame Processor plugin, keeping the main UI thread completely fluid.Zero Horizontal Parallax: The physical chassis is engineered as a scoped attachment directly aligned with the vertical axis of the camera sensor, simplifying geometric mapping algorithms.Dynamic Pitch Compensation: Real-time software correction handles vertical parallax by scaling target adjustments based on the bounding box dimension of the tracked subject (acting as a distance proxy).Ultra-Compact Footprint: Ditched the massive breadboard box for a "matchbox-sized" enclosure ($55\text{mm} \times 40\text{mm} \times 30\text{mm}$) using direct manifold wiring and integrated component stacking.Advanced Power Isolation: Features an on-board power management system integrating a TP4056 IC and a 100µF decoupling capacitor rail to eliminate hardware brownouts and servo jitter.🛠️ Hardware Stack (Bill of Materials)Microcontroller: ESP32-C3 (RISC-V Architecture, Ultra-Small Form Factor)Actuators: 2x MG90S Digital Metal Gear Servos (High torque, minimal mechanical backlash)Optics: 5mW 650nm Red Laser DiodePower Management: TP4056 Lithium Charging IC + 3.7V Miniature Slim LiPo BatteryNoise Suppression: 100µF Low-ESR Electrolytic CapacitorConnectors: KF301-2P Compact Screw Terminals (For vibration-proof power manifold)💻 Software Configuration1. Mobile Application (React Native Stack)The client application leverages react-native-vision-camera and vision-camera-face-detector to handle high-frame-rate tracking.To filter sensor noise and prevent tracking jitter, target trajectories pass through a Simple Moving Average (SMA) smoothing filter:$$Angle_{final} = \frac{Angle_{new} + Angle_{prev1} + Angle_{prev2}}{3}$$2. Firmware Implementation (ESP32-C3)The firmware runs an optimized lightweight server parsing fast execution payloads. It converts raw target positions into highly precise duty-cycle instructions via the ESP32 hardware PWM timers (ESP32Servo library).Calibration profiles and geometric offsets are retained natively across reboots using non-volatile flash storage (Preferences.h).🔧 Internal Wiring ReferenceThe device relies on a Direct Manifold Connection to optimize internal space:Power Delivery: The LiPo output feeds a common power rail established via daisy-chained KF301 blocks.Signal Routing: All servo PWM lines and laser controls route directly to GPIO pins (GPIO18, GPIO19, GPIO20) bundled tightly using heat-shrink tubing to avoid Electromagnetic Interference (EMI).Mechanical Safety: Every high-motion joint features a built-in cable Service Loop preventing wire tension or gear stress over a full $180^\circ$ tracking sweep.


📜 License
Distributed under the MIT License. See LICENSE for more information.