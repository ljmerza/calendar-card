import moment from './locales';

import { LitElement, html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { until } from 'lit-html/directives/until.js';

import style from './style';
import CalendarEvent from './calendar-event';
import defaultConfig from './defaults';

import CalendarCardEditor from './index-editor';
customElements.define('calendar-card-editor', CalendarCardEditor);


class CalendarCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
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

    // if checked entities has changed then update events
    const newNames = (config.entities || []).map(entity => entity.entity || entity);
    const oldNames = ((this.config || {}).entities || []).map(entity => entity.entity || entity);
    if(!this.config || JSON.stringify(newNames) !== JSON.stringify(oldNames) || config.numberOfDays !== this.config.numberOfDays) {
      this.cardNeedsUpdating = true;
    }

    // if anything changed then overall card needs updating
    if(JSON.stringify(config) !== JSON.stringify(this.config || {})) {
      this.cardNeedsUpdating = true;
    }

    this.config = Object.assign({}, defaultConfig, config);
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

  shouldUpdate() {
    return this.cardNeedsUpdating || moment().diff(this.lastEventsUpdate, 'minutes') >= 15;
  }

  render() {
    return html`
      <ha-card class='calendar-card'>
        ${this.createHeader()}
        ${until(this.updateCard(), html``)}
      </ha-card>
    `;
  }

  /**
   * updates the entire card
   * @return {TemplateResult}
   */
  async updateCard() {
    moment.locale(this.hass.language);

    const events = await this.getAllEvents()
    const groupedEventsByDay = this.groupEventsByDay(events);

    const calendar = groupedEventsByDay.reduce((htmlTemplate, eventDay) => {
      const momentDay = moment(eventDay.day);

      // if startFromToday config then skip events that are before today's date
      if (this.config.startFromToday && moment().startOf('day').isAfter(momentDay)){
        return htmlTemplate;
      }

      // for each event in a day create template for that event
      const eventsTemplate = repeat(eventDay.events, event => event.id, (event, index) => {
          return html`
            <tr class='day-wrapper ${eventDay.events.length === index + 1 ? ' day-wrapper-last' : '' }'>
              <td class="date">
                ${this.getDateHtml(index, momentDay)}
              </td>
              <td class="overview" @click=${()=> this.getLinkHtml(event)}>
                <div class="title">${event.title}</div>
                ${this.getEventOrigin(event)}
                ${this.getTimeHtml(event)}
                ${this.config.progressBar ? this.getProgressBar(event) : ''}
              </td>
              <td class="location">
                ${this.getLocationHtml(event)}
              </td>
            </tr>
          `
      });

      return html`
        ${htmlTemplate}
        ${eventsTemplate}
      `;
    }, html``);

    this.cardNeedsUpdating = false;

    return html`
      <table>
        <tbody>
          ${calendar}
        </tbody>
      </table>
    `;
  }

  /**
   * gets all events for all calendars added to this card's config
   * @return {Promise<Array<CalendarEvent>>}
   */
  async getAllEvents(){

    // create url params
    const dateFormat = 'YYYY-MM-DDTHH:mm:ss';
    const today = moment().startOf('day');
    const start = today.format(dateFormat);
    const end = today.add(this.config.numberOfDays, 'days').format(dateFormat);

    // for each calendar entity get all events
    // each entity may be a string of entity id or
    // an object with custom name given with entity id
    this._allEvents = [];
    for(let i=0; i < this.config.entities.length; i++){
      const entity = this.config.entities[i];
      const calendarEntity = (entity && entity.entity) || entity;
      const url = `calendars/${calendarEntity}?start=${start}Z&end=${end}Z`;

      const events = (await this.__hass.callApi('get', url))
      .map(event => {
        event.entity = entity;
        return event;
      });

      this._allEvents.push(...events);
    }

    return this.processEvents();
  }

  /**
   * converts all calendar events to CalendarEvent objects
   * @return {Promise<Array<CalendarEvent>>}
   */
  processEvents() {
    // for some reason Lit Element is trying to sync multiple times before this is complete causing
    // duplicate events - this forces unique events only by looking at calendar event id
    const uniqueEvents = this._allEvents.filter((event, index, self) => {

      // an event might have a uid or id (caldav has uid, google has id) via calendar-card/issues/37
      return index === self.findIndex(e => (e.id || e.uid) === (event.uid || event.id));
    });

    // convert each calendar object to a UI event
    let newEvents = uniqueEvents.reduce((events, event) => {
      event.originCalendar = this.config.entities.find(entity => entity.entity === event.entity.entity);
      const newEvent = new CalendarEvent(event);
      
      /**
       * if we want to split multi day events and its a multi day event then 
       * get how long then event is and for each day
       * copy the event, add # of days to start/end time for each event 
       * then add as 'new' event
       */
      if (this.config.showMultiDay && newEvent.isMultiDay) {
        const today = moment().startOf('day');
        const endDate = today.add(this.config.numberOfDays, 'days');

        let daysLong = (newEvent.endDateTime.diff(newEvent.startDateTime, 'days') + 1);
        const partialEvents = [];

        // if we are all day events then we don't need that last day ending at 12am
        if (newEvent.endDateTime.hour() === 0 && newEvent.endDateTime.minutes() === 0) daysLong -= 1;

        for (let i = 0; i < daysLong; i++) {
          // copy event then add the current day/total days to 'new' event
          const copiedEvent = JSON.parse(JSON.stringify(newEvent.rawEvent));
          copiedEvent.addDays = i;
          copiedEvent.daysLong = daysLong;
          
          const partialEvent = new CalendarEvent(copiedEvent);

          // only add event if starting before the config numberOfDays
          if (endDate.isAfter(partialEvent.startDateTime)){
            partialEvents.push(partialEvent)
          }
        }

        events = events.concat(partialEvents);

      } else {
        // else just push normal event
        events.push(newEvent)
      }

      return events;
    }, []);

    // sort events by date starting with soonest
    newEvents.sort((a, b) => a.startDateTime.isBefore(b.startDateTime) ? -1 : 1);
    
    this.lastEventsUpdate = moment();
    return newEvents;
  }

  /**
   * create card header
   * @return {TemplateResult}
   */
  createHeader() {
    if (this.config.hideHeader || this.config.title === false) return html``;

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
  getProgressBar(event) {
    if (!event.startDateTime || !event.endDateTime || event.isAllDayEvent) return html``;

    const now = moment(new Date());
    if (now.isBefore(event.startDateTime) || now.isSameOrAfter(event.endDateTime) || !event.startDateTime.isValid() || !event.endDateTime.isValid()) return html``;

    const nowSeconds = now.unix();
    const startSeconds = event.startDateTime.unix();
    const endSeconds = event.endDateTime.unix();
    const secondsPercent = (nowSeconds - startSeconds) / (endSeconds - startSeconds) * 100;

    return html`
      <ha-icon 
        icon="mdi:circle" 
        style='margin-left:${secondsPercent}%;'
        class="progress-bar" 
      ></ha-icon>
      <hr class="progress-bar" />
    `;
  }

  getEventOrigin(event){
    if (!this.config.showEventOrigin || !event.originCalendar || !event.originCalendar.name) return html``;

    return html`
      <div class='event-origin'>
        <span>${event.originCalendar.name}</span>
        <ha-icon icon="mdi:calendar-blank-outline"></ha-icon> 
      </div>
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

    if (event.isAllDayEvent) return html`<div class="time">All day</div>`;

    const start = event.startDateTime && event.startDateTime.format(this.config.timeFormat);
    const end = event.endDateTime && event.endDateTime.format(this.config.timeFormat);
    const date = (event.isFirstDay && `Start:${start}`) || (event.isLastDay && `End:${end}`) || (start && end  && `${start} - ${end}`) || '';
    return html`<div class="time">${date}</div>`;
  }

  /**
   * generate the html for showing an event location
   * @param {CalendarEvent} event
   */
  getLocationHtml(event) {
    if (!event.location || !event.locationAddress || !this.config.showLocationIcon)
      return html``;

    return html`
      <a href="https://www.google.com/maps?daddr=${event.location} ${event.locationAddress}" target="_blank" rel="nofollow noreferrer noopener"
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
