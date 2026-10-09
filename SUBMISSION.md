# Submission

**Candidate name:** Vladislav Kukov
**Date:** Oct 9, 2026
**Time spent:** ~ 4 Hours

---

## Completed Tasks

Check off what you finished:

- [x] Task 1 — Create Product
- [x] Task 2 — Update Variant
- [x] Task 3 — Fix soft-delete bug
- [x] Task 4 — Loading & error states
- [x] Task 5 — Input validation

---

## Approach & Decisions

_Briefly describe the approach you took for each task. Mention any trade-offs you made or alternative approaches you considered._

### Task 1
For the front-end I built an intuitive form which allows a user to fill out the fields necessary for storage in the database. Additionally, I added a separate section as part of the same form to fill out information about the variants. A minimum of one variant is needed but as many as needed can be added by clicking a plus which appends (using a new list) a variant to the collection. There are some error checks implemented as well to inspect for required values and any duplicate SKUs within the submission before it is sent to the server. The price is input as dollars but then converted to cents on submission (perhaps doing it earlier may help avoid errors for the user). I also made the choice to keep the user on the page rather than redirecting to make adding multiple products quick and simple.

On the backend the POST implementation uses the expected shape to combine the product and variant add into one transaction. As a result, there are no products created without their needed variants. The code also has secondary checks to ensure all of the values are valid including checking that values are not null and greater than 0. Additionally this also includes a relevant error message for when a duplicate SKU is found.

### Task 2
The edit button has been implemented to switch from displaying numbers to being changeable fields instead. Depending whether it is in the edit state, the same box shows different options. I did consider a modal for this but decided it was more intuitive to have the fields in place and since there were only two fields to edit the space wasn't needed. When the edit button is pressed the there is a save and cancel button for when the user wants to make a decision. Both of these buttons become disabled when an update is on the way so no potentially conflicting or duplicate requests are possible. On any error, a message is displayed depending on what occured and the user is given an opportunity to try again. Errors can come from front-end validation, checks before the PUT request or from the server.

The first step for the backed is to check whether the product exists by looking and retrieving the table matching the id of the variant to be changed. The shape of the request can vary as any number of row values can be sent or excluded. This was a necessary choice since this method is likely to be used for various purposes in the hypothetical future and not just the updating of the price and count. I did omit the checks for the sku and name though as those requirements are not completely known as of now. As a result the updates are also done using COALESCE in order to preserve values which aren't changed. I did consider using individual SET updates in case a column needed to be set null but that doesn't seem to be needed for variants.   

### Task 3
This was one of the simpler tasks where only a minor change was needed. I did consider excluding those with a non-null deleted_at value on the front end or manually integrating it into the query. Although the front-end would may have worked it would require unnecessary imports from the database. In the end I found the conditions list in the GET products method and added the exclusion to there in order to omit those products in a quick and simple way. 

### Task 4
I have implemented the different product page states by checking for errors on every input and creating a load screen at the beginning. This allows for a user to see that something is indeed loading if they have a slow connection. It also displays the relevant error so they can potentially act on it by either fixing something or reporting it to someone who can. The error checking was implemented for every query but only shows the results for the latest by cancelling previous requests if there is a new one. I made sure to keep the filter sections visible to the user and only display the loading/error in the product section so they could still make changes to their query which may potentially fix it.

### Task 5
Validation was primarily discussed in parts 1 and 2. Where possible I validated as quickly as possible to avoid any unnecessary compute and time wasted. Checks were done at the front-end to avoid passing them to the backend methods. Checks were done at the backend methods to avoid sending them to the server.
---

## What I'd improve with more time

There are a couple UX factors I would improve with additional time. I would ensure that the product page is dynamically updated and the numbers change as soon as the request is made. I'd also implement the loading on the product page for every new query rather than just on the initial download since larger databases may take longer to filter. 

---

## Anything else?

Nothing significant I've noticed but I'd like to mention that I enjoyed working on this assignment and thought it was very well designed!