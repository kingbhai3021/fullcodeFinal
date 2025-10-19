import express from 'express';
import {
    CreateUser,
    GetAllUsers,
    DeleteUserById,
    UpdateUserById,
    GetUserById,
    TotalMessagesOfUser,
    DeleteAllMessagesOfUser,
    AdminLogin
} from '../admin/AdminBasic.js';
import { AdminMiddleware } from '../middleware/usersMiddleware.js';

const AdminRouter = express.Router();

AdminRouter.post("/AdminLogin", AdminLogin);
AdminRouter.post("/CreateUser", AdminMiddleware, CreateUser);
AdminRouter.get("/GetAllUsers", AdminMiddleware, GetAllUsers);
AdminRouter.delete("/DeleteUser/:_id", AdminMiddleware, DeleteUserById);
AdminRouter.put("/UpdateUser/:_id", AdminMiddleware, UpdateUserById);
AdminRouter.get("/GetUser/:_id", AdminMiddleware, GetUserById);
AdminRouter.get("/TotalMessagesOfUser/:_id", AdminMiddleware, TotalMessagesOfUser);
AdminRouter.delete("/DeleteAllMessagesOfUser/:_id", AdminMiddleware, DeleteAllMessagesOfUser);


export default AdminRouter;