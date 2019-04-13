import moment from 'moment/src/moment';


/**
 * Creates an generalized Calendar Event to use when creating the calendar card
 * There can be Google Events and CalDav Events. This class normalizes those
 */
export default class CalendarEvent {
    /**
     * @param  {Object} calendarEvent
     */
    constructor(calendarEvent) {
        this.calendarEvent = calendarEvent;
    }

    get rawEvent(){
        return this.calendarEvent;
    }

    /**
     * get the start time for an event
     * @return {String}
     */
    get startDateTime() {
        if (this._startDateTime === undefined){
            const date = this.calendarEvent.start && this.calendarEvent.start.date || this.calendarEvent.start.dateTime || this.calendarEvent.start || '';
            this._startDateTime =  this._processDate(date);
        }
        return this._startDateTime;
    }

    set startDateTime(time=''){
        this._startDateTime = time;
    }

    /**
     * get the end time for an event
     * @return {String}
     */
    get endDateTime() {
        if (this._endDateTime === undefined) {
            const date = this.calendarEvent.end && this.calendarEvent.end.date || this.calendarEvent.end.dateTime || this.calendarEvent.end;
            this._endDateTime = this._processDate(date);
        }
        return this._endDateTime;
    }

    set endDateTime(time = '') {
        this._endDateTime = time;
    }

    /**
     * 
     * @param {*} date 
     */
    _processDate(date){
        if (date) {
            date = moment(date);
            if (this.calendarEvent.addDays) date = date.add(this.calendarEvent.addDays, 'days');
        }

        return date;
    }

    /**
     * get the URL for an event
     * @return {String}
     */
    get htmlLink() {
        return this.calendarEvent.htmlLink || '';
    }

    /**
     * is a multiday event (not all day)
     * @return {Boolean}
     */
    get isMultiDay() {
        return this.startDateTime.date() !== this.endDateTime.date() 
            && (this.startDateTime.hour() && this.endDateTime.hour());
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

        const address = this.calendarEvent.location.substring(this.calendarEvent.location.indexOf(',') + 1);
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

        if (this._isFullDayEvent === undefined){
            const start = moment(this.startDateTime);
            const end = moment(this.endDateTime);
            const diffInHours = end.diff(start, 'hours');
            return diffInHours >= 24;
        }
        return this._isFullDayEvent;
    }

    set isFullDayEvent(isFull=false){
        this._isFullDayEvent = isFull;
    }
}