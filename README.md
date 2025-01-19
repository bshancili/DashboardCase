# Project Setup

## Prerequisites
This application uses Node.js, run the following command to see whether Node.js is installed in your computer:
``` 
node --version
```

## Installation
### Clone the repository
Start by cloning the repository to your local machine:
``` 
git clone https://github.com/bshancili/DashboardCase.git
cd DashboardCase
```

### Install dependencies for the server
Then, on the root folder, install the required dependencies:
``` 
npm install express mongoose cors dotenv
```

### Install dependencies for the client
Afterwards, navigate to the ```client``` folder and install the necessary packages for the frontend:
``` 
cd client
npm install
```

### Configurate environment variables
On the ```.env``` file, replace ```DB_URL``` with the MongoDB URL provided. It should look like this:
```
DB_URL=your-mongodb-connection-url-here
```

## Running the Application
### Run the server and client separately
In the ```server``` folder, run the following command to start the server:
```
node server.js
```
And on the ```client``` folder, run the following command to start the client:
```
npm start
```

### Run both the server and client from the root folder
Alternatively, on the root folder, you can run both the server and the client together:
```
npm start
```
This will start both the server and client concurrently.
