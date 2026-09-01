import Fastify from "fastify";
(BigInt.prototype as any).toJSON=function(){return this.toString()};
import cookie from "@fastify/cookie";import cors from "@fastify/cors";
import {authRoutes} from "./routes/auth";import {marketplaceRoutes} from "./routes/marketplace";import {walletRoutes} from "./routes/wallet";import {adminRoutes} from "./routes/admin";import {accountRoutes} from "./routes/account";
const app=Fastify({logger:true});await app.register(cookie);await app.register(cors,{origin:process.env.WEB_ORIGIN??"http://localhost:3000",credentials:true});
app.setErrorHandler((err,req,reply)=>{req.log.error(err);const status=(err as any).statusCode??500;return reply.code(status).send({error:{code:status>=500?"INTERNAL_ERROR":"REQUEST_ERROR",message:status>=500?"Something went wrong.":err.message}})});
app.get("/health",async()=>({ok:true,service:"propulse-api"}));await app.register(authRoutes,{prefix:"/v1/auth"});await app.register(marketplaceRoutes,{prefix:"/v1/marketplace"});await app.register(walletRoutes,{prefix:"/v1/wallet"});await app.register(accountRoutes,{prefix:"/v1/account"});await app.register(adminRoutes,{prefix:"/v1/admin"});
await app.listen({port:Number(process.env.API_PORT??4000),host:"0.0.0.0"});
