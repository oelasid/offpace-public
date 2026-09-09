import * as THREE from 'three';

function browGeometry(){
  const shape=new THREE.Shape();
  shape.moveTo(-0.11,-0.025);
  shape.quadraticCurveTo(0,0.035,0.11,-0.025);
  shape.quadraticCurveTo(0,-0.005,-0.11,-0.025);
  const geo=new THREE.ShapeGeometry(shape,24);
  geo.computeVertexNormals();
  return geo;
}

export class BrowPart{
  constructor({side='left',color=0x21355f}={}){
    this.side=side;
    this.group=new THREE.Group();
    this.group.name=`Brow_${side}`;
    const mat=new THREE.MeshToonMaterial({color,side:THREE.DoubleSide});
    this.mesh=new THREE.Mesh(browGeometry(),mat);
    this.mesh.scale.set(1.0,1.0,1.0);
    this.mesh.position.z=0.145;
    this.group.add(this.mesh);
  }
  setPose({y=0,angle=0,scaleX=1,scaleY=1}={}){
    this.group.position.y=y;
    this.group.rotation.z=angle;
    this.mesh.scale.set(scaleX,scaleY,1);
  }
}
