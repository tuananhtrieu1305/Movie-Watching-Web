#!/bin/bash
echo "Đang khởi động MySQL..."
sudo service mysql start

echo "Đang cấu hình quyền root..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ''; FLUSH PRIVILEGES;"

echo "Đang tạo lại Database và nạp dữ liệu..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS movie_streaming_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root movie_streaming_db < init.sql

echo "Hoàn tất! MySQL đã sẵn sàng."