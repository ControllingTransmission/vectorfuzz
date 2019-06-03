# vectorfuzz
Glowing vector display like lines using three.js SVGRenderer.


NOTES

The bag of tricks used to do this:

  1. Construct meshes and then use an EdgeGeometry to get a wireframe that removes the shared vertices 
     e.g. so a Cube face looks like a it's a Quad instead of 2 triangles.

  2. Use the SVGRenderer so the lines can have thickness as the WebGLRenderer only supports linewidth=1.

  3. Every frame, we find the SVG elements and add a "glow" filter to them (the filter is defined in index.html).

It would probably be better to use WebGLRenderer and a tube geometry for the wireframe, and a shader for the glow effect.
