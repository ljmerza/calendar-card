/**
 * 
 */
class CalendarCard extends HTMLElement {

  
  
  /**
   * called by hass - creates card, sets up any conmfig settings, and generates card
   * @param  {[type]} hass [description]
   * @return {[type]}      [description]
   */
  set hass(hass) {

    // if we don't have the card yet then create it
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.header = this.config.title;
      this.content = document.createElement('div');
      this.content.className = 'calendar-card';
      card.appendChild(this.content);
      this.appendChild(card);
      moment.locale(hass.language);
    }

    // save an instance of hass for later
    this._hass = hass;

    // save css rules
    this.cssRules = `
      <style>
        .calendar-card {
          display: flex;
          padding: 0 16px 4px;
          flex-direction: column;
        }
        .day-wrapper {
          border-bottom: 1px solid;
        }

        .day-wrapper:last-child {
          border-bottom: none;
        }

        .day-wrapper .calendar-day {
          display: flex;
          flex-direction: row;
          width: 100%;
        }

        .day-wrapper .date {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: top;
          flex: 0 1 40px;
          padding-top: 10px;
        }

        .day-wrapper .events {
          flex: 1 1 auto;
        }

        .day-wrapper .summary {
          font-size: 1.2em;
        }

        .day-wrapper .event-wrapper {
          margin-left: 10px;
          padding-top: 10px;
          cursor: pointer;
        }

        .day-wrapper .event-wrapper:last-child {
          padding-bottom: 10px;
        }

        .day-wrapper .event {
          flex: 0 1 auto;
          display: flex;
          flex-direction: column;
        }

        .day-wrapper .info {
          display: flex;
          width: 100%;
          justify-content: space-between;
          flex-direction: row;
        }

        .day-wrapper .time {
          color: var(--primary-color);
        }

        .day-wrapper ha-icon {
          color: var(--paper-item-icon-color, #44739e);
        }
      </style>
    `;

    // update card with calendars
    this
      .getAllEvents(this.config.entities)
      .then(events => this.updateHtmlIfNecessary(events))
      .catch(error => console.log('error', error));
  }

  /**
   * [getAllEvents description]
   * @param  {[type]} entities [description]
   * @return {[type]}          [description]
   */
  async getAllEvents(entities) {

    // don't update if it's only been 15 min
    if(this.lastUpdate && moment().diff(this.lastUpdate, 'minutes') <= 15) {
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
    
    // show progress bar if turned on
    if (this.config.showProgressBar && events.length > 0 && moment().format('DD') === moment(events[0].startDateTime).format('DD')) {
      let now = {startDateTime: moment().format(), type: 'now'}
      events.push(now);
    }

    // sort events by date starting with soonest
    events.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    // see if anything changed since last time, save events, and update last time we updated
    const isSomethingChanged = this.isSomethingChanged(events);
    this.events = events;
    this.lastUpdate = moment();
    return { events, isSomethingChanged };
    
  }

  /**
   * given a list of urls get the data from them
   * @param  {Array<string>} urls
   * @return {Array<any>}
   */
  async getAllUrls(urls) {
    try {
      return await Promise.all(urls.map(url => this._hass.callApi('get', url)));
    } catch (error) {
      throw error;
    }
  }

  /**
   * updates the entire card if we need to
   * @param  {[type]} eventList [description]
   * @return {[type]}           [description]
   */
  updateHtmlIfNecessary(eventList) {
    if(!eventList.isSomethingChanged) return;

    // save CSS rules then group events by day
    this.content.innerHTML = this.cssRules;
    const events = eventList.events;
    const groupedEventsPerDay = this.groupBy(events, event => moment(event.startDateTime).format('YYYY-MM-DD'));

    // for each group event create a UI 'day'
    groupedEventsPerDay.forEach((events, day) => {
      const eventStateCardContentElement = document.createElement('div');
      eventStateCardContentElement.classList.add('day-wrapper');
      eventStateCardContentElement.innerHTML = this.getDayHtml(day, events);
      this.content.append(eventStateCardContentElement);
    });
  }

  /**
   * generates the HTML for a single day
   * @param  {[type]} day    [description]
   * @param  {[type]} events [description]
   * @return {[type]}        [description]
   */
  getDayHtml(day, events) {
    const className = moment().format('DD') === moment(day).format('DD') ? 'date now' : 'date';
    let momentDay = moment(day);

    return `
        <div class="calendar-day">
          <div class="${className}">
            <div>${momentDay.format('DD')}</div>
            <div>${momentDay.format('ddd')}</div>
          </div>
          <div class="events">
            ${events.map(event => this.getEventHtml(event)).join('')}
          </div>
        </div>`;
  }

  /**
   * generate HTML for a single event
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  getEventHtml(event) {
    if(event.type) return '';

    return `
          <div class="event-wrapper">
            <div class="event" ${this.getLinkHtml(event)}>
              <div class="info">
                <div class="summary">
                  ${this.getTitleHtml(event)}
                </div>
                ${this.getLocationHtml(event)}
              </div>
              <div class="time">${this.getTimeHtml(event)}</div>
            </div>
          </div>`;
  }

  /**
   * gets the ebent title with a colored marker if user wants
   * @return {[type]} [description]
   */
  getTitleHtml(event){
    return this.config.showColors ? `<span style="color: ${event.color || ''};">&#9679;&nbsp;${event.title}</span>` : `${event.title}`;
  }

  /**
   * generates HTML for opening an event
   * @param {*} event 
   */
  getLinkHtml(event){
    return event.htmlLink ? `onClick="(function(){window.open('${event.htmlLink}');return false;})();return false;"` : '';
  }

  /**
   * generates HTML for showing an event times
   * @param {*} event 
   */
  getTimeHtml(event){
    if (event.isFullDayEvent) return 'All day'

    const start = moment(event.startDateTime).format(this.config.timeFormat);
    const end = moment(event.endDateTime).format(this.config.timeFormat);
    return `${start} - ${end}`;
  }

  /**
   * generate the html for showing an event location
   * @param {*} event 
   */
  getLocationHtml(event){
    let locationHtml = ``;

    if (event.location) {
      locationHtml += `
        <div class="location">
          <ha-icon icon="mdi:map-marker"></ha-icon>&nbsp;`
    }

    if (event.location && event.locationAddress) {
      locationHtml += `
          <a href="https://www.google.com/maps/place/${event.locationAddress}" target="_blank">
            ${event.location}
          </a>
        </div>`;

    } else if (event.location) {
      locationHtml += `</div>`
    }

    return locationHtml;
  }

  /**
   * merge the user configuration with default configuration
   * @param {[type]} config [description]
   */
  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define at least one calendar entity via entities');
    }

    this.config = {
      title: 'Calendar',
      showProgressBar: true,
      numberOfDays: 7,
      showColors: false,
      timeFormat: 'HH:mm',
      ...config
    };
  }

  /**
   * get the size of the card
   * @return {[type]} [description]
   */
  getCardSize() {
    return 3;
  }

  /**
   * did any event change since the last time we checked?
   * @param  {[type]}  events [description]
   * @return {Boolean}        [description]
   */
  isSomethingChanged(events) {
    let isSomethingChanged = JSON.stringify(events) !== JSON.stringify(this.events);
    return isSomethingChanged;
  }

  /**
   * ddep clone a js object
   * @param  {[type]} obj [description]
   * @return {[type]}     [description]
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * group evbents by a givenkey
   * @param  {[type]} list      [description]
   * @param  {[type]} keyGetter [description]
   * @return {[type]}           [description]
   */
  groupBy(list, keyGetter) {
    const map = new Map();

    list.forEach(item => {
        const key = keyGetter(item);
        const collection = map.get(key);

        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });

    return map;
  }
}

