

import moment from 'moment';
import 'moment/min/locales';

import { LitElement, css } from 'lit-element';
import { html } from 'lit-html';

class CalendarCard extends LitElement {

  static get properties() {
    return {
      hass: Object,
      config: Object,
      content: Object
    };
  }

  constructor() {
    super();

    this.content = html``;
    this.isSomethingChanged = true;
    this.events;
    this.lastUpdate;
    this.isUpdating = false;
  }

  /**
   * merge the user configuration with default configuration
   * @param {[type]} config
   */
  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define at least one calendar entity via entities');
    }

    this.config = {
      title: 'Calendar',
      numberOfDays: 7,
      timeFormat: 'HH:mm',
      progressBar: false,
      ...config
    };
  }

  /**
   * get the size of the card
   * @return {Number}
   */
  getCardSize() {
    return 8;
  }

  static get styles() {
    return css`
        .calendar-card {
          display: flex;
          padding: 0 16px 4px;
          flex-direction: column;
        }

        .header {
          font-family: var(--paper-font-headline_-_font-family);
          -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
          font-size: var(--paper-font-headline_-_font-size);
          font-weight: var(--paper-font-headline_-_font-weight);
          letter-spacing: var(--paper-font-headline_-_letter-spacing);
          line-height: var(--paper-font-headline_-_line-height);
          text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
          opacity: var(--dark-primary-opacity);
          padding: 24px 0px 0px;
        }

        table {
          border-spacing: 0;
          margin-bottom: 10px;
        }

        .day-wrapper td {
          padding-top: 10px;
          cursor: pointer;
        }

        .day-wrapper.day-wrapper-last > td {
          padding-bottom: 10px;
          border-bottom: 1px solid;
        }

        .day-wrapper.day-wrapper-last:last-child > td {
          border-bottom: 0 !important;
        }

        .day-wrapper .overview {
          padding-left: 10px;
          cursor: pointer;
        }

        .day-wrapper .overview .title {
          font-size: 1.2em;
        }

        .day-wrapper .overview .time,
        .day-wrapper .location ha-icon {
          color: var(--primary-color);
        }

        .day-wrapper hr.progress-bar {
          border-style: solid;
          border-color: var(--secondary-color);
          border-width: 1px 0 0 0;
          margin-top: -7px;
          margin-left: 0px;
          color: var(--primary-color);
          width: 100%;
        }

        .day-wrapper ha-icon.progress-bar {
          height: 12px;
          width: 12px;
          color: var(--primary-color);
        }

        .day-wrapper .location a {
          text-decoration: none;
        }
    `;
  }

  updated() {
    this.isSomethingChanged = false;
  }

  render() {
    (async () => {
      try {

        // since this is async then we need to know 
        // when we are updating outisde the LitElement hooks
        if (this.isUpdating) return;
        this.isUpdating = true;

        moment.locale(this.hass.language);
        const events = await this.getAllEvents(this.config.entities);

        if (!this.isSomethingChanged) {
          this.isUpdating = false;
          return;
        }

        await this.updateCard(events);
        this.isUpdating = false;

      } catch (e) {
        console.log(e);
      }
    })();

    return this.content;
  }

  /**
   * gets all events for all calendars added to this card's config
   * @param  {CalendarEntity[]} entities
   * @return {Promise<Array<CalendarEvent>>}
   */
  async getAllEvents(entities) {

    // don't update if it's only been 15 min
    if (this.lastUpdate && moment().diff(this.lastUpdate, 'minutes') <= 15) {
      return this.events;
    }

    // create url params
    const dateFormat = "YYYY-MM-DDTHH:mm:ss";
    const today = moment().startOf('day');
    const start = today.format(dateFormat);
    const end = today.add(this.config.numberOfDays, 'days').format(dateFormat);

    // generate urls for calendars and get each calendar data
    const urls = entities.map(entity => `calendars/${entity}?start=${start}Z&end=${end}Z`);
    let allResults = await this.getAllUrls(urls);

    // convert each calendar object to a UI event
    let events = [].concat.apply([], allResults).map(event => new CalendarEvent(event));

    // sort events by date starting with soonest
    events.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    // see if anything changed since last time, save events, and update last time we updated
    this.isSomethingChanged = JSON.stringify(events) !== JSON.stringify(this.events);
    this.events = events;
    this.lastUpdate = moment();

    return events;
  }

  /**
   * given a list of urls get the data from them
   * @param  {Array<string>} urls
   * @return {Promise<Array<Object>>}
   */
  async getAllUrls(urls) {
    try {
      return await Promise.all(urls.map(url => this.__hass.callApi('get', url)));
    } catch (error) {
      throw error;
    }
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
      const eventsTemplate = eventDay.events.map((event, index) => {
        return html`
          <tr class='day-wrapper ${eventDay.events.length === index + 1 ? "day-wrapper-last" : ''}'>
            <td class="date">
              <div>${index === 0 ? momentDay.format('DD') : ''}</div>
              <div>${index === 0 ? momentDay.format('ddd') : ''}</div>
            </td>
            <td class="overview" @click=${e => this.getLinkHtml(event)}>
              <div class="title">${event.title}</div>
              <div class="time">${this.getTimeHtml(event)}</div>
              ${this.config.progressBar ? this.buildProgressBar(event) : ''}
            </td>
            <td class="location">
              ${this.getLocationHtml(event)}
            </td>
          </tr>
        `;
      });

      // add day template
      htmlTemplate = html`
        ${htmlTemplate}
        ${eventsTemplate}
      `;

      return htmlTemplate;
    }, html``);


    // create overall card 
    this.content = html`
      <ha-card class='calendar-card'>
        <div class='header'>
          ${this.config.title}
        </div>
        <table>
          <tbody>
            ${calendar}
          </tbody>
        </table>
      </ha-card>
    `;
  }

  /**
   * if event is going on now then build progress bar for event
   * @param {CalendarEvent} event
   * @return {TemplateResult}
   */
  buildProgressBar(event){
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
      <ha-icon icon="mdi:circle" class="progress-bar" style='margin-left:${secondsPercent}%;'></ha-icon>
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
      const matchingDateIndex = groupedEvents.findIndex(events => events.day === day)

      if (matchingDateIndex > -1) {
        groupedEvents[matchingDateIndex].events.push(event);
      } else {
        groupedEvents.push({ day, events: [event] });
      }

      return groupedEvents;
    },[]);
  }

  /**
   * opens a calendar event in a new tab if has link
   * @param {CalendarEvent} event
   */
  getLinkHtml(event) {
    event.htmlLink && window.open(event.htmlLink);
  }

  /**
   * generates HTML for showing an event times
   * @param {CalendarEvent} event
   */
  getTimeHtml(event) {
    if (event.isFullDayEvent) return html`All day`;

    const start = moment(event.startDateTime).format(this.config.timeFormat);
    const end = moment(event.endDateTime).format(this.config.timeFormat);
    return html`${start} - ${end}`;
  }

  /**
   * generate the html for showing an event location
   * @param {CalendarEvent} event
   */
  getLocationHtml(event) {
    if (!event.location || !event.locationAddress)
      return html``;

    return html`
      <a href="https://www.google.com/maps?daddr=${event.locationAddress}" target="_blank" rel="nofollow noreferrer noopener"
        title='open location'>
        <ha-icon icon="mdi:map-marker"></ha-icon>&nbsp;
      </a>
    `;
  }
}

