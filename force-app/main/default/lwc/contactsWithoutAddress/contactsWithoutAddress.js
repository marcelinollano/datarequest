import { LightningElement, wire, track, api } from "lwc";
import { updateRecord, getRecordNotifyChange } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import getContacts from "@salesforce/apex/ContactController.getContacts";
import ID_FIELD from "@salesforce/schema/Contact.Id";
import ADDRESS_FIELD from "@salesforce/schema/Contact.Address__c";
import invoke from "@salesforce/apex/FunctionController.invoke";

export default class TrailblazerList extends LightningElement {
  @wire(getContacts) contacts;
  @api functionName = "phone";
  result;

  handleCall(event) {
    const contactId = event.currentTarget.dataset.contactId;
    const contactName = event.currentTarget.dataset.contactName;
    const contactPhone = event.currentTarget.dataset.contactPhone;

    event.currentTarget.label = "Dialing contact…";
    event.currentTarget.iconName = "utility:outbound_call";
    event.currentTarget.disabled = true;
    event.preventDefault();

    (async () => {
      let fields = await invoke({
        functionName: `datarequest.${this.functionName}`,
        payload: `{"id": "${contactId}", "name": "${contactName}", "phone": "${contactPhone}"}`
      })
        .then((result) => {
          const contact = JSON.parse(result);
          const fields = {};
          fields[ID_FIELD.fieldApiName] = contact["id"];
          fields[ADDRESS_FIELD.fieldApiName] = contact["address"];
          return fields;
        })
        .catch((error) => {
          console.log(error);
          return false;
        });

      let success = await updateRecord({ fields })
        .then(() => {
          return true;
        })
        .catch((error) => {
          console.log(error);
          return false;
        });

      if (success) {
        const toast = new ShowToastEvent({
          title: `${contactName} address was updated!`,
          message: `${fields[ADDRESS_FIELD.fieldApiName]}`,
          variant: "success",
          mode: "pester"
        });
        this.dispatchEvent(toast);
        refreshApex(this.contacts);
      } else {
        const toast = new ShowToastEvent({
          title: "Error",
          message: "Something went wrong!",
          variant: "error"
        });
        this.dispatchEvent(toast);
      }
    })();
  }

  handleLink(event) {
    window.location = `/lightning/r/Contact/${event.currentTarget.dataset.contactId}/view`;
    event.preventDefault();
  }
}
