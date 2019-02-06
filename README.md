<h1 align="center">Calendar Card for Home Assistant</h1>

<p align="center">
  <img src='https://i.imgur.com/86RGw5W.png' />
</p>


<h2>Upgrading from version 1.x.x to 2.x.x</h2>

Version 2.x.x introduced the following breaking changes:
* eventColor is no longer supported
* progressBar is no longer supported
* explicit adding moment.js to YAML config is no longer needed
* Card was convertered from a module to js (see new YAML example below)

<h2>Features</h2>

* Show the next 5 events on your Google Calendar (default set by home assistant)
* Set custom time format for each event
* Click on event to open in your Google calendar app
* Integrate multiple calendars
* Update notifications via custom_updater
* Click on event location to open maps app

<h2>Track Updates</h2>

This custom card can be tracked with the help of [custom-updater](https://github.com/custom-components/custom_updater).

In your configuration.yaml

```
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

<h2>Configuration</h2>
Go to your config directory and create a www folder. Inside the www run

```
git clone https://github.com/ljmerza/calendar-card.git
```

In your ui-lovelace.yaml

```
resources:
  - url: /local/calendar-card/calendar-card.js?v=2.0.0
    type: js
```

Add the custom card to views:

```
views:
  - type: custom:calendar-card
        title: "My Calendar"
        numberOfDays: 14
        entities:
          - calendar.ljmerzagmailcom
```

<h2>You want more than 5 Google events?</h2>

```
mkdir /config/custom_components/calendar
cd /config/custom_components/calendar
wget https://raw.githubusercontent.com/home-assistant/home-assistant/dev/homeassistant/components/calendar/google.py
```
Use a text editor to change the `'maxResults': 5` in `google.py` to a number of your liking.
