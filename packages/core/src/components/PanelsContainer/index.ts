import { css, html } from "lit";
import { property } from "lit/decorators.js";
import { Component } from "../../core/Component";
import { styles } from "../../core/Manager/src/styles";
import { Panel } from "../Panel";

// HTML tag: bim-panels-container
export class PanelsContainer extends Component {
  static styles = [
    styles.scrollbar,
    css`
      :host {
        display: flex;
        flex-direction: column;
        pointer-events: none;
        gap: 0.5rem;
      }

      :host(:not([floating])) {
        background-color: var(--bim-ui_bg-base);
      }

      :host([horizontal]) {
        flex-direction: row;
      }

      :host([horizontal]) ::slotted(bim-panel) {
        max-width: 100%;
        flex-grow: 1;
      }
    `,
  ];

  static properties = {
    gridArea: { attribute: false },
  };

  @property({ type: Boolean, reflect: true })
  horizontal: boolean;

  constructor() {
    super();
    this.horizontal = false;
  }

  private onSlotChange(e: any) {
    const children = e.target.assignedElements() as HTMLElement[];
    const lastChild = children[children.length - 1];
    for (const child of children) {
      if (!(child instanceof Panel)) continue;
      if (
        lastChild instanceof Panel &&
        lastChild.active &&
        child !== lastChild
      ) {
        child.active = false;
      }
    }
  }

  protected render() {
    return html` <slot @slotchange=${this.onSlotChange}></slot> `;
  }
}