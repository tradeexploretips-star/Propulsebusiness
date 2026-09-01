import { scryptSync, timingSafeEqual, randomBytes, createHash } from "node:crypto";
import { db } from "@propulse/db";
export const passwordHash=(password:string)=>scryptSync(password,process.env.PASSWORD_SALT??"dev-only-change-me",64).toString("hex");
export const passwordVerify=(password:string,hash:string)=>{const a=scryptSync(password,process.env.PASSWORD_SALT??"dev-only-change-me",64),b=Buffer.from(hash,"hex");return b.length===a.length&&timingSafeEqual(a,b)};
const tokenHash=(t:string)=>createHash("sha256").update(t).digest("hex");
export async function createSession(userId:string,meta?:{userAgent?:string;ipAddress?:string}){const raw=randomBytes(32).toString("base64url");await db.session.create({data:{userId,tokenHash:tokenHash(raw),expiresAt:new Date(Date.now()+30*86400000),...meta}});return raw}
export async function currentUser(token?:string){if(!token)return null;const s=await db.session.findUnique({where:{tokenHash:tokenHash(token)},include:{user:{include:{roles:{include:{role:true}},profile:true,memberships:{where:{status:"ACTIVE"},orderBy:{endsAt:"desc"},take:1}}}});if(!s||s.expiresAt<new Date()||s.user.status!=="ACTIVE")return null;return s.user}
export const hasRole=(u:any,roles:string[])=>u?.roles?.some((r:any)=>roles.includes(r.role.name));
export const requireUser=async(req:any)=>{const u=await currentUser(req.cookies[process.env.SESSION_COOKIE??"propulse_session"]);if(!u){const e=new Error("Authentication required");(e as any).statusCode=401;throw e}return u};
export const requireAdmin=async(req:any)=>{const u=await requireUser(req);if(!hasRole(u,["SUPER_ADMIN","ADMIN","OPERATIONS"])){const e=new Error("Administrator access required");(e as any).statusCode=403;throw e}return u};
export const cookieOptions={httpOnly:true,sameSite:"lax" as const,secure:process.env.NODE_ENV==="production",path:"/"};
