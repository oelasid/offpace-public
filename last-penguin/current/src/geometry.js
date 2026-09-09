import * as THREE from 'three';

export function makeToonGradientMap() {
  const data = new Uint8Array([
    72, 72, 72, 255,
    128, 128, 128, 255,
    198, 198, 198, 255,
    255, 255, 255, 255,
  ]);
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function makeBlobGeometry(size, options = {}) {
  const {
    widthSegments = 40,
    heightSegments = 28,
    belly = 0,
    topTaper = 0,
    bottomTaper = 0,
    flattenBottom = 0,
    frontBias = 0,
  } = options;

  const geo = new THREE.SphereGeometry(0.5, widthSegments, heightSegments);
  const pos = geo.attributes.position;
  const [w, h, d] = size;

  for (let i = 0; i < pos.count; i += 1) {
    let x = pos.getX(i) * w;
    let y = pos.getY(i) * h;
    let z = pos.getZ(i) * d;
    const yn = THREE.MathUtils.clamp(y / (h * 0.5), -1, 1);
    const centerBulge = 1 + belly * (1 - yn * yn);
    const directional = yn > 0 ? 1 + topTaper * yn : 1 + bottomTaper * (-yn);
    const radial = centerBulge * directional;
    x *= radial;
    z *= radial;

    if (flattenBottom > 0) {
      const floorY = -h * 0.5 + h * flattenBottom;
      if (y < floorY) y = THREE.MathUtils.lerp(y, floorY, 0.72);
    }

    if (frontBias !== 0 && z > 0) {
      z *= 1 + frontBias * (1 - Math.abs(yn));
    }

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function makeWingGeometry(size) {
  const geo = makeBlobGeometry(size, {
    widthSegments: 34,
    heightSegments: 26,
    belly: 0.03,
    topTaper: -0.34,
    bottomTaper: -0.07,
    flattenBottom: 0.01,
  });
  const pos = geo.attributes.position;
  const h = size[1];
  for (let i = 0; i < pos.count; i += 1) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const yn = THREE.MathUtils.clamp((y + h * 0.5) / h, 0, 1);
    x *= 0.82 + 0.18 * (1 - yn);
    z *= 0.90 + 0.10 * (1 - yn);
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function makeRoundedBeakGeometry(size) {
  const geo = makeBlobGeometry(size, {
    widthSegments: 32,
    heightSegments: 20,
    belly: 0.0,
    frontBias: 0.22,
  });
  const pos = geo.attributes.position;
  const [w, h, d] = size;
  for (let i = 0; i < pos.count; i += 1) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const xn = Math.abs(x) / (w * 0.5);
    if (z > 0) z *= 1 + 0.26 * (1 - xn);
    y *= 0.92;
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function makeClosedEyeGeometry(width = 0.22, rise = 0.07, thickness = 0.022) {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-width * 0.5, 0, 0),
    new THREE.Vector3(0, rise, 0),
    new THREE.Vector3(width * 0.5, 0, 0),
  );
  return new THREE.TubeGeometry(curve, 12, thickness, 8, false);
}

export function addOutline(mesh, color = 0x18243f, factor = 1.028) {
  const outlineMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  const outline = new THREE.Mesh(mesh.geometry, outlineMaterial);
  outline.scale.setScalar(factor);
  outline.renderOrder = -1;
  mesh.add(outline);
  return mesh;
}

export function enableShadows(object) {
  object.traverse?.((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  if (object.isMesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
  return object;
}
