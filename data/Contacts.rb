#!/usr/bin/env ruby

require 'rubygems'
require 'faker'

Faker::Config.locale = 'en-US'

contacts = Array.new

200.times do |i|
contact = <<-CONTACT
{
    "attributes": {
      "type": "Contact",
      "referenceId": "ContactRef#{i+1}"
    },
    "FirstName": "#{Faker::Name.first_name}",
    "LastName": "#{Faker::Name.last_name}",
    "Email": "#{Faker::Internet.email}",
    "Title": "#{Faker::Job.title}",
    "Address__c": "#{Faker::Address.full_address}",
    "Phone": "#{Faker::PhoneNumber.cell_phone}"
  },
CONTACT
contacts << contact.strip!
end

contacts = contacts.join("\n").strip[0..-1]

contacts = <<-CONTACTS
{
  "records": [
    #{contacts}
  ]
}    
CONTACTS

File.open('Contacts.json', 'w') { |file| file.write(contacts.strip!) }
