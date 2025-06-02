import { PerspectiveCamera } from "three";

export class UtilCamera extends PerspectiveCamera {
  frontal = () => {
    this.position.set(0, 0, 30);
    this.lookAt(0, 0, 0);
  };
  planta = () => {
    this.position.set(0, 30, 0);
    this.lookAt(0, 0, 0);
  };
  lateral = () => {
    this.position.set(30, 0, 0);
    this.lookAt(0, 0, 0);
  };
  isometric = () => {
    this.position.set(30, 30, 30);
    this.lookAt(0, 0, 0);
  };
}
