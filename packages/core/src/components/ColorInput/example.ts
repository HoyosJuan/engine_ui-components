/* eslint-disable no-alert */
import * as BUI from "../..";

BUI.UIManager.registerComponents();

const colorInput =
  document.body.querySelector<BUI.ColorInput>("bim-color-input")!;
colorInput.addEventListener("input", () => {
  const { color } = colorInput;
  console.log(color);
});
