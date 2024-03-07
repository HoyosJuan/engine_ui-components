import { css, html } from "lit";
import { UIComponent } from "../../core/UIComponent";
import { createRef, ref } from "lit/directives/ref.js";
import { styles } from "../../core/UIManager/src/styles";
import { Option } from "../Option"; 
import { ContextMenu } from "../ContextMenu";
import { HasName, HasValue } from "../../core/types";

export class Dropdown extends UIComponent implements HasValue, HasName {
  static styles = [
    styles.scrollbar,
    css`
      :host {
        --bim-input--bgc: var(--bim-dropdown--bgc, var(--bim-ui_bg-contrast-20));
        --bim-input--olw: var(--bim-dropdown--olw, 2px);
        --bim-input--olc: var(--bim-dropdown--olc, transparent);
        --bim-input--bdrs: var(--bim-dropdown--bdrs, var(--bim-ui_size-4xs));
        flex: 1;
      }

      :host([visible]) {
        --bim-input--olc: var(--bim-dropdown¡focus--c, var(--bim-ui_color-accent));
      }
      
      .input {
        --bim-label--fz: var(--bim-drodown--fz, var(--bim-ui_size-xs));
        --bim-label--c: var(--bim-dropdown--c, var(--bim-ui_bg-contrast-100));
        display: flex;
        flex: 1;
        overflow: hidden;
        column-gap: 0.25rem;
        outline: none;
        cursor: pointer;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem;
      }
    `
  ]

  static properties = {
    name: { type: String, reflect: true },
    icon: { type: String, reflect: true },
    label: { type: String, reflect: true },
    multiple: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    visible: { type: Boolean, reflect: true },
    searchBox: { type: Boolean, reflect: true, attribute: "search-box" },
    vertical: { type: Boolean, reflect: true },
    value: { attribute: false },
  }

  declare name?: string
  declare icon?: string
  declare label?: string
  declare multiple: boolean
  declare required: boolean
  declare searchBox: boolean
  declare vertical: boolean

  private _inputContainer = createRef<HTMLDivElement>()
  private _listElement = createRef<ContextMenu>()
  onValueChange = new Event("change")

  private _visible = false

  get visible() {
    return this._visible
  }

  set visible(value: boolean) {
    this._visible = value
    if (!value) this.resetVisibleElements()
  }
  
  private _value: any[] = []

  set value(value: any[]) {
    if (this.required && Object.keys(value).length === 0) {
      console.warn(`bim-dropdown was set as required but not value is set. Nothing has changed.`);
      return;
    };
    const _value: string[] = [];
    for (const option of value) {
      const existingOption = this.findOption(option)
      if (existingOption) {
        _value.push(existingOption.value || existingOption.label);
        if (!this.multiple && Object.keys(value).length > 1) {
          console.warn(
            `bim-dropdown wasn't set as multiple, but provided an array of values. Only first was taken.`
          );
          break;
        }
      } else {
        console.warn(
          `bim-dropdown doesn't have ${option} as a possible value.`
        );
      }
    }
    this._value = _value;
    this.updateOptionsState()
  }

  get value() {
    return this._value
  }

  private get _options() {
    const options = [...this.elements]
    for (const child of this.children) {
      if (child instanceof Option) options.push(child)
    }
    return options
  }

  constructor() {
    super()
    this.useObserver = true
    this.multiple = false
    this.required = false
    this.visible = false
    this.vertical = false
    this.searchBox = false
  }
  
  private onWindowMouseUp = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) this.visible = false;
  }

  private onOptionClick = (e: MouseEvent) => {
    const element = e.target as Option
    const option = element.value || element.label
    const selected = this._value.includes(option);
    if (!this.multiple && !this.required && !selected) {
      this.value = [option]
    } else if (!this.multiple && !this.required && selected) {
      this.value = []
    } else if (!this.multiple && this.required && !selected) {
      this.value = [option]
    } else if (this.multiple && !this.required && !selected) {
      this.value = [...this._value, option]
    } else if (this.multiple && !this.required && selected) {
      this.value = this._value.filter((v) => v !== option)
    } else if (this.multiple && this.required && !selected) {
      this.value = [...this._value, option]
    } else if (this.multiple && this.required && selected) {
      const rest = this._value.filter((v) => v !== option)
      if (rest.length !== 0) this.value = rest
    }
    this.dispatchEvent(this.onValueChange)
  }

  private onSlotChange(e: any) {
    const children = e.target.assignedElements()
    this.observe(children)
    for (const child of children) {
      if (!(child instanceof Option)) {
        console.warn("Only bim-option is allowed inside bim-dropdown. Child has been removed.");
        continue;
      }
      child.removeEventListener("click", this.onOptionClick)
      child.addEventListener("click", this.onOptionClick)
    }
  }

  private updateOptionsState() {
    for (const element of this._options) {
      if (!(element instanceof Option)) continue;
      if (this._value.includes(element.value || element.label)) {
        element.checked = true
      } else {
        element.checked = false
      }
    }
  }

  private findOption(value: any) {
    const element = this._options.find((option) => {
      if (!(option instanceof Option)) return false;
      return option.label === value || option.value === value
    }) as Option
    return element
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this.onWindowMouseUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.onWindowMouseUp);
  }

  render() {
    let inputLabel: string
    let inputImg: string | undefined
    let inputIcon: string | undefined

    if (this._value.length === 0) {
      inputLabel = "Select an option..."
    } else if (this._value.length === 1) {
      const option = this.findOption(this._value[0])
      inputLabel = option?.label || option?.value
      inputImg = option?.img
      inputIcon = option?.icon
    } else {
      inputLabel = `Multiple (${this._value.length})`
    }

    return html`
      <bim-input .label=${this.label} .icon=${this.icon} .vertical=${this.vertical}>
        <div ${ref(this._inputContainer)} class="input" @click=${() => this.visible = !this.visible}>
          <bim-label .label=${inputLabel} .img=${inputImg} .icon=${inputIcon} style="overflow: hidden;"></bim-label>
          <svg style="flex-shrink: 0" xmlns="http://www.w3.org/2000/svg" height="1.125rem" viewBox="0 0 24 24" width="1.125rem" fill="#9ca3af"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
        </div>
        <bim-context-menu ${ref(this._listElement)} .visible=${this.visible}>
          <slot @slotchange=${this.onSlotChange}></slot>
          ${this.visibleElements.map((option) => option)}
        </bim-context-menu>
      </bim-input>
    `
  }
}