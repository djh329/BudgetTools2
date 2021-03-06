import {
  ADMIN,
  ADMIN_CAP,
  ADMIN_FAQ
} from '../constants'

export const admin = {
  "name": ADMIN,
  "title": "Administrative Expenses",
  "save_text": "Save To Budget",
  "max": ADMIN_CAP,
  "repeat": [
    {
      "addButton": "Add Administrative Expense",
      "defaultTriggerText": "Admin. Expense",
      "name": "admin_expenses",
      "removeButton": "Remove Expense",
      "values": [
        {
        "label" : "Name of Expense",
        "max": 60,
        "name": "name",
        "errorMessage": "Enter a name for this expense",
        },
        {
          "label": "Description",
          "name": "description",
          "type": "textarea"
        },
        {
          "label": "Price",
          "name": "price",
          "monetary": true,
          "type": "number",
          "errorMessage": "Must give price for this expense"
        }
      ]
    }
  ],

  "links": [
    {
      "label": "Administrative FAQ",
      "link": ADMIN_FAQ
    }
  ],
}
