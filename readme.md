## Installation

- Download Zip (Unzip) / Clone Via Git
- Enter the folder name in terminal
- copy .env.example to .env
- composer install
- bun install
- php artisan key:generate
- adjust the .env
- make sure create database first

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db
DB_USERNAME=root
DB_PASSWORD=

- after save, php artisan migrate:fresh --seed
- to running, open 2 new terminal for same folder
- php artisan serve --port=80 (terminal 1)
- bun run dev (terminal 2)
- open localhost
- admin@gmail.com, password