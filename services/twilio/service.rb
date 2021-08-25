require 'cgi'
require 'rubygems'
require 'bundler'
Bundler.require(:default, ENV['RACK_ENV'].to_sym)
Dotenv.load

DB = Sequel.connect(ENV['DATABASE_URL'])
DB.create_table?(:calls) do
  primary_key :id
  String      :sid
  String      :text, text: true
  DateTime    :created_at
  DateTime    :updated_at
  index       :sid
end

class Call < Sequel::Model
  plugin(:timestamps, :update_on_create => true)
  plugin(:validation_helpers)
  plugin(:update_or_create)

  def validate
    super
    validates_presence(:sid)
    validates_unique(:sid)
  end
end

class Service < Sinatra::Base
  not_found { not_found }

  get('/request') do
    # curl -X GET https://host/request?name=John&token=TKXXX
    #
    auth_token!(params['token'])
    if params['name']
      @name = params['name']
      content_type('text/xml')
      erb(:request, :layout => false)  
    else
      bad_request
    end
  end

  post('/response') do
    # curl -X POST https://host/response?token=TKXXX
    #
    auth_token!(params['token'])
    if params['SpeechResult']
      call = Call.first(sid: params['CallSid'])
      call.update({ text: params['SpeechResult'] })
      content_type('text/xml')
      erb(:response, :layout => false)
    else
      bad_request
    end
  end

  post('/') do
    # curl -X POST https://host/?name=John&phone=+34000000000&token=TKXXX
    #
    auth_token!(params['token'])
    if params['name'] && params['phone']
      name  = CGI.escape(params['name'])
      client = Twilio::REST::Client.new(
        ENV['TWILIO_ACCOUNT_SID'],
        ENV['TWILIO_AUTH_TOKEN']
      )
      request = client.calls.create(
        from:   ENV['TWILIO_CALLER_ID'],
        to:     params['phone'],
        url:    "#{ENV['SERVICE_URL']}/request?name=#{name}&token=#{ENV['SERVICE_TOKEN']}",
        method: 'GET',
        record: true
      )
      Call.create({ sid: request.sid })
      content_type('application/json')
      halt(202, "{\"sid\": \"#{request.sid}\"}")
    else
      bad_request
    end
  end

  get('/') do
    # curl -X GET https://host/?sid=SIDXXX&token=TKXXX
    #
    auth_token!(params['token'])
    if params['sid']
      # SELECT text FROM calls WHERE sid = ? AND text IS NOT NULL
      call = Call.where(sid: params['sid']).where(Sequel.~(text: nil)).first
      p call
      if call
        json(text: call[:text])
      else
        not_found
      end
    else
      bad_request
    end
  end

private

  def auth_token!(token)
    unless token && token == ENV['SERVICE_TOKEN']
      unauthorized
    end
  end

  def unauthorized
    content_type('application/json')
    halt(401, '{"status": 401}')
  end

  def ok
    content_type('text/plain')
    halt(200, '{"status": 200}')
  end
  
  def accepted
    content_type('application/json')
    halt(202, '{"status": 202}')
  end

  def bad_request
    content_type('application/json')
    halt(400, '{"status": 400}')
  end

  def not_found
    content_type('application/json')
    halt(404, '{"status": 404}')
  end

  def internal_server_error
    content_type('application/json')
    halt(500, '{"status": 500}')
  end
end
