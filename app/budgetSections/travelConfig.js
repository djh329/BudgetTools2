import {
  TRAVEL,
  FUNDING_PER_MILE
} from '../constants'

export const travel = {
  "name": TRAVEL,
  "title": "Travel Events",
  "save_text": "Save To Budget",
  "repeat": [
    {
      "addButton": "Add Travel Event",
      "defaultTriggerText": "Travel Event",
      "name": "travel_events",
      "removeButton": "Remove Event",
      "values": [
      {
        "label" : "Name of Event",
        "name": "name",
        "type": "text",
        "max": 60,
        "errorMessage": "Enter a name for this event"
      },
      {
        "label": "Description",
        "name": "description",
        "type": "textarea"
      },
      {
        "label" : "Does the event meet all the following:",
        "name": "criteria",
        "type": "checkbox",
        "pdf_label": "Meets Required Criteria?",
        "errorMessage": "Must meet the following criteria",
        "pdf": value => value ? 'Yes' : No,
        "message": {
          "title": "",
          "list": [
            "The event occurs within the dates of the semester",
            "The event is outside of Tompkins County",
            "The event is not a retreat or has the sole purpose of team-building",
            "The event is not a social event",
            "The event is not for raising money for profit or charity",
            "The event does not have a primary purpose of conversion/worhsip"
          ]
        }
      },
      {
        "label": "Price Quote (Required only if requesting registration fees)",
        "name": "price_quote",
        "type": "file",
        "accept": "application/pdf",

      },
      {
        "label": "Proof of Event (PDF) (Required)",
        "name": "proof_of_event",
        "type": "file",
        "accept": "application/pdf",
        "errorMessage": "Must have proof of event",
        "message": {
          "title": "",
          "type": "numeric",
          "list": [
            'Date of Event',
            'Location of Event',
            'Event Organizer'
          ]
        }
      },
      {
        "label" : "Miles (One Way)",
        "name": "miles (one way)",
        "type": "number",
        "errorMessage": "must have some amount of miles",
        "pdf": distance => distance + ' mi',
      },
      {
        "label": "Max Funding",
        "name": "max_funding",
        "type": "calculated",
        "monetary": true,
        "function": function(values, allValues, index) {
            var miles = values['miles (one way)']
            if (miles) {
              return Math.round(parseFloat(miles) * 2 * FUNDING_PER_MILE*100)/100
            }
            return 0
        },
      }
      ]
    }
  ],
  "single": []
}
