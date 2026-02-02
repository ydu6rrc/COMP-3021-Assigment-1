import * as readline from "readline";
import * as mysql from "mysql";
import { exec } from "child_process";
import * as http from "http";

// based on comment 1
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "mydb",
};

function getUserInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter your name: ", (answer) => {
      rl.close();
      // 2 fixed
      const validatedInput = answer.replace(/[^a-zA-Z0-9 ]/g, "");
      resolve(validatedInput);
    });
  });
}

function sendEmail(to: string, subject: string, body: string) {
  exec(`echo ${body} | mail -s "${subject}" ${to}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error sending email: ${error}`);
    }
  });
}

function getData(): Promise<string> {
  // fixed based on comment 4
  const apiUrl = process.env.API_URL || "https://secure-api.com/get-data";
  return new Promise((resolve, reject) => {
    https
      .get(apiUrl, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function saveToDb(data: string) {
  const connection = mysql.createConnection(dbConfig);
  // fixed based on comment 5
  const query = "INSERT INTO mytable (column1, column2) VALUES (?, ?)";

  connection.connect();
  connection.query(query, [data, "Another Value"], (error) => {
    if (error) {
      console.error("Error executing query:", error);
    } else {
      console.log("Data saved");
    }
    connection.end();
  });
}

(async () => {
  // fixed based on comment 3
  const targetEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const userInput = await getUserInput();
  const data = await getData();
  saveToDb(data);
  sendEmail(targetEmail, "User Input", userInput);
})();
