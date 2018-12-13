# Calendar Card for Home Assistant

### Features
* show the next 5 events on your Google Calendar (default set by home assistant)
* Set custom time format for each event
* click on event to open in your Google calendar app
* Integrate multiple calendars
* Update notifications via custom_updater

### Track Updates
This custom card can be tracked with the help of [custom-updater](https://github.com/custom-components/custom_updater).

In your configuration.yaml

```
custom_updater:
  card_urls:
    - https://raw.githubusercontent.com/ljmerza/homeassistant-lovelace-google-calendar-card/master/custom_updater.json
```

## Usage
### Prerequisites
You should have setup Google calendar integration or Caldav integration in HomeAssistant.

## Options

| Name | Type | Requirement | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:calendar-card`
| showProgressBar | boolean | **Optional** | `true` Option to show the progress bar
| numberOfDays | number | **Optional** | `7` Number of days to display from calendars
| entities | object | **Required** | List of calendars to display
| timeFormat | object | **Optional** | `HH:mm` Format to show event time (see [here](https://momentjs.com/docs/#/displaying/format/) for options)

### Configuration
Go to your config directory and create a www folder. Inside the www run

```
git clone https://github.com/ljmerza/homeassistant-lovelace-google-calendar-card.git
```

In your ui-lovelace.yaml

```
resources:
  - url: https://unpkg.com/moment@2.23.0/moment.js
    type: js
  - url: /local/homeassistant-lovelace-google-calendar-card/calendar-card.js?v=1.1.0
    type: module
```

Add the custom card to views:

```
views:
  - type: custom:calendar-card
        name: "My Calendar"
        numberOfDays: 14
        entities:
          - calendar.ljmerzagmailcom
```

### You want more than 5 Google events?
```
mkdir /config/custom_components/calendar
cd /config/custom_components/calendar
wget https://raw.githubusercontent.com/home-assistant/home-assistant/dev/homeassistant/components/calendar/google.py
```
Use a text editor to change the `'maxResults': 5` in `google.py` to a number of your liking.
