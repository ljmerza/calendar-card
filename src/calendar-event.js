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
        this._calendarEvent = calendarEvent;
    }

    get id(){
        return this._calendarEvent.id + this.title;
    }

    get rawEvent(){
        return this._calendarEvent;
    }

    get originCalendar(){
        return this._calendarEvent.originCalendar;
    }

    /**
     * get the start time for an event
     * @return {String}
     */
    get startDateTime() {
        if (this._startDateTime === undefined){
            const date = this._calendarEvent.start && this._calendarEvent.start.date || this._calendarEvent.start.dateTime || this._calendarEvent.start || '';
            this._startDateTime =  this._processDate(date);
        }
        return this._startDateTime;
    }

    /**
     * get the end time for an event
     * @return {String}
     */
    get endDateTime() {
        if (this._endDateTime === undefined) {
            const date = this._calendarEvent.end && this._calendarEvent.end.date || this._calendarEvent.end.dateTime || this._calendarEvent.end;
            this._endDateTime = this._processDate(date, true);
        }
        return this._endDateTime;
    }

    get addDays(){
        return this._calendarEvent.addDays !== undefined ? this._calendarEvent.addDays : false;
    }

    get daysLong() {
        return this._calendarEvent.daysLong;
    }

    get isFirstDay(){
        return this._calendarEvent.addDays === 0;
    }

    get isLastDay(){
        return this._calendarEvent.addDays === (this._calendarEvent.daysLong - 1);
    }

    /**
     * 
     * @param {string} date
     * @param {boolean} isEndDate
     */
    _processDate(date, isEndDate=false){
        if (date) {
            date = moment(date);
            // add days to a start date for multi day event
            if (this.addDays !== false) {
                if (!isEndDate && this.addDays) date = date.add(this.addDays, 'days');

                // if first day and end time then set to end of current event day that day
                if (this.isFirstDay && isEndDate) {
                    date = moment(this.startDateTime).endOf('day');

                } else if (this.isLastDay && !isEndDate) {
                    // if last day and start time then set start as start of day
                    date = date.startOf('day');
                }
            }
        }

        return date;
    }

    /**
     * get the URL for an event
     * @return {String}
     */
    get htmlLink() {
        return this._calendarEvent.htmlLink || '';
    }

    /**
     * is a multiday event (not all day)
     * @return {Boolean}
     */
    get isMultiDay() {
        if (this.endDateTime.diff(this.startDateTime, 'hours') <= 24 && this.startDateTime.hour() === 0) return false;
        if (this.startDateTime.date() !== this.endDateTime.date()) return true;
    }

    /**
     * get the title for an event
     * @return {String}
     */
    get title() {
        let title = this._calendarEvent.summary || this._calendarEvent.title || '';

        if (this._calendarEvent.daysLong){
            title += ` (${this.addDays + 1}/${this.daysLong})`;
        }

        return title;
    }

    /**
     * get the description for an event
     * @return {String}
     */
    get description() {
        return this._calendarEvent.description;
    }

    /**
     * parse location for an event
     * @return {String}
     */
    get location() {
        if (!this._calendarEvent.location) return '';
        return this._calendarEvent.location.split(',')[0] || '';
    }

    /**
     * get location address for an event
     * @return {String}
     */
    get locationAddress() {
        if (!this._calendarEvent.location) return '';

        const address = this._calendarEvent.location.substring(this._calendarEvent.location.indexOf(',') + 1);
        return address.split(' ').join('+');
    }

    /**
     * is the event a full day event?
     * @return {Boolean}
     */
    get isAllDayEvent() {

        // if multiday then only full day is first day is all day
        if (this.isFirstDay && (this.startDateTime.hour() || this.startDateTime.minutes())) return false;
        else if (this.isFirstDay) return true;
        // same for last day
        if (this.isLastDay && (this.endDateTime.hour() || this.endDateTime.minutes())) return false;
        else if (this.isLastDay) return true;
        
        // if we got this far and add days is true then it's a middle day of a multi day event so its all day
        if(this.addDays) return true;

        // 
        if (this.endDateTime.diff(this.startDateTime, 'hours') <= 24 && this.startDateTime.hour() === 0) return true;
    }
}
