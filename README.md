<h1 align="center">Calendar Card for Home Assistant</h1>

<p align="center">
  <img src='https://i.imgur.com/86RGw5W.png' />
</p>

<h2>Features</h2>

* Show the next 5 events on your Google Calendar (default set by home assistant)
* Set custom time format for each event
* Click on event to open in your Google calendar app
* Integrate multiple calendars
* Update notifications via custom_updater
* Click on event location to open maps app
* Language support
* Progress bar for ongoing events

<h2>Track Updates</h2>

This custom card can be tracked with the help of [custom-updater](https://github.com/custom-components/custom_updater).

In your configuration.yaml

```yaml
custom_updater:
  card_urls:
    - https://raw.githubusercontent.com/ljmerza/calendar-card/master/custom_updater.json
```

<h1>Usage</h1>
<h2>Prerequisites</h2>
You should have setup Google calendar integration or Caldav integration in HomeAssistant.

<h2>Options</h2>

| Name | Type | Requirement | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:calendar-card`
| title | string | **Optional** | `Calendar` Header shown at top of card
| numberOfDays | number | **Optional** | `7` Number of days to display from calendars
| entities | object | **Required** | List of calendars to display
| timeFormat | string | **Optional** | `HH:mm` Format to show event time (see [here](https://momentjs.com/docs/#/displaying/format/) for options)
| progressBar | boolean | **Optional** | `false` Adds progress bar to ongoing events

<h2>Configuration</h2>
Go to your config directory and create a www folder. Inside the www run

```bash
git clone https://github.com/ljmerza/calendar-card.git
```

In your ui-lovelace.yaml

```yaml
resources:
  - url: /local/calendar-card/calendar-card.js?v=2.1.0
    type: js
```

Add the custom card to views:

```yaml
views:
  - type: custom:calendar-card
    title: "My Calendar"
    numberOfDays: 14
    progressBar: true
    entities:
      - calendar.ljmerzagmailcom
```

<h2>You want more than 5 Google events?</h2>

```bash
mkdir /config/custom_components/calendar
cd /config/custom_components/calendar
wget https://raw.githubusercontent.com/home-assistant/home-assistant/dev/homeassistant/components/calendar/google.py
```
Use a text editor to change the `'maxResults': 5` in `google.py` to a number of your liking.
