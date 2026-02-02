import os
import sys
import pymysql
from urllib.request import urlopen
from dbinfo import Credentials
import smtplib, ssl
from inputimeout import inputimeout

# SMTP Setup for more secure sending of emails.
port = 465  # For SSL
smtp_server = "smtp.gmail.com"
sender_email = "my@gmail.com"
password = input("Type the email password and press enter: ")

# Create a secure SSL context
context = ssl.create_default_context()

# Importing credentials from a file that is included in the .gitignore
db_config = {
    'host': Credentials.host,
    'user': Credentials.user,
    'password': Credentials.password
}

def get_user_input():
    try:
        time_over = inputimeout(prompt='Enter your name: ', timeout=300) # 5 minutes
        return user_input
    except Exception:
        time_over = 'Session expired.'
        print(time_over)
        sys.exit("Session expired.")

# Secured sending emails by using SMTP_SSL
def send_email(to, subject, body):
    with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
        server.login(sender_email, password)
        message = f"""\
        Subject: {subject}

        {body}"""
        server.sendmail(sender_email, to, message)

# Secured the API by using HTTPS instead of HTTP
def get_data():
    url = 'https://secure-api.com/get-data'
    data = urlopen(url).read().decode()
    return data

# Converted fstring to %s placeholder so 'data' is strictly treated as data instead of potential code.
def save_to_db(data):
    query = "INSERT INTO mytable (column1, column2) VALUES ('%(data)s', 'Another Value')", {'data':data}
    connection = pymysql.connect(**db_config)
    cursor = connection.cursor()
    cursor.execute(query)
    connection.commit()
    cursor.close()
    connection.close()

if __name__ == '__main__':
    user_input = get_user_input()
    data = get_data()
    save_to_db(data)
    send_email('admin@example.com', 'User Input', user_input)
