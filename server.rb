require 'sinatra'
require 'sqlite3'
require 'json'
require 'debug'
require 'dotenv/load'
require 'httparty'

class Server < Sinatra::Base
    enable :sessions
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

  # Home route
  get '/' do
    access_token = session[:access_token]
    if access_token == nil
        redirect '/login'
    else
        erb :index
    end
  end

  get '/login' do
    access_token = session[:access_token]
    if access_token != nil
        redirect '/'
    else
        erb :login
    end
  end

  # GitHub OAuth - Step 1: Redirect to GitHub for Authorization
  get '/auth/github' do
    github_client_id = ENV['GITHUB_CLIENT_ID']
    redirect_uri = "http://localhost:9292/callback"
    scope = "user repo"

    redirect "https://github.com/login/oauth/authorize?client_id=#{github_client_id}&redirect_uri=#{redirect_uri}&scope=#{scope}"
  end

  # GitHub OAuth - Step 2: Handle GitHub's Callback and Exchange Code for Token
  get '/callback' do
    code = params['code'] 

    # Exchange the authorization code for an access token
    uri = URI("https://github.com/login/oauth/access_token")
    res = Net::HTTP.post_form(uri, {
      'client_id' => ENV['GITHUB_CLIENT_ID'],
      'client_secret' => ENV['GITHUB_CLIENT_SECRET'],
      'code' => code
    })

    # Parse the response to extract the access token
    response_params = URI.decode_www_form(res.body).to_h

    if response_params['access_token']
      session[:access_token] = response_params['access_token']  # Store access token in session
      redirect '/'
    else
      halt 500, "Failed to retrieve access token: #{response_params['error_description'] || 'Unknown error'}"
    end
  end

  # Logout route
get '/logout' do
    session.clear  # Clear the session data
    redirect '/login'  # Redirect to the login page
  end
  

  # Protected route: Fetch user info from GitHub using the access token
#   get '/profile' do
#     access_token = session[:access_token]
#     halt 401, "Unauthorized" unless access_token

#     # Use access token to fetch user data from GitHub
#     response = HTTParty.get(
#       "https://api.github.com/user",
#       headers: { "Authorization" => "token #{access_token}", "User-Agent" => "Sinatra-App" }
#     )

#     if response.code == 200
#       user_data = response.parsed_response
#       erb :profile, locals: { user_data: user_data }
#     else
#       halt 500, "Failed to fetch user information: #{response.parsed_response['message'] || 'Unknown error'}"
#     end
#   end

  # Endpoint to get repos of a specific GitHub repository
  get '/api/repos/:owner' do
    owner = params['owner']  # Local variable for owner
    
    # Correct the API request URL
    url = "https://api.github.com/users/#{owner}/repos"
    
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
      repos = response.parsed_response  # Parse the JSON response
      repos.to_json  # Return the response as JSON
    else
      status response.code  # Set the response status to the response code from GitHub
      { error: response.parsed_response['message'] }.to_json  # Return an error message as JSON
    end
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

    # Endpoint to get forks of a specific GitHub repository
    get '/api/forks/:owner/:repo/*' do
        owner = params['owner']  # Capture the owner
        repo = params['repo']    # Capture the repo
        filePath = params['splat'].first  # Capture the full file path

    # Construct the API request URL
    url = "https://api.github.com/repos/#{owner}/#{repo}/contents/#{filePath}"
    
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
      content = response.parsed_response  # Parse the JSON response
      content.to_json  # Return the response as JSON
    else
      status response.code  # Set the response status to the response code from GitHub
      { error: response.parsed_response['message'] }.to_json  # Return an error message as JSON
    end
  end

  # Route to add grade and comment for a specific fork/repository
  post '/api/feedback' do
    # Parse the incoming JSON payload
    payload = JSON.parse(request.body.read)

    # Extract the necessary data from the payload
    repository = payload['repository']
    fork = payload['fork']
    comment = payload['comment']
    grade = payload['grade']

    # Ensure all required data is present
    if repository && fork && comment && grade
      # Insert the feedback into the database
      @db.execute('INSERT INTO fork_feedback (repository, fork, comment, grade) VALUES (?, ?, ?, ?)',
                  [repository, fork, comment, grade])
      
      # Return a success response
      { status: 'success', message: 'Feedback submitted successfully' }.to_json
    else
      # If any data is missing, return an error
      status 400
      { status: 'error', message: 'Missing required parameters' }.to_json
    end
  end

  # Fetch user info from GitHub using the access token
get '/api/user' do
    access_token = session[:access_token]
    halt 401, "Unauthorized" unless access_token
  
    # Use access token to fetch user data from GitHub
    response = HTTParty.get(
      "https://api.github.com/user",
      headers: { "Authorization" => "token #{access_token}", "User-Agent" => "Sinatra-App" }
    )
  
    if response.code == 200
      user_data = response.parsed_response
      { username: user_data['login'] }.to_json  # Return only the username as JSON
    else
      halt 500, "Failed to fetch user information: #{response.parsed_response['message'] || 'Unknown error'}"
    end
  end
  

end
