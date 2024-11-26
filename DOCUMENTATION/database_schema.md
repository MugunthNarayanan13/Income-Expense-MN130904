# Schema for Income and Expenses

## Income

| Field Name | Type   | Description                                         |
|------------|--------|-----------------------------------------------------|
| id         | String | Unique identifier for each income record (generated). |
| amount     | Number | Income amount.                                       |
| date       | Date   | The date of the income entry.                       |
| category   | String | Category of income (e.g., Salary, Bonus, Investments). |
| month      | String | Extracted from date, for easier querying (e.g., "January"). |
| year       | Number | Extracted from date, for easier querying (e.g., 2024). |
| means      | String | Method of income (e.g., Bank Transfer, Cash, etc.).  |
| note       | String | Optional field for additional information. Default is `null` if not specified. |



## Expenses

| Field Name     | Type    | Description                                         |
|----------------|---------|-----------------------------------------------------|
| id             | String  | Unique identifier for each expense record (generated). |
| amount         | Number  | Expense amount.                                      |
| date           | Date    | The date of the expense entry.                      |
| category       | String  | Category of expense (e.g., Food, Rent, Travel).     |
| specific_name  | String  | A specific name for the expense (e.g., "Lunch at XYZ"). |
| month          | String  | Extracted from date, for easier querying (e.g., "January"). |
| year           | Number  | Extracted from date, for easier querying (e.g., 2024). |
| means          | String  | Method of payment (e.g., Credit Card, Cash).        |
| recurring field| Boolean | If some expenses are regular (e.g., Rent, Subscription). Default `0` if not specified. |
| note           | String | Optional field for additional information. Default is `null` if not specified. |


## Notes on Design

- The `month` and `year` fields are included for easier filtering and querying based on time periods.
- The `note` field is optional but recommended for adding any extra context to a transaction. If not specified, it will default to `null`.
- Recurring expenses can be flagged with the `recurring` field, which is useful for subscription services, rent, and other regular payments.