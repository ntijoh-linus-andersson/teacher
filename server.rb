require 'sinatra'
require 'debug'
require 'dotenv/load'
# use binding.break for debug

class Server < Sinatra::Base

    def initialize
        super
        @db = SQLite3::Database.new('db/teacher.db')
        @db.results_as_hash = true
        Dotenv.load('GitHub-authtoken.env')
    end

    before do
        content_type :json
        headers 'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => ['GET', 'POST']
    end

    set :protection, false

    get '/' do
        "The GitHub Auth Token is: #{ENV['GITHUB_AUTH_TOKEN']}"
        # erb :index
    end

    # get department label by id
    get 'api/fork/:id' do
        # content_type :json
        # @db.execute('SELECT * FROM departments WHERE id = ?', params['id']).first.to_json
    end

    #update
    post '/api/comment/:id' do
        # id = params['id']
        # payload = JSON.parse request.body.read # data sent using fetch is placed in request body
        # content_type :json
        # result = @db.execute('UPDATE employees
        #                       SET name=?, email=?, phone=?, department_id=?, img=?
        #                       WHERE id = ?',
        #                       [payload['name'], payload['email'], payload['phone'], payload['department_id'], payload['img'], id])
        # return {result: 'success'}.to_json
    end
end