/**
 * Creaates an generalized Calendar Event to use when creating the calendar card
 * There can be Google Events and CalDav Events. This class normalizes those
 */
class CalendarEvent {
  
  /**
   * [constructor description]
   * @param  {[type]} calendarEvent [description]
   * @return {[type]} [description]
   */
  constructor(calendarEvent) {
    this.calendarEvent = calendarEvent;
  }

  /**
   * get the start time for an event
   * @return {[type]} [description]
   */
  get startDateTime() {
    if (this.calendarEvent.start.date) {
      let dateTime = moment(this.calendarEvent.start.date);
      return dateTime.toISOString();
    }

    return this.calendarEvent.start && this.calendarEvent.start.dateTime || this.calendarEvent.start || '';
  }

  /**
   * get the end time for an event
   * @return {[type]} [description]
   */
  get endDateTime() {
    return this.calendarEvent.end && this.calendarEvent.end.dateTime || this.calendarEvent.end || '';
  }

  /**
   * get the URL for an event
   * @return {[type]} [description]
   */
  get htmlLink(){
    return this.calendarEvent.htmlLink;
  }

  /**
   * get the title for an event
   * @return {[type]} [description]
   */
  get title() {
    return this.calendarEvent.summary || this.calendarEvent.title;
  }

  /**
   * get the description for an event
   * @return {[type]} [description]
   */
  get description() {
    return this.calendarEvent.description;
  }

  /**
   * parse location for an event
   * @return {[type]} [description]
   */
  get location() {
    if(this.calendarEvent.location) {
      return this.calendarEvent.location.split(',')[0]
    }

    return undefined;
  }

  /**
   * get location address for an event
   * @return {[type]} [description]
   */
  get locationAddress() {
    if(this.calendarEvent.location) {
      let address = this.calendarEvent.location.substring(this.calendarEvent.location.indexOf(',') + 1);
      return address.split(' ').join('+');
    }
    return undefined;
  }

  /**
   * is the event a full day event?
   * @return {Boolean} [description]
   */
  get isFullDayEvent() {
    if (this.calendarEvent.start && this.calendarEvent.start.date){
      return this.calendarEvent.start.date;
    }

    let start = moment(this.startDateTime);
    let end = moment(this.endDateTime);
    let diffInHours = end.diff(start, 'hours');
    return diffInHours >= 24;
  }
}

/**
 * add card definition to hass
 */
customElements.define('calendar-card', CalendarCard);
