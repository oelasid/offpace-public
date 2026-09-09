import * as THREE from 'three';
import { PENGUIN_V2_SPEC as SPEC } from './spec.js';
import {
  BeakPart,
  buildBellyPart,
  buildBodyPart,
  buildFootPart,
  buildHeadPart,
  buildScarfPart,
  buildTuftPart,
  buildWingPart,
} from './parts.js';
import { FaceAssembly } from './FaceAssembly.js';

function setPos(o, p){ o.position.set(p[0], p[1], p[2]); }

export class LastPenguinCurrent extends THREE.Group {
  constructor(){
    super();
    this.name = 'LastPenguin_CurrentParts';
    this.motion = 'idle';
    this.expression = 'neutral';
    this.look = new THREE.Vector2(0,0);
    this._build();
    this._assemble();
    this.setExpression('neutral');
  }

  _build(){
    this.parts = {
      body: buildBodyPart(),
      belly: buildBellyPart(),
      head: buildHeadPart(),
      face: new FaceAssembly(),
      beak: new BeakPart(),
      tuft: buildTuftPart(),
      wingL: buildWingPart(-1),
      wingR: buildWingPart(1),
      footL: buildFootPart(-1),
      footR: buildFootPart(1),
      scarf: buildScarfPart(),
    };
  }

  _assemble(){
    this.visualRoot = new THREE.Group();
    this.add(this.visualRoot);
    this.bodyPivot = new THREE.Group();
    this.headPivot = new THREE.Group();
    this.wingLPivot = new THREE.Group();
    this.wingRPivot = new THREE.Group();
    this.footLPivot = new THREE.Group();
    this.footRPivot = new THREE.Group();
    this.scarfPivot = new THREE.Group();
    this.visualRoot.add(this.bodyPivot,this.headPivot,this.wingLPivot,this.wingRPivot,this.footLPivot,this.footRPivot,this.scarfPivot);
    this.bodyPivot.add(this.parts.body,this.parts.belly);
    this.headPivot.add(this.parts.head,this.parts.face.group,this.parts.beak,this.parts.tuft);
    this.wingLPivot.add(this.parts.wingL);
    this.wingRPivot.add(this.parts.wingR);
    this.footLPivot.add(this.parts.footL);
    this.footRPivot.add(this.parts.footR);
    this.scarfPivot.add(this.parts.scarf);

    const p=SPEC.parts;
    setPos(this.bodyPivot,p.body.position);
    this.parts.body.position.set(0,0,0);
    setPos(this.parts.belly,[p.belly.position[0]-p.body.position[0],p.belly.position[1]-p.body.position[1],p.belly.position[2]-p.body.position[2]]);
    setPos(this.headPivot,p.head.position);
    this.parts.head.position.set(0,0,0);
    this.parts.face.group.position.set(0, 0.015, 0.705);
    this.parts.face.group.rotation.x = -0.012;
    setPos(this.parts.beak,[p.beak.position[0]-p.head.position[0],p.beak.position[1]-p.head.position[1],p.beak.position[2]-p.head.position[2]]);
    this.parts.beak.position.z += 0.035;
    setPos(this.parts.tuft,[p.tuft.position[0]-p.head.position[0],p.tuft.position[1]-p.head.position[1],p.tuft.position[2]-p.head.position[2]]);
    setPos(this.wingLPivot,p.wing.pivotLeft);
    setPos(this.wingRPivot,p.wing.pivotRight);
    this.wingLPivot.rotation.z=p.wing.baseRotationZ;
    this.wingRPivot.rotation.z=-p.wing.baseRotationZ;
    setPos(this.footLPivot,[-p.foot.x,p.foot.y,p.foot.z]);
    setPos(this.footRPivot,[p.foot.x,p.foot.y,p.foot.z]);
    setPos(this.scarfPivot,p.scarf.position);
    this.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
  }

