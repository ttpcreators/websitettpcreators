/* =========================================================
   TTP Creators — sphère dithering (shader WebGL2, vanilla)
   Portage fidèle du composant React « DitheringShader » (shape:sphere)
   Aucune dépendance. Repli silencieux si WebGL2 indisponible.
   ========================================================= */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-sphere]");
  if (!canvas) return;

  var gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true
  });
  if (!gl) return; // pas de WebGL2 -> le hero garde son atmosphère seule

  /* ----- Réglages (couleurs de marque) ----- */
  var COLOR_FRONT = [184 / 255, 58 / 255, 90 / 255, 1.0]; // #b83a5a (accent)
  var COLOR_BACK = [0.0, 0.0, 0.0, 0.0];                   // transparent
  var SHAPE = 7.0;  // sphere
  var TYPE = 4.0;   // 1=random, 2=2x2, 3=4x4, 4=8x8 (Bayer ordonné)
  var PX_SIZE = 2.0;
  var SPEED = 1.1;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var vertexSrc = "#version 300 es\n" +
    "precision mediump float;\n" +
    "layout(location = 0) in vec4 a_position;\n" +
    "void main(){ gl_Position = a_position; }\n";

  var fragmentSrc = "#version 300 es\n" +
    "precision mediump float;\n" +
    "uniform float u_time;\n" +
    "uniform vec2 u_resolution;\n" +
    "uniform vec4 u_colorBack;\n" +
    "uniform vec4 u_colorFront;\n" +
    "uniform float u_shape;\n" +
    "uniform float u_type;\n" +
    "uniform float u_pxSize;\n" +
    "out vec4 fragColor;\n" +
    "vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x,289.0); }\n" +
    "float snoise(vec2 v){\n" +
    "  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);\n" +
    "  vec2 i = floor(v + dot(v, C.yy));\n" +
    "  vec2 x0 = v - i + dot(i, C.xx);\n" +
    "  vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);\n" +
    "  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;\n" +
    "  i = mod(i,289.0);\n" +
    "  vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));\n" +
    "  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n" +
    "  m = m*m; m = m*m;\n" +
    "  vec3 x = 2.0*fract(p*C.www)-1.0; vec3 h = abs(x)-0.5; vec3 ox = floor(x+0.5); vec3 a0 = x-ox;\n" +
    "  m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);\n" +
    "  vec3 g; g.x = a0.x*x0.x + h.x*x0.y; g.yz = a0.yz*x12.xz + h.yz*x12.yw;\n" +
    "  return 130.0*dot(m,g);\n" +
    "}\n" +
    "#define TWO_PI 6.28318530718\n" +
    "float hash11(float p){ p = fract(p*0.3183099)+0.1; p *= p+19.19; return fract(p*p); }\n" +
    "float hash21(vec2 p){ p = fract(p*vec2(0.3183099,0.3678794))+0.1; p += dot(p,p+19.19); return fract(p.x*p.y); }\n" +
    "const int bayer8x8[64] = int[64](\n" +
    "  0,32,8,40,2,34,10,42, 48,16,56,24,50,18,58,26,\n" +
    "  12,44,4,36,14,46,6,38, 60,28,52,20,62,30,54,22,\n" +
    "  3,35,11,43,1,33,9,41, 51,19,59,27,49,17,57,25,\n" +
    "  15,47,7,39,13,45,5,37, 63,31,55,23,61,29,53,21);\n" +
    "const int bayer4x4[16] = int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);\n" +
    "const int bayer2x2[4] = int[4](0,2,3,1);\n" +
    "float getBayerValue(vec2 uv, int size){\n" +
    "  ivec2 pos = ivec2(mod(uv, float(size)));\n" +
    "  int index = pos.y*size + pos.x;\n" +
    "  if (size == 2) return float(bayer2x2[index])/4.0;\n" +
    "  else if (size == 4) return float(bayer4x4[index])/16.0;\n" +
    "  else if (size == 8) return float(bayer8x8[index])/64.0;\n" +
    "  return 0.0;\n" +
    "}\n" +
    "void main(){\n" +
    "  float t = .5*u_time;\n" +
    "  vec2 uv = gl_FragCoord.xy/u_resolution.xy; uv -= .5;\n" +
    "  float pxSize = u_pxSize;\n" +
    "  vec2 pxSizeUv = gl_FragCoord.xy; pxSizeUv -= .5*u_resolution; pxSizeUv /= pxSize;\n" +
    "  vec2 pixelizedUv = floor(pxSizeUv)*pxSize/u_resolution.xy; pixelizedUv += .5; pixelizedUv -= .5;\n" +
    "  vec2 shape_uv = pixelizedUv;\n" +
    "  vec2 dithering_uv = pxSizeUv;\n" +
    "  vec2 ditheringNoise_uv = uv*u_resolution;\n" +
    "  float shape = 0.;\n" +
    "  // sphere\n" +
    "  shape_uv *= 2.;\n" +
    "  float d = 1. - pow(length(shape_uv),2.);\n" +
    "  vec3 pos = vec3(shape_uv, sqrt(max(d,0.)));\n" +
    "  vec3 lightPos = normalize(vec3(cos(1.5*t), .8, sin(1.25*t)));\n" +
    "  shape = .5 + .5*dot(lightPos,pos);\n" +
    "  shape *= step(0., d);\n" +
    "  int type = int(floor(u_type));\n" +
    "  float dithering = 0.0;\n" +
    "  if (type == 1) dithering = step(hash21(ditheringNoise_uv), shape);\n" +
    "  else if (type == 2) dithering = getBayerValue(dithering_uv, 2);\n" +
    "  else if (type == 3) dithering = getBayerValue(dithering_uv, 4);\n" +
    "  else dithering = getBayerValue(dithering_uv, 8);\n" +
    "  dithering -= .5;\n" +
    "  float res = step(.5, shape + dithering);\n" +
    "  vec3 fgColor = u_colorFront.rgb*u_colorFront.a; float fgOpacity = u_colorFront.a;\n" +
    "  vec3 bgColor = u_colorBack.rgb*u_colorBack.a; float bgOpacity = u_colorBack.a;\n" +
    "  vec3 color = fgColor*res; float opacity = fgOpacity*res;\n" +
    "  color += bgColor*(1.-opacity); opacity += bgOpacity*(1.-opacity);\n" +
    "  fragColor = vec4(color, opacity);\n" +
    "}\n";

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, vertexSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fragmentSrc);
  if (!vs || !fs) return;

  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  var loc = {
    u_time: gl.getUniformLocation(program, "u_time"),
    u_resolution: gl.getUniformLocation(program, "u_resolution"),
    u_colorBack: gl.getUniformLocation(program, "u_colorBack"),
    u_colorFront: gl.getUniformLocation(program, "u_colorFront"),
    u_shape: gl.getUniformLocation(program, "u_shape"),
    u_type: gl.getUniformLocation(program, "u_type"),
    u_pxSize: gl.getUniformLocation(program, "u_pxSize")
  };

  var posLoc = gl.getAttribLocation(program, "a_position");
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  var W = 1, H = 1;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === W && h === H) return;
    W = w; H = h;
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
  }

  var start = Date.now();
  var raf = null;

  function draw() {
    resize();
    var time = reduce ? 0 : (Date.now() - start) * 0.001 * SPEED;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1f(loc.u_time, time);
    gl.uniform2f(loc.u_resolution, W, H);
    gl.uniform4fv(loc.u_colorBack, COLOR_BACK);
    gl.uniform4fv(loc.u_colorFront, COLOR_FRONT);
    gl.uniform1f(loc.u_shape, SHAPE);
    gl.uniform1f(loc.u_type, TYPE);
    gl.uniform1f(loc.u_pxSize, PX_SIZE);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  // Pause hors-écran pour économiser le GPU
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!raf) draw();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
    }, { threshold: 0.01 });
    io.observe(canvas);
  } else {
    draw();
  }

  window.addEventListener("resize", function () { if (reduce) draw(); }, { passive: true });
})();
