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

    const entityOptions = entities.map(eid => { 
      const matchingConfigEnitity = this._config.entities.find(entity => (entity && entity.entity || entity) === eid);

      return { 
        entity: eid,
        name: matchingConfigEnitity ? matchingConfigEnitity.name || eid : eid, 
        checked: !!matchingConfigEnitity
      }
    });

    return entityOptions;
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
            @value-changed="${this.inputChanged}"
          ></paper-input>

           <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.hideHeader}
              .configValue="${"hideHeader"}"
            >Hide Header</paper-checkbox>
          </div>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.hideTime}
              .configValue="${"hideTime"}"
            >Hide Time</paper-checkbox>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.progressBar}
              .configValue="${"progressBar"}"
            >Progress Bar</paper-checkbox>
          </div>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.showLocation}
              .configValue="${"showLocation"}"
            >Show Location</paper-checkbox>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.showLocationIcon}
              .configValue="${"showLocationIcon"}"
            >Show Location Icon</paper-checkbox>
          </div>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.showMultiDay}
              .configValue="${"showMultiDay"}"
            >Show MultDay</paper-checkbox>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .configValue="${"hidePastEvents"}"
              .checked=${this._config.hidePastEvents}
            >Hide Past Events</paper-checkbox>
          </div>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.showEventOrigin}
              .configValue="${"showEventOrigin"}"
            >Show Event Origin</paper-checkbox>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.highlightToday}
              .configValue="${"highlightToday"}"
            >Highlight Today's Events</paper-checkbox>
          </div>

          <div class='checkbox-options'>
            <paper-checkbox
              @checked-changed="${this.checkboxChanged}" 
              .checked=${this._config.startFromToday}
              .configValue="${"startFromToday"}"
            >Start From Today</paper-checkbox>
          </div>

          <div class='other-options'>
            <paper-input
              label="Number Of Days"
              .value="${this._config.numberOfDays}"
              .configValue="${"numberOfDays"}"
              @value-changed="${this.inputChanged}"
            ></paper-input>

            <paper-input
              label="Time Format"
              .value="${this._config.timeFormat}"
              .configValue="${"timeFormat"}"
              @value-changed="${this.inputChanged}"
            ></paper-input>

            <paper-input
              label="Date Top Format"
              .value="${this._config.dateTopFormat}"
              .configValue="${"dateTopFormat"}"
              @value-changed="${this.inputChanged}"
            ></paper-input>

            <paper-input
              label="Date Bottom Format"
              .value="${this._config.dateBottomFormat}"
              .configValue="${"dateBottomFormat"}"
              @value-changed="${this.inputChanged}"
            ></paper-input>

            <paper-input
              label="Ignore Events Expression"
              .value="${this._config.ignoreEventsExpression}"
              .configValue="${"ignoreEventsExpression"}"
              @value-changed="${this.inputChanged}"
            ></paper-input>

            <paper-input
              label="Ignore Events By Location Expression"
              .value="${this._config.ignoreEventsByLocationExpression}"
              .configValue="${"ignoreEventsByLocationExpression"}"
              @value-changed="${this.inputChanged}"
            ></paper-input>
          </div>

          
        </div>

        <div class='entities'>
          <h3>Entities</h3>
          ${
            this.entityOptions.map(entity => {
              return html`
                <paper-checkbox 
                  @checked-changed="${this.entityChanged}" 
                  .checked=${entity.checked}
                  .entityId="${entity.entity}"
                >${entity.entity}</paper-checkbox>

                ${this._config.showEventOrigin ? 
                  html`
                    <div class='origin-calendar'>
                      <paper-input
                        label="Calendar Origin"
                        .value="${entity.name}"
                        .entityId="${entity.entity}"
                        @value-changed="${this.entityNameChanged}"
                      ></paper-input>
                    </div>
                  ` : html``
                }
              `;
            })
          }
        </div>
      </div>
    `;
  }

  /**
   * update config for a checkbox input
   * @param {*} ev 
   */
  checkboxChanged(ev){
    if (this.cantFireEvent) return;
    const { target: { configValue }, detail: { value } } = ev;

    this._config = Object.assign({}, this._config, { [configValue]: value } );
    fireEvent(this, 'config-changed', { config: this._config });
  }

  /**
   * change on text input
   * @param {*} ev 
   */
  inputChanged(ev){
    if (this.cantFireEvent) return;
    const { target: { configValue }, detail: { value } } = ev;

    this._config = Object.assign({}, this._config, { [configValue]: value } );
    fireEvent(this, 'config-changed', { config: this._config });
  }

  get entities(){
    const entities = [...(this._config.entities || [])];

    // convert any legacy entity strings into objects
    let entityObjects = entities.map(entity => {
      if(entity.entity) return entity;
      return { entity, name: entity };
    });

    return entityObjects;
  }

  /**
   * change the calendar name of an entity
   * @param {*} ev 
   */
  entityNameChanged(ev){
    if (this.cantFireEvent) return;
    const { target: { entityId }, detail: { value } } = ev;

    let entityObjects = [...this.entities];

    entityObjects = entityObjects.map(entity => {
      if(entity.entity === entityId) entity.name = value || '';
      return entity;
    });

    this._config = Object.assign({}, this._config, { entities: entityObjects } );
    fireEvent(this, 'config-changed', { config: this._config });
  }

  /**
   * add or remove calendar entities from config
   * @param {*} ev 
   */
  entityChanged(ev){
    if (this.cantFireEvent) return;
    const { target: { entityId }, detail: { value } } = ev;

    let entityObjects = [...this.entities];

    if(value){
      entityObjects.push({ entity: entityId, name: entityId });
    } else {
      entityObjects = entityObjects.filter(entity => entity.entity !== entityId);
    }

    this._config = Object.assign({}, this._config, { entities: entityObjects } );
    fireEvent(this, 'config-changed', { config: this._config });
  }

  /**
   * stop events from firing if certains conditions not met
   */
  get cantFireEvent(){
    return (!this._config || !this.hass || !this._firstRendered);
  }
}

