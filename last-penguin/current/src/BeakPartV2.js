import * as THREE from 'three';

function makeGradientTexture(){
  const data=new Uint8Array([35,110,185,255]);
  const texture=new THREE.DataTexture(data,4,1,THREE.RedFormat);
  texture.needsUpdate=true;
  texture.minFilter=THREE.NearestFilter;
  texture.magFilter=THREE.NearestFilter;
  texture.generateMipmaps=false;
  return texture;
}

function makeMaterials(){
  const gradientMap=makeGradientTexture();
  return {
    upper:new THREE.MeshToonMaterial({color:0xffd166,gradientMap}),
    lower:new THREE.MeshToonMaterial({color:0xf8a31d,gradientMap}),
    mouth:new THREE.MeshToonMaterial({color:0x7d2b22,gradientMap,side:THREE.DoubleSide}),
    tongue:new THREE.MeshToonMaterial({color:0xe76f79,gradientMap,side:THREE.DoubleSide}),
  };
}

function makeHalfEllipsoid(upper=true){
  const thetaStart=upper ? 0 : Math.PI/2;
  const g=new THREE.SphereGeometry(1,40,24,0,Math.PI*2,thetaStart,Math.PI/2);
  if(upper) g.scale(0.24,0.155,0.22);
  else g.scale(0.225,0.115,0.205);
  g.computeVertexNormals();
  return g;
}

function makeMouthPlate(){
  const g=new THREE.CircleGeometry(0.19,40);
  g.scale(1.0,0.37,1.0);
  return g;
}

export class BeakPartV2{
  constructor(){
    this.group=new THREE.Group();
    this.group.name='BeakPartV2';
    this.materials=makeMaterials();
    this.build();
    this.setExpression('neutral');
  }

  build(){
    this.upperPivot=new THREE.Group();
    this.lowerPivot=new THREE.Group();
    this.upperPivot.name='BeakUpperPivot';
    this.lowerPivot.name='BeakLowerPivot';
    this.group.add(this.upperPivot,this.lowerPivot);

    this.upper=new THREE.Mesh(makeHalfEllipsoid(true),this.materials.upper);
    this.lower=new THREE.Mesh(makeHalfEllipsoid(false),this.materials.lower);

    this.upperPivot.position.set(0,0,-0.16);
    this.lowerPivot.position.set(0,0,-0.16);
    this.upper.position.z=0.16;
    this.lower.position.z=0.16;
    this.upperPivot.add(this.upper);
    this.lowerPivot.add(this.lower);

    this.mouth=new THREE.Mesh(makeMouthPlate(),this.materials.mouth);
    this.mouth.position.set(0,-0.012,0.202);
    this.group.add(this.mouth);

    this.tongue=new THREE.Mesh(new THREE.CircleGeometry(0.075,32),this.materials.tongue);
    this.tongue.scale.set(1.0,0.38,1.0);
    this.tongue.position.set(0,-0.045,0.205);
    this.group.add(this.tongue);

    this.group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  }

  setExpression(name){
    let upperAngle=0,lowerAngle=0,scaleX=1,scaleY=1;
    let mouth=false,tongue=false;
    switch(name){
      case 'happy':
        upperAngle=-THREE.MathUtils.degToRad(6);
        lowerAngle=THREE.MathUtils.degToRad(13);
        scaleX=1.03; mouth=true; tongue=true; break;
      case 'surprised':
        upperAngle=-THREE.MathUtils.degToRad(14);
        lowerAngle=THREE.MathUtils.degToRad(28);
        scaleX=0.93; mouth=true; tongue=true; break;
      case 'angry':
        upperAngle=THREE.MathUtils.degToRad(3);
        lowerAngle=-THREE.MathUtils.degToRad(2);
        scaleX=0.97; scaleY=0.88; break;
      case 'determined':
        upperAngle=THREE.MathUtils.degToRad(1.5);
        lowerAngle=-THREE.MathUtils.degToRad(1.5);
        scaleX=1.01; scaleY=0.93; break;
      case 'sleepy':
        scaleY=0.92; break;
    }
    this.upperPivot.rotation.x=upperAngle;
    this.lowerPivot.rotation.x=lowerAngle;
    this.group.scale.set(scaleX,scaleY,1);
    this.mouth.visible=mouth;
    this.tongue.visible=tongue;
  }
}
