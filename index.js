import dotenv from 'dotenv';
dotenv.config();
import express, { Router } from 'express';
import session from 'express-session';
import cors from "cors";
import bodyParser from 'body-parser'
import connectDB from './Db/db.js';
import router from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swagger from './Docs/swagger.json' assert {type:"json"}
// import cookieParser from 'cookie-parser';




const corsOptions ={
    allowedHeaders: ["Authorization", "Content-Type" ],
    methods: ["GET", "POST", "PUT", "UPDATE", "DELETE"],
    origin:"*",
};


const app = express();
app.use(express.json()); 
app.use(cors());
// app.use(express.json());
app.use(bodyParser.json());
app.use(session({
    secret: `${process.env.SESSION_SECRET}`, // Replace with a secure random string (used to sign the session ID cookie)
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true if using HTTPS
  }));
// app.use(cookieParser());

app.use('/', router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));

const httpServer = http.createServer(app);

// Set up Socket.io server
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('sendMessage', async (data) => {
        // Call the message controller to handle sending the message
        const newMessage = await messageController.createMessage(data);
        // Emit the message to the receiver
        io.emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
});

const Server = async () => {
    try {
        await connectDB();
        httpServer.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

// Start the server
Server();