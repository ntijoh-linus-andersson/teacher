require 'sqlite3'

class Seeder

	def self.seed!
			drop_tables
			create_tables
	end

	def self.db
			if @db == nil
					@db = SQLite3::Database.new('./db/db.sqlite')
					@db.results_as_hash = true
			end
			return @db
	end

	def self.drop_tables
			db.execute('DROP TABLE IF EXISTS fork-feedback')
			db.execute('DROP TABLE IF EXISTS users')
	end

	def self.create_tables
			db.execute('CREATE TABLE fork-feedback(
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					repository TEXT NOT NULL,
					fork TEXT NOT NULL,
					comment TEXT NOT NULL,
					grade TEXT NOT NULL
			)')
			db.execute('CREATE TABLE users(
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					username TEXT NOT NULL,
					password TEXT NOT NULL,
					teacher BOOLEAN
			)')
	end

end