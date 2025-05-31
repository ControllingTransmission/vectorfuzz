# vectorfuzz
Glowing vector display like lines using three.js SVGRenderer.

## 🌐 Live Demo
Experience the application: **[https://controllingtransmission.github.io/vectorfuzz/](https://controllingtransmission.github.io/vectorfuzz/)**

## About
This project creates a glowing vector display using Three.js SVGRenderer, featuring wireframe geometries with custom glow effects. The application renders 3D objects as glowing line art that resembles classic vector graphics displays.

## Running Locally
To run the application locally:

1. Clone the repository
2. Serve the files using any HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
   Or use the included HTTPS server:
   ```bash
   python simple-https-server.py
   ```
3. Open your browser to `http://localhost:8000` (or `https://localhost:4443` for HTTPS)

## Technical Details

NOTES

The bag of tricks used to do this:

  1. Construct meshes and then use an EdgeGeometry to get a wireframe that removes the shared vertices 
     e.g. so a Cube face looks like a it's a Quad instead of 2 triangles.

  2. Use the SVGRenderer so the lines can have thickness as the WebGLRenderer only supports linewidth=1.

  3. Every frame, we find the SVG elements and add a "glow" filter to them (the filter is defined in index.html).

It would probably be better to use WebGLRenderer and a tube geometry for the wireframe, and a shader for the glow effect.
