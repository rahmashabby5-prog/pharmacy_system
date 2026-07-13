import pymysql

def initialize_database():
    host = '127.0.0.1'
    user = 'root'
    password = ''
    db_name = 'pharmacy_pms_db'
    
    print(f"Connecting to MySQL server at {host} as user '{user}'...")
    
    try:
        # Connect without specifying a database
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password
        )
        
        try:
            with connection.cursor() as cursor:
                # Create database
                sql = f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
                cursor.execute(sql)
                print(f"Success: Database '{db_name}' checked/created successfully.")
            connection.commit()
        finally:
            connection.close()
            
    except Exception as e:
        print(f"Error connecting to MySQL: {str(e)}")
        print("Please make sure XAMPP is running and the MySQL module is active.")

if __name__ == '__main__':
    initialize_database()
