import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import session from 'express-session';
import passport from 'passport';
import dns from 'dns';

// Fix lỗi DNS ECONNREFUSED cho MongoDB Atlas trên một số nhà mạng/máy tính
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
import { Server } from 'socket.io';
import adminRoutes from "./routes/admin/index.route";
import { connectDB } from './configs/database.config';
import { initSocket } from './sockets/index.socket';
import { configGooglePassport } from './configs/googleOauth.config';
import { configureFacebookPassport } from './configs/facebookOauth.config';

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Gắn io vào global và khởi tạo socket bên Server
(global as any).io = io;
initSocket(io);

const port: number = 3000

// Kết nối CSDL và khởi tạo các dịch vụ
const startServer = async () => {
    try {
        await connectDB();

        // Khởi tạo OAuth passport sau khi đã có kết nối DB
        await configGooglePassport(passport);
        await configureFacebookPassport(passport);

        server.listen(port, () => {
            console.log(`Website đang chạy trên cổng ${port}`);
        });
    } catch (error) {
        console.error("Lỗi khi khởi động server:", error);
    }
};

// Cho phép gửi data lên dạng json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(cors({
    origin: true,
    credentials: true
}));

// Cấu hình session
app.use(session({
    secret: `${process.env.SESSION_SECRET || 'teddy_pet_secret'}`,
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Cấu hình routes
app.use('/api/v1/admin', adminRoutes);

startServer();

