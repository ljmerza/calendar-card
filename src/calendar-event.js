import moment from './moment';


/**
 * Creates an generalized Calendar Event to use when creating the calendar card
 * There can be Google Events and CalDav Events. This class normalizes those
 */
export default class CalendarEvent {

    constructor(calendarEvent, config) {
        this._calendarEvent = calendarEvent;
        this._config = config;
    }

    get rawEvent(){
        return this._calendarEvent;
    }

    get id() {
        return (this.rawEvent.id || this.rawEvent.uid) + this.title;
    }

    get originCalendar(){
        return this.rawEvent.originCalendar;
    }

    get entity() {
        return this._calendarEvent.hassEntity || {};
    }

    get originName() {
        const originCalendar = this.originCalendar;
        if (originCalendar && originCalendar.name) 
            return originCalendar.name;

        const entity = this.entity;
        if (entity && entity.attributes && entity.attributes.friendly_name) 
            return entity.attributes.friendly_name;

        if (originCalendar && originCalendar.entity) 
            return originCalendar.entity;

        return entity && entity.entity || entity || 'Unknown';
    }

    /**
     * get the start time for an event
     * @return {String}
     */
    get startDateTime() {
        if (this._startDateTime === undefined){
            const date = this.rawEvent.start && this.rawEvent.start.date || this.rawEvent.start.dateTime || this.rawEvent.start || '';
            this._startDateTime =  this._processDate(date);
        }

        return this._startDateTime.clone();
    }

    /**
     * get the end time for an event
     * @return {String}
     */
    get endDateTime() {
        if (this._endDateTime === undefined) {
            const date = this.rawEvent.end && this.rawEvent.end.date || this.rawEvent.end.dateTime || this.rawEvent.end;
            this._endDateTime = this._processDate(date, true);
        }

        return this._endDateTime.clone();
    }

    get addDays(){
        return this.rawEvent.addDays !== undefined ? this.rawEvent.addDays : false;
    }

    get daysLong() {
        return this.rawEvent.daysLong;
    }

    get isFirstDay(){
        return this.rawEvent._isFirstDay;
    }

    get isLastDay(){
        return this.rawEvent._isLastDay;
    }

    /**
     * 
     * @param {string} date
     * @param {boolean} isEndDate
     */
    _processDate(date, isEndDate=false){
        if (!date) return date;

        date = moment(date);

        // add days to a start date for multi day event
        if (this.addDays !== false) {
            if (!isEndDate && this.addDays) date = date.add(this.addDays, 'days');

            // if not the last day and we are modifying the endDateTime then 
            // set end dateTimeDate as end of start day for that partial event
            if (!this.isLastDay && isEndDate) {
                date = moment(this.startDateTime).endOf('day');

            } else if (this.isLastDay && !isEndDate) {
                // if last day and start time then set start as start of day
                date = date.startOf('day');
            }
        }

        return date;
    }

    /**
     * is this recurring?
     * @return {boolean}
     */
    get isRecurring() {
        return !!this.rawEvent.recurringEventId;
    }

    get isDeclined() {
        const attendees = this.rawEvent.attendees || [];
        return attendees.filter(a => a.self && a.responseStatus === 'declined').length !== 0;
    }

    /**
     * get the URL for an event
     * @return {String}
     */
    get htmlLink() {
        return this.rawEvent.htmlLink || '';
    }

    /**
     * get the URL from the source element
     * @return {String}
     */
    get sourceUrl() {
        return (this.rawEvent.source) ? this.rawEvent.source.url || '' : '';
    }

    /**
     * is a multiday event (not all day)
     * @return {Boolean}
     */
    get isMultiDay() {
        // if more than 24 hours we automatically know it's multi day
        if (this.endDateTime.diff(this.startDateTime, 'hours') > 24) return true;

        // end date could be at midnight which is not multi day but is seen as the next day
        // subtract one minute and if that made it one day then its NOT one day
        const daysDifference = Math.abs(this.startDateTime.date() - this.endDateTime.subtract(1, 'minute').date());
        if (daysDifference === 1 && this.endDateTime.hours() === 0 && this.endDateTime.minutes() === 0) return false;

        return !!daysDifference;
    }

    /**
     * is the event a full day event?
     * @return {Boolean}
     */
    get isAllDayEvent() {
        const isMidnightStart = this.startDateTime.startOf('day').diff(this.startDateTime) === 0;
        const isMidnightEnd = this.endDateTime.startOf('day').diff(this.endDateTime) === 0;
        if (isMidnightStart && isMidnightEnd) return true;

        // check for days that are between multi days - they ARE all day
        if(!this.isFirstDay && !this.isLastDay && this.daysLong) return true;

        return isMidnightStart && isMidnightEnd;
    }

    /**
     * split this event into a multi day event
     * @param {*} newEvent 
     */
    splitIntoMultiDay(newEvent) {
        const partialEvents = [];
        
        // multi days start at two days
        // every 24 hours is a day. if we do get some full days then just add to 1 daysLong
        let daysLong = 2;
        const fullDays = parseInt(this.endDateTime.subtract(1, 'minutes').diff(this.startDateTime, 'hours') / 24);
        if (fullDays) daysLong  = fullDays + 1;

        for (let i = 0; i < daysLong; i++) {
            // copy event then add the current day/total days to 'new' event
            const copiedEvent = JSON.parse(JSON.stringify(newEvent.rawEvent));
            copiedEvent.addDays = i;
            copiedEvent.daysLong = daysLong;
            
            copiedEvent._isFirstDay = i === 0;
            copiedEvent._isLastDay = i === (daysLong - 1);
            
            const partialEvent = new CalendarEvent(copiedEvent, this._config);

            // only add event if starting before the config numberOfDays
            const endDate = moment().startOf('day').add(this._config.numberOfDays, 'days');
            if (endDate.isAfter(partialEvent.startDateTime)) {
                partialEvents.push(partialEvent)
            }
        }

        return partialEvents;
    }

    /**
     * get the title for an event
     * @return {String}
     */
    get title() {
        let title = this.rawEvent.summary || this.rawEvent.title || '';

        if (this.rawEvent.daysLong){
            title += ` (${this.addDays + 1}/${this.daysLong})`;
        }

        // if given config then remove piece of text from all event titles
        if (this._config.removeFromEventTitle){
            const regEx = new RegExp(this._config.removeFromEventTitle, 'i');
            title = title.replace(regEx, '');
        }

        return title;
    }

    /**
     * get the description for an event
     * @return {String}
     */
    get description() {
        return this.rawEvent.description;
    }

    /**
     * parse location for an event
     * @return {String}
     */
    get location() {
        if (!this.rawEvent.location) return '';
        return this.rawEvent.location.split(',')[0] || '';
    }

    /**
     * get location address for an event
     * @return {String}
     */
    get locationAddress() {
        if (!this.rawEvent.location) return '';

        const address = this.rawEvent.location.substring(this.rawEvent.location.indexOf(',') + 1);
        return address.split(' ').join('+');
    }
}
