import * as THREE from 'three';

function makeGradientTexture(){
  const data=new Uint8Array([0,80,170,255]);
  const texture=new THREE.DataTexture(data,4,1,THREE.RedFormat);
  texture.needsUpdate=true;
  texture.minFilter=THREE.NearestFilter;
  texture.magFilter=THREE.NearestFilter;
  texture.generateMipmaps=false;
  return texture;
}

export function createEyeMaterials(){
  const gradientMap=makeGradientTexture();
  return {
    sclera:new THREE.MeshToonMaterial({color:0xffffff,gradientMap}),
    iris:new THREE.MeshToonMaterial({color:0x1f2d7b,gradientMap}),
    pupil:new THREE.MeshToonMaterial({color:0x0c163f,gradientMap}),
    highlight:new THREE.MeshBasicMaterial({color:0xffffff}),
    eyelid:new THREE.MeshToonMaterial({color:0xffffff,gradientMap,side:THREE.DoubleSide}),
  };
}

export class EyePart{
  constructor(materials=createEyeMaterials()){
    this.materials=materials;
    this.group=new THREE.Group();
    this.state={expression:'neutral',blink:0};
    this.build();
    this.applyState();
  }

  build(){
    this.eyeRoot=new THREE.Group();
    this.group.add(this.eyeRoot);
    this.sclera=new THREE.Mesh(new THREE.SphereGeometry(0.16,32,32),this.materials.sclera);
    this.sclera.scale.set(1,1,0.92);
    this.eyeRoot.add(this.sclera);
    this.irisShell=new THREE.Group();
    this.irisShell.position.z=0.098;
    this.eyeRoot.add(this.irisShell);
    this.iris=new THREE.Mesh(new THREE.SphereGeometry(0.09,28,28),this.materials.iris);
    this.iris.scale.set(1,1.08,0.35);
    this.irisShell.add(this.iris);
    this.pupil=new THREE.Mesh(new THREE.SphereGeometry(0.06,24,24),this.materials.pupil);
    this.pupil.position.z=0.012;
    this.pupil.scale.set(1,1,0.2);
    this.irisShell.add(this.pupil);
    this.highlightGroup=new THREE.Group();
    this.highlightGroup.position.z=0.124;
    this.eyeRoot.add(this.highlightGroup);
    const h1=new THREE.Mesh(new THREE.CircleGeometry(0.028,24),this.materials.highlight);
    h1.position.set(-0.042,0.05,0);
    const h2=new THREE.Mesh(new THREE.CircleGeometry(0.012,20),this.materials.highlight);
    h2.position.set(0.03,-0.035,0);
    this.highlightGroup.add(h1,h2);
    const lidGeo=new THREE.PlaneGeometry(0.38,0.22);
    this.upperLid=new THREE.Mesh(lidGeo,this.materials.eyelid);
    this.upperLid.position.set(0,0.15,0.132);
    this.eyeRoot.add(this.upperLid);
    this.lowerLid=new THREE.Mesh(lidGeo,this.materials.eyelid);
    this.lowerLid.position.set(0,-0.15,0.132);
    this.lowerLid.rotation.z=Math.PI;
    this.eyeRoot.add(this.lowerLid);
  }

  setExpression(v){this.state.expression=v;this.applyState();}
  blinkOnce(){this.blinkStart=performance.now();}
  setLook(x,y){this.irisShell.position.x=x*0.012;this.irisShell.position.y=y*0.01;this.highlightGroup.position.x=x*0.012;this.highlightGroup.position.y=y*0.01;}
  update(t){
    if(this.blinkStart){
      const e=(t-this.blinkStart)/180;
      if(e>=1){this.blinkStart=0;this.state.blink=0;} else this.state.blink=Math.sin(e*Math.PI);
      this.applyState();
    }
  }
  applyState(){
    const s=this.state;
    let top=0,bottom=0,scaleY=1.08;
    if(s.expression==='sleepy'){top=0.09;scaleY=0.9;}
    if(s.expression==='determined'){top=0.045;bottom=0.01;}
    if(s.expression==='angry'){top=0.055;bottom=0.012;}
    if(s.expression==='surprised'){top=-0.01;bottom=-0.005;scaleY=1.18;}
    const b=s.blink*0.16;
    this.upperLid.position.y=0.15-(top+b);
    this.lowerLid.position.y=-0.15+(bottom+b*0.72);
    this.iris.scale.y=scaleY;
  }
}
