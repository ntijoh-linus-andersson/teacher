require 'sqlite3'

class Seeder

	def self.seed!
			drop_tables
			create_tables
			insert_default_data
	end

	def self.db
			if @db == nil
					@db = SQLite3::Database.new('./db/teacher.db')
					@db.results_as_hash = true
			end
			return @db
	end

	def self.drop_tables
			db.execute('DROP TABLE IF EXISTS fork_feedback')
			db.execute('DROP TABLE IF EXISTS users')
	end

	def self.create_tables
			db.execute('CREATE TABLE fork_feedback(
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					repository TEXT NOT NULL,
					owner TEXT NOT NULL,
					comment TEXT NOT NULL,
					grade TEXT NOT NULL
			)')
			db.execute('CREATE TABLE users(
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					username TEXT NOT NULL,
					password TEXT NOT NULL
			)')
	end

	def self.insert_default_data
    db.execute "INSERT INTO users (username, password) VALUES (?, ?)", 
               ['Daniel', 'grillkorv']
    puts "Default teacher user inserted."
  end

end

Seeder.seed!