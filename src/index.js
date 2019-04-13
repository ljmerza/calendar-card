import moment from 'moment/min/moment-with-locales';

import { LitElement, html } from 'lit-element';
import style from './style';
import CalendarEvent from './calendar-event';
import defaultConfig from './defaults';

import CalendarCardEditor from './index-editor';
customElements.define('calendar-card-editor', CalendarCardEditor);


class CalendarCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    };
  }

  static async getConfigElement() {
    return document.createElement("calendar-card-editor");
  }

  /**
   * merge the user configuration with default configuration
   * @param {[type]} config
   */
  setConfig(config) {
    if (!config.entities || !config.entities.length) {
      throw new Error('You need to define at least one calendar entity via entities');
    }

    const oldEvents = this.config && this.config.entities || [];
    // if the events lists have changed then we need to notify that eventsd need updating
    if (!this.config || !this.arraysEqual(oldEvents, config.entities) || config.numberOfDays !== this.config.numberOfDays) {
      this.eventNeedUpdating = true;
    }

    this.config = Object.assign({}, defaultConfig, config);
  }

  /**
   * are two arrays equal?
   * @param {*} a 
   * @param {*} b 
   * @return {boolean}
   */
  arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }

  /**
   * get the size of the card
   * @return {Number}
   */
  getCardSize() {
    return 8;
  }

  static get styles() {
    return style;
  }


  render() {
    if (this.eventNeedUpdating || moment().diff(this.lastEventsUpdate, 'minutes') >= 15) {
      (async () => {
        moment.locale(this.hass.language);
        const events = await this.getAllEvents(this.config.entities);
        await this.updateCard(events);
      })();
    }

    return html`
      <ha-card class='calendar-card'>
        ${this.createHeader()}
        ${this.content ? html`${this.content}`
          : html`<div class='loader'>
            <paper-spinner active></paper-spinner>
          </div>`
        }
      </ha-card>
    `;
  }

  /**
   * gets all events for all calendars added to this card's config
   * @param  {CalendarEntity[]} entities
   * @return {Promise<Array<CalendarEvent>>}
   */
  async getAllEvents(entities) {
    
    // create url params
    const dateFormat = 'YYYY-MM-DDTHH:mm:ss';
    const today = moment().startOf('day');
    const start = today.format(dateFormat);
    const end = today.add(this.config.numberOfDays, 'days').format(dateFormat);

    // generate urls for calendars and get each calendar data
    const urls = entities.map(entity => `calendars/${entity}?start=${start}Z&end=${end}Z`);
    const allResults = await Promise.all(urls.map(url => this.__hass.callApi('get', url)));

    // convert each calendar object to a UI event
    let newEvents = [].concat(...allResults).map(event => new CalendarEvent(event));

    // sort events by date starting with soonest
    newEvents.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    
    this.lastEventsUpdate = moment();
    this.eventNeedUpdating = false;
    return newEvents;
  }

  /**
   * updates the entire card if we need to
   * @param  {Array<CalendarEvent>} eventList
   * @return {TemplateResult}
   */
  updateCard(eventList) {
    const groupedEventsByDay = this.groupEventsByDay(eventList);

    const calendar = groupedEventsByDay.reduce((htmlTemplate, eventDay) => {
      const momentDay = moment(eventDay.day);

      // for each event in a day create template for that event
      const eventsTemplate = eventDay.events.map((event, index) => html`
          <tr class='day-wrapper ${eventDay.events.length === index + 1 ? ' day-wrapper-last' : '' }'>
            <td class="date">
              ${this.getDateHtml(index, momentDay)}
            </td>
            <td class="overview" @click=${()=> this.getLinkHtml(event)}>
              <div class="title">${event.title}</div>
              ${this.getTimeHtml(event)}
              ${this.config.progressBar ? this.buildProgressBar(event) : ''}
            </td>
            <td class="location">
              ${this.getLocationHtml(event)}
            </td>
          </tr>
        `);

      // add a day's template
      return html`
        ${htmlTemplate}
        ${eventsTemplate}
      `;
    }, html``);


    this.content = html`
      <table>
        <tbody>
          ${calendar}
        </tbody>
      </table>
    `;

    this.requestUpdate();
  }

  /**
   * create card header
   * @return {TemplateResult}
   */
  createHeader() {
    if (this.config.title === false) return html``;

    return html`
      <div class='header'>
        ${this.config.title}
      </div>
    `;
  }

  /**
   * if event is going on now then build progress bar for event
   * @param {CalendarEvent} event
   * @return {TemplateResult}
   */
  buildProgressBar(event) {
    if (!event.startDateTime || !event.endDateTime || event.isFullDayEvent) return html``;

    const now = moment(new Date());
    const start = moment(event.startDateTime);
    const end = moment(event.endDateTime);
    if (now.isBefore(start) || now.isSameOrAfter(end) || !start.isValid() || !end.isValid()) return html``;

    const nowSeconds = now.unix();
    const startSeconds = start.unix();
    const endSeconds = end.unix();
    const secondsPercent = (nowSeconds - startSeconds) / (endSeconds - startSeconds) * 100;

    return html`
      <ha-icon icon="mdi:circle" class="progress-bar" style='margin-left:00000000000000000%;'></ha-icon>
      <hr class="progress-bar" />
    `;
  }

  /**
   * group events by the day it's on
   * @param  {Array<CalendarEvent>} events
   * @return {Array<Object>}
   */
  groupEventsByDay(events) {
    return events.reduce((groupedEvents, event) => {
      const day = moment(event.startDateTime).format('YYYY-MM-DD');
      const matchingDateIndex = groupedEvents.findIndex(group => group.day === day);

      if (matchingDateIndex > -1) {
        groupedEvents[matchingDateIndex].events.push(event);
      } else {
        groupedEvents.push({ day, events: [event] });
      }

      return groupedEvents;
    }, []);
  }

  /**
   * opens a calendar event in a new tab if has link
   * @param {CalendarEvent} event
   */
  getLinkHtml(event) {
    if (event.htmlLink) {
      window.open(event.htmlLink);
    }
  }

  /**
   * generates HTML for showing date an event is taking place
   * @param {number} index index of current day event
   * @param {Moment} momentDay
   */
  getDateHtml(index, momentDay) {
    const top = index === 0 ? momentDay.format(this.config.dateTopFormat) : '';
    const bottom = index === 0 ? momentDay.format(this.config.dateBottomFormat) : '';

    return html`
      <div>
        ${top}
      </div>
      <div>
        ${bottom}
      </div>
      `;
  }

  /**
   * generates HTML for showing an event times
   * @param {CalendarEvent} event
   */
  getTimeHtml(event) {
    if (this.config.hideTime === true) return html``;

    if (event.isFullDayEvent) return html`<div class="time">All day</div>`;

    const start = moment(event.startDateTime).format(this.config.timeFormat);
    const end = moment(event.endDateTime).format(this.config.timeFormat);
    return html`<div class="time">${start} - ${end}</div>`;
  }

  /**
   * generate the html for showing an event location
   * @param {CalendarEvent} event
   */
  getLocationHtml(event) {
    if (!event.location || !event.locationAddress || !this.config.showLocationIcon)
      return html``;

    return html`
      <a href="https://www.google.com/maps?daddr=${event.locationAddress}" target="_blank" rel="nofollow noreferrer noopener"
        title='open location'>
        <div>
          <ha-icon icon="mdi:map-marker"></ha-icon>&nbsp;
        </div>
        <div>
          ${this.config.showLocation ? event.location : ''}
        </div>
      </a>
    `;
  }
}

customElements.define('calendar-card', CalendarCard);
