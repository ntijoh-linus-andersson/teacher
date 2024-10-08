require 'sinatra'
require 'sqlite3'
require 'json'
require 'debug'
require 'dotenv/load'
require 'httparty'

# use binding.break for debug

class Server < Sinatra::Base

    def initialize
        super
        @db = SQLite3::Database.new('db/teacher.db')
        @db.results_as_hash = true
        Dotenv.load('GitHub-authtoken.env')
    end

    before do
        headers 'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => ['GET', 'POST']
    end

    set :protection, false

    get '/' do
        "The GitHub Auth Token is: #{ENV['GITHUB_AUTH_TOKEN']}"
        
        erb :index
    end

    # Endpoint to get forks of a specific GitHub repository
    get '/api/forks/:owner/:repo' do
        owner = params['owner']  # Local variable for owner
        repo = params['repo']    # Local variable for repo

        # Construct the API request URL
        url = "https://api.github.com/repos/#{owner}/#{repo}/forks"
    
        # Perform the API request
        response = HTTParty.get(
            url,
            headers: {
                "Accept" => "application/vnd.github+json",
                "Authorization" => "Bearer #{ENV['GITHUB_AUTH_TOKEN']}",  # Use environment variable for the token
                "X-GitHub-Api-Version" => "2022-11-28"
            }
        )
    
        # Check for a successful response
        if response.success?
            forks = response.parsed_response  # Parse the JSON response
            forks.to_json  # Return the response as JSON
        else
            status response.code  # Set the response status to the response code from GitHub
            { error: response.parsed_response['message'] }.to_json  # Return an error message as JSON
        end
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
