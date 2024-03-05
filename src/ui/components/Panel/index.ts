import { css, html } from "lit"
import { UIComponent } from "../../core/UIComponent"
import { styles } from "../../core/UIManager/src/styles"

export class Panel extends UIComponent {
  static styles = [
    styles.scrollbar,
    css`
      :host {
        min-width: 20rem;
        display: flex;
        overflow: auto;
      }

      .parent {
        display: flex;
        flex: 1;
        flex-direction: column;
        pointer-events: auto;
        border-radius: var(--bim-panel--bdrs, var(--bim-ui_size-base));
        background-color: var(--bim-panel--bgc, var(--bim-ui_bg-base));
      }

      .parent bim-label {
        --bim-label--c: var(--bim-panel--c, var(--bim-ui_bg-contrast-100));
        --bim-label--fz: var(--bim-panel--fz, var(--bim-ui_size-sm));
        font-weight: 600;
        padding: 1rem;
      }

      .sections {
        display: flex;
        flex-direction: column;
        overflow: auto;
      }
    `
  ]

  static properties = {
    icon: { type: String, reflect: true },
    name: { type: String, reflect: true },
  }
  
  declare icon?: string
  declare name?: string

  collapseSections() {
    const sections = this.querySelectorAll("bim-panel-section")
    for (const section of sections) {
      section.collapsed = true
    }
  }

  expandSections() {
    const sections = this.querySelectorAll("bim-panel-section")
    for (const section of sections) {
      section.collapsed = false
    }
  }

  render() {
    return html`
      <div class="parent">
        ${this.name || this.icon ? html`<bim-label .label=${this.name} .icon=${this.icon}></bim-label>` : null}
        <div class="sections">
          <slot></slot>
        </div>
      </div>
    `
  }
}