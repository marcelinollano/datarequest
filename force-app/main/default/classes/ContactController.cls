public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        List<Contact> contacts = [
            SELECT Id, Name, Title, Phone
            FROM Contact
            WHERE Address__c = NULL
            WITH SECURITY_ENFORCED ORDER BY Name
        ];

        if(!contacts.isEmpty()){
            return contacts;
        }else{
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Integer> stats() {

        List<Integer> results = new List<Integer>();

        Integer pending = [
            SELECT COUNT()
            FROM Contact
            WHERE Address__c = NULL
            WITH SECURITY_ENFORCED
        ];

        Integer completed =  [
            SELECT COUNT()
            FROM Contact
            WHERE Address__c != NULL
            WITH SECURITY_ENFORCED
        ];

        results.add(completed);
        results.add(pending);

        return results;
    }
}