  setExpression(name){
    this.expression=name;
    this.parts.face.setExpression(name);
    this.parts.beak.resetExpression();
    if(name==='happy'){
      this.parts.beak.mouth.visible=true;
      this.parts.beak.mouth.scale.set(.8,1,1);
      this.parts.beak.lowerPivot.rotation.x=-0.24;
    } else if(name==='surprised'){
      this.parts.beak.mouth.visible=true;
      this.parts.beak.mouth.scale.set(.72,1.15,1);
      this.parts.beak.lowerPivot.rotation.x=-0.40;
    } else if(name==='angry'){
      this.parts.beak.upper.scale.y=.88;
    }
  }

  setLook(x,y){
    this.look.set(THREE.MathUtils.clamp(x,-1,1),THREE.MathUtils.clamp(y,-1,1));
    this.parts.face.setLook(this.look.x,this.look.y);
  }
  blink(){ this.parts.face.blinkOnce(); }
  setMotion(name){ this.motion=name; }
  setGuideVisible(v){ this.parts.face.setGuideVisible(v); }

  update(timeMs){
    const t=timeMs*0.001;
    this.parts.face.update(timeMs);
    const wingBase=SPEC.parts.wing.baseRotationZ;
    this.visualRoot.position.set(0,0,0);
    this.visualRoot.rotation.set(0,0,0);
    this.bodyPivot.rotation.set(0,0,0);
    this.headPivot.rotation.set(0,0,0);
    this.wingLPivot.rotation.set(0,0,wingBase);
    this.wingRPivot.rotation.set(0,0,-wingBase);
    this.footLPivot.rotation.set(0,0,0);
    this.footRPivot.rotation.set(0,0,0);
    const tail=this.parts.scarf.userData.tailPivot;
    tail.rotation.set(0,0,0);

    if(this.motion==='idle'){
      this.visualRoot.position.y=Math.sin(t*2)*0.018;
      this.bodyPivot.rotation.z=Math.sin(t*1.1)*0.012;
      this.headPivot.rotation.z=-Math.sin(t*1.1)*0.014;
      this.wingLPivot.rotation.z=wingBase+Math.sin(t*1.7)*0.025;
      this.wingRPivot.rotation.z=-wingBase-Math.sin(t*1.7)*0.025;
      tail.rotation.z=Math.sin(t*2)*0.05;
    } else if(this.motion==='waddle'){
      const s=Math.sin(t*7);
      this.visualRoot.rotation.z=s*0.10;
      this.visualRoot.position.y=Math.abs(s)*0.045;
      this.footLPivot.rotation.x=s*0.45;
      this.footRPivot.rotation.x=-s*0.45;
      this.wingLPivot.rotation.z=0.43+s*0.09;
      this.wingRPivot.rotation.z=-0.43+s*0.09;
      this.headPivot.rotation.z=-s*0.05;
      tail.rotation.z=-s*0.12;
    } else if(this.motion==='run'){
      const s=Math.sin(t*10.6);
      this.visualRoot.position.y=Math.abs(s)*0.07;
      this.visualRoot.rotation.z=s*0.045;
      this.footLPivot.rotation.x=s*0.78;
      this.footRPivot.rotation.x=-s*0.78;
      this.wingLPivot.rotation.z=0.62+s*0.16;
      this.wingRPivot.rotation.z=-0.62+s*0.16;
      this.headPivot.rotation.x=Math.sin(t*21.2)*0.02;
      tail.rotation.z=-0.34+Math.sin(t*8)*0.08;
    } else if(this.motion==='slide'){
      this.visualRoot.rotation.x=-0.55;
      this.visualRoot.position.y=-0.03+Math.sin(t*6)*0.01;
      this.wingLPivot.rotation.z=0.98;
      this.wingRPivot.rotation.z=-0.98;
      this.footLPivot.rotation.x=-0.32;
      this.footRPivot.rotation.x=-0.32;
      tail.rotation.z=-0.55+Math.sin(t*7)*0.07;
    }
  }
}
