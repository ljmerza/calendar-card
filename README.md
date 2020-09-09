**NOTE** The next version of HA (0.115) will include a lovelace calendar card builtin. It wont include all the features of this card right away but if development is continued on that card to at least add the most popular features then it will make this card obsolete. See https://github.com/home-assistant/frontend/pull/5813

# Calendar Card for Home Assistant
Show Google calendar events

<img src='https://raw.githubusercontent.com/ljmerza/calendar-card/master/card.png' />


[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

## Features
---
* Show the next 5 events on your Google Calendar (default set by home assistant)
* Set custom time and date format for each event
* Click on event to open in your Google calendar app
* Integrate multiple calendars
* Update notifications via custom_updater
* Click on event location to open maps app
* Language support
* Progress bar for ongoing events
* Split multiday events
* Notifications of new events
* Customize date time formats
* Enable kiosk mode (no click events)


## Installation
---
You should have setup Google calendar integration or Caldav integration in HomeAssistant.
Installation through [HACS](https://github.com/custom-components/hacs)

## Options
---
| Name                             | Type    | Requirement  | Description                                                                                                                               |
| -------------------------------- | ------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| type                             | string  | **Required** | `custom:calendar-card`                                                                                                                    |
| entities                         | object  | **Required** | List of calendars to display                                                                                                              |
| dateTopFormat                    | string  | **Optional** | `DD` Format for top line of event date                                                                                                    |
| dateBottomFormat                 | string  | **Optional** | `ddd` Format to bottom line of event date                                                                                                 |
| disableLinks                     | boolean | **Optional** | `false` Disables all links (to open calendar and location)                                                                                |
| useSourceUrl                     | boolean | **Optional** | `false` Open events via the source url instead of html link                                                                               |
| endText                          | string  | **Optional** | `End` Set custom text for event end time                                                                                                  |
| eventsLimit                      | integer | **Optional** | `99` Maximum number of events to show (shows rest of day after cut off)                                                                   |
| fullDayEventText                 | string  | **Optional** | `All day` Set custom text for a full day event                                                                                            |
| hardLimit                        | boolean | **Optional** | `false` Overrides `eventsLimit` default of showing rest of day's events even after cutoff                                                 |
| hideDeclined                     | boolean | **Optional** | `false` Hides events that you declined                                                                                                    |
| hideHeader                       | boolean | **Optional** | `false` Hide the header regardless of value                                                                                               |
| hidePastEvents                   | boolean | **Optional** | `false` Hide events that have passed                                                                                                      |
| hideTime                         | boolean | **Optional** | `false` Hides event time section entirely                                                                                                 |
| highlightToday                   | boolean | **Optional** | `false` Hightlight's today's events                                                                                                       |
| ignoreEventsByLocationExpression | string  | **Optional** | Simple case insensitive regex to ignore events that match location                                                                        |
| ignoreEventsExpression           | string  | **Optional** | Simple case insensitive regex to ignore events that match title                                                                           |
| maxHeight                        | boolean | **Optional** | `false` Sets max height for card to 500px and overflows the rest                                                                          |
| notifyEntity                     | Entity  | **Optional** | Send a notification on new events                                                                                                         |
| notifyDateTimeFormat             | string  | **Optional** | `MM/DD/YYYY HH:mma` Format for event date/time in notify message (see [here](https://momentjs.com/docs/#/displaying/format/) for options) |
| numberOfDays                     | number  | **Optional** | `7` Number of days to display from calendars                                                                                              |
| removeFromEventTitle             | string  | **Optional** | Removes substring from all event titles (case insensitive)                                                                                |
| progressBar                      | boolean | **Optional** | `false` Adds progress bar to ongoing events                                                                                               |
| showEventOrigin                  | boolean | **Optional** | `false` Shows what calendar each event is from                                                                                            |
| showLocation                     | boolean | **Optional** | `false` Shows location address                                                                                                            |
| showLocationIcon                 | boolean | **Optional** | `true` Shows map icon when event has a location                                                                                           |
| showMultiDay                     | boolean | **Optional** | `false` Split multiday events into per day                                                                                                |
| startText                        | string  | **Optional** | `Start` Set custom text for event start time                                                                                              |
| title                            | string  | **Optional** | `Calendar` Header shown at top of card                                                                                                    |
| timeFormat                       | string  | **Optional** | `HH:mm` Format to show event time (see [here](https://momentjs.com/docs/#/displaying/format/) for options)                                |

## Configurations
---
```yaml
type: custom:calendar-card
title: "My Calendar"
progressBar: true
entities:
  - calendar.ljmerzagmailcom
```

## You want more than 5 Google events?
Open the `google_calendars.yaml` file and and `max_results: 20` for each calendar items you want more events for. See documentation at [Home Assistant](https://www.home-assistant.io/components/calendar.google/)

---

Enjoy my card? Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/JMISm06AD)


[commits-shield]: https://img.shields.io/github/commit-activity/y/ljmerza/calendar-card.svg?style=for-the-badge
[commits]: https://github.com/ljmerza/calendar-card/commits/master
[license-shield]: https://img.shields.io/github/license/ljmerza/calendar-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Leonardo%20Merza%20%40ljmerza-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/ljmerza/calendar-card.svg?style=for-the-badge
[releases]: https://github.com/ljmerza/calendar-card/releases
