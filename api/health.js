import { handleApi } from '../server/handler.js';
export default function handler(req,res){req.url='/api/health';return handleApi(req,res);}