customElements.define('calendar-card', CalendarCard);


/**
 * Creates an generalized Calendar Event to use when creating the calendar card
 * There can be Google Events and CalDav Events. This class normalizes those
 */
class CalendarEvent {

  /**
   * @param  {Object} calendarEvent
   */
  constructor(calendarEvent) {
    this.calendarEvent = calendarEvent;
  }

  /**
   * get the start time for an event
   * @return {String}
   */
  get startDateTime() {
    if (this.calendarEvent.start.date) {
      const dateTime = moment(this.calendarEvent.start.date);
      return dateTime.toISOString();
    }

    return this.calendarEvent.start && this.calendarEvent.start.dateTime || this.calendarEvent.start || '';
  }

  /**
   * get the end time for an event
   * @return {String}
   */
  get endDateTime() {
    return this.calendarEvent.end && this.calendarEvent.end.dateTime || this.calendarEvent.end || '';
  }

  /**
   * get the URL for an event
   * @return {String}
   */
  get htmlLink() {
    return this.calendarEvent.htmlLink || '';
  }

  /**
   * get the title for an event
   * @return {String}
   */
  get title() {
    return this.calendarEvent.summary || this.calendarEvent.title || '';
  }

  /**
   * get the description for an event
   * @return {String}
   */
  get description() {
    return this.calendarEvent.description;
  }

  /**
   * parse location for an event
   * @return {String}
   */
  get location() {
    if (!this.calendarEvent.location) return '';
    return this.calendarEvent.location.split(',')[0] || '';
  }

  /**
   * get location address for an event
   * @return {String}
   */
  get locationAddress() {
    if (!this.calendarEvent.location) return '';

    let address = this.calendarEvent.location.substring(this.calendarEvent.location.indexOf(',') + 1);
    return address.split(' ').join('+');
  }

  /**
   * is the event a full day event?
   * @return {Boolean}
   */
  get isFullDayEvent() {
    if (this.calendarEvent.start && this.calendarEvent.start.date) {
      return this.calendarEvent.start.date;
    }

    let start = moment(this.startDateTime);
    let end = moment(this.endDateTime);
    let diffInHours = end.diff(start, 'hours');
    return diffInHours >= 24;
  }
}
