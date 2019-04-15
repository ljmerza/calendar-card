import { LitElement, html } from 'lit-element';
import style from './style-editor';
import defaultConfig from './defaults';

const fireEvent = (node, type, detail = {}, options = {}) => {
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });

  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};


export default class CalendarCardEditor extends LitElement {
  static get styles() {
    return style;
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = Object.assign({}, defaultConfig, config);
  }

  get entityOptions() {
    const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'calendar');
    return entities.map(eid => ({ name: eid, checked: this._config.entities.includes(eid) }));
  }

  firstUpdated(){
    this._firstRendered = true;
  }

  render() {
    if (!this.hass) {
     return html``;
    }

    return html`
      <div class="card-config">

        <div class=overall-config'>
          <paper-input
            label="Title (Optional)"
            .value="${this._config.title}"
            .configValue="${"title"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this._valueChanged}" 
              .checked=${this._config.hideTime}
              .configValue="${"hideTime"}"
            >Hide Time</paper-checkbox>
            <paper-checkbox
              @checked-changed="${this._valueChanged}" 
              .checked=${this._config.progressBar}
              .configValue="${"progressBar"}"
            >Progress Bar</paper-checkbox>
          </div>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this._valueChanged}" 
              .checked=${this._config.showLocation}
              .configValue="${"showLocation"}"
            >Show Location</paper-checkbox>
            <paper-checkbox
              @checked-changed="${this._valueChanged}" 
              .checked=${this._config.showLocationIcon}
              .configValue="${"showLocationIcon"}"
            >Show Location Icon</paper-checkbox>
          </div>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this._valueChanged}" 
              .checked=${this._config.showMultiDay}
              .configValue="${"showMultiDay"}"
            >Show MultDay</paper-checkbox>
          </div>

          <div class='other-options'>
            <paper-input
              label="Number Of Days"
              .value="${this._config.numberOfDays}"
              .configValue="${"numberOfDays"}"
              @value-changed="${this._valueChanged}"
            ></paper-input>

            <paper-input
              label="Time Format"
              .value="${this._config.timeFormat}"
              .configValue="${"timeFormat"}"
              @value-changed="${this._valueChanged}"
            ></paper-input>

            <paper-input
              label="Date Top Format"
              .value="${this._config.dateTopFormat}"
              .configValue="${"dateTopFormat"}"
              @value-changed="${this._valueChanged}"
            ></paper-input>

            <paper-input
              label="Date Bottom Format"
              .value="${this._config.dateBottomFormat}"
              .configValue="${"dateBottomFormat"}"
              @value-changed="${this._valueChanged}"
            ></paper-input>
          </div>

          
        </div>

        <div class='entities'>
          <h3>Entities</h3>
          ${
            this.entityOptions.map(entity => {
              return html`<paper-checkbox 
                @checked-changed="${this._valueChanged}" 
                .checked=${entity.checked}
                .entityValue="${entity.name}"
              >${entity.name}</paper-checkbox>`;
            })
          }
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass || !this._firstRendered) return;

    const { target: { configValue, value, entityValue }, detail: { value: checkedValue} } = ev;

    if (entityValue){

      if (checkedValue) {
        const entities = Array.from(this._config.entities)
        entities.push(entityValue)
        this._config = Object.assign({}, this._config, { entities: entities });
      } else {
        const newEntities = this._config.entities.filter(entity => entity !== entityValue);
        this._config = Object.assign({}, this._config, {entities: newEntities} );
      }

    } else if (checkedValue !== undefined || checkedValue !== null){
      this._config = Object.assign({}, this._config, { [configValue]: checkedValue } );

    } else {
      this._config = Object.assign({}, this._config, { [configValue]: value } );
    }

    console.log(this._config);
    fireEvent(this, 'config-changed', { config: this._config });
  }
}

