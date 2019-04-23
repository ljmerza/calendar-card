# Calendar Card for Home Assistant

---

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

## Features

* Show the next 5 events on your Google Calendar (default set by home assistant)
* Set custom time and date format for each event
* Click on event to open in your Google calendar app
* Integrate multiple calendars
* Update notifications via custom_updater
* Click on event location to open maps app
* Language support
* Progress bar for ongoing events
* Split multiday events

## Track Updates

This custom card can be tracked with the help of [custom-updater](https://github.com/custom-components/custom_updater).

In your configuration.yaml

```yaml
custom_updater:
  card_urls:
    - https://raw.githubusercontent.com/ljmerza/calendar-card/master/custom_updater.json
```

## Usage
## Prerequisites
You should have setup Google calendar integration or Caldav integration in HomeAssistant.

## Options

| Name | Type | Requirement | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:calendar-card`
| title | string|boolean | **Optional** | `Calendar` Header shown at top of card or false to hide
| numberOfDays | number | **Optional** | `7` Number of days to display from calendars
| entities | object | **Required** | List of calendars to display
| timeFormat | string | **Optional** | `HH:mm` Format to show event time (see [here](https://momentjs.com/docs/#/displaying/format/) for options)
| dateTopFormat | string | **Optional** | `DD` Format for top line of event date
| dateBottomFormat | string | **Optional** | `ddd` Format to bottom line of event date
| progressBar | boolean | **Optional** | `false` Adds progress bar to ongoing events
| hideTime | boolean | **Optional** | `false` Hides event time section entirely
| showLocation | boolean | **Optional** | `false` Shows location address
| showLocationIcon | boolean | **Optional** | `true` Shows map icon when event has a location
| showMultiDay | boolean | **Optional** | `false` Split multiday events into per day
| startFromToday | boolean | **Optional** | `false` Skip any events before today's date

## Configuration
Download `calendar-card.js` from the [latest release](https://github.com/ljmerza/calendar-card/releases/latest) and upload it your /www folder of your Home Assistant config directory.

In your ui-lovelace.yaml

```yaml
resources:
  - url: /local/calendar-card.js?track=true
    type: js
```

Add the custom card to views:

```yaml
views:
  - type: custom:calendar-card
    title: "My Calendar"
    progressBar: true
    entities:
      - calendar.ljmerzagmailcom
```

## You want more than 5 Google events?

```bash
mkdir /config/custom_components/calendar
cd /config/custom_components/calendar
wget https://raw.githubusercontent.com/home-assistant/home-assistant/dev/homeassistant/components/calendar/google.py
```
Use a text editor to change the `'maxResults': 5` in `google.py` to a number of your liking.

---

Enjoy my card? Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/JMISm06AD)


[commits-shield]: https://img.shields.io/github/commit-activity/y/ljmerza/calendar-card.svg?style=for-the-badge
[commits]: https://github.com/ljmerza/calendar-card/commits/master
[license-shield]: https://img.shields.io/github/license/ljmerza/calendar-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Leonardo%20Merza%20%40ljmerza-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/ljmerza/calendar-card.svg?style=for-the-badge
[releases]: https://github.com/ljmerza/calendar-card/releases
